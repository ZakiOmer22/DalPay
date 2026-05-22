"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const auth_service_1 = require("./auth.service");
const otp_service_1 = require("./otp.service");
const response_1 = require("../../utils/response");
const stripe_1 = __importDefault(require("stripe"));
const errors_1 = require("../../utils/errors");
const database_1 = __importDefault(require("../../config/database"));
const register_schema_1 = require("./register.schema");
const recaptcha_1 = require("../../utils/recaptcha");
const encryption_1 = require("../../utils/encryption");
const logger_1 = __importDefault(require("../../utils/logger"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY || "");
const authService = new auth_service_1.AuthService();
const otpService = new otp_service_1.OtpService();
function setRefreshCookie(res, token) {
    res.cookie("refreshToken", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 24 * 60 * 60 * 1000,
        path: "/api/v1/auth",
    });
}
class AuthController {
    async register(req, res, next) {
        try {
            const body = req.body;
            const files = req.files;
            // Build object for validation (matches the schema exactly)
            const schemaData = {
                nationalId: body.nationalId,
                firstName: body.firstName,
                lastName: body.lastName,
                email: body.email,
                phoneNumber: body.phoneNumber,
                password: body.password,
                dateOfBirth: body.dateOfBirth,
                gender: body.gender,
                occupation: body.occupation,
                region: body.region,
                district: body.district,
                address: body.address,
                idType: body.idType,
                idNumber: body.idNumber,
                drivingLicenseNumber: body.drivingLicenseNumber,
                proofOfAddressType: body.proofOfAddressType,
                stripeVerificationId: body.stripeVerificationId,
                recaptchaToken: body.recaptchaToken,
                parentName: body.parentName,
                parentNationalId: body.parentNationalId,
                parentPhone: body.parentPhone,
                agreeToTerms: body.agreeToTerms === "true",
                isUnder18: body.isUnder18 === "true",
            };
            // Validate with Zod schema
            const parsed = register_schema_1.registerSchema.safeParse(schemaData);
            if (!parsed.success) {
                throw new errors_1.AppError("Validation failed: " +
                    parsed.error.issues.map((i) => i.message).join("; "), 400);
            }
            // reCAPTCHA verification
            if (schemaData.recaptchaToken) {
                const valid = await (0, recaptcha_1.verifyRecaptcha)(schemaData.recaptchaToken);
                if (!valid)
                    throw new errors_1.AppError("reCAPTCHA verification failed", 400);
            }
            else if (process.env.NODE_ENV === "production") {
                throw new errors_1.AppError("reCAPTCHA token required", 400);
            }
            // Stripe verification check
            if (schemaData.stripeVerificationId) {
                try {
                    const session = await stripe.identity.verificationSessions.retrieve(schemaData.stripeVerificationId);
                    if (session.status !== "verified") {
                        throw new errors_1.AppError("Identity not verified by Stripe", 400);
                    }
                }
                catch (err) {
                    throw new errors_1.AppError("Invalid Stripe verification ID", 400);
                }
            }
            // Prepare data for the service (only fields expected by registerUnverified)
            const serviceData = {
                nationalId: schemaData.nationalId,
                firstName: schemaData.firstName,
                lastName: schemaData.lastName,
                email: schemaData.email,
                phoneNumber: schemaData.phoneNumber,
                password: schemaData.password,
                dateOfBirth: schemaData.dateOfBirth,
                gender: schemaData.gender,
                occupation: schemaData.occupation,
                region: schemaData.region,
                district: schemaData.district,
                address: schemaData.address,
                idType: schemaData.idType,
                idNumber: schemaData.idNumber,
                drivingLicenseNumber: schemaData.drivingLicenseNumber,
                proofOfAddressType: schemaData.proofOfAddressType,
                stripeVerificationId: schemaData.stripeVerificationId,
                parentName: schemaData.parentName,
                parentNationalId: schemaData.parentNationalId,
                parentPhone: schemaData.parentPhone,
                ipAddress: req.ip,
                userAgent: req.headers["user-agent"],
            };
            // Note: file buffers are not passed – they are not needed for user creation
            // If you need them later, store them separately (e.g., in a document_uploads table)
            const user = await authService.registerUnverified(serviceData);
            return (0, response_1.successResponse)(res, {
                user: {
                    id: user.id,
                    fullName: user.fullName,
                    role: user.role,
                },
            }, "Registration successful. Your account is pending admin approval.", 201);
        }
        catch (error) {
            next(error);
        }
    }
    async login(req, res, next) {
        try {
            const { nationalId, email, phoneNumber, password } = req.body;
            const identifier = email || phoneNumber || nationalId;
            if (!identifier) {
                return next(new errors_1.AppError("Provide an email, phone number, or National ID", 400));
            }
            // Determine which hash column to use
            let hashColumn;
            if (email) {
                hashColumn = "email_hash";
            }
            else if (phoneNumber) {
                hashColumn = "phone_hash";
            }
            else {
                hashColumn = "national_id_hash";
            }
            // Hash the identifier exactly as it was stored
            const hashedIdentifier = (0, encryption_1.hashField)(identifier);
            // Query by the hashed column
            const userResult = await database_1.default.query(`SELECT id, approval_status, role, full_name, email_verified, phone_verified 
       FROM users 
       WHERE ${hashColumn} = $1`, [hashedIdentifier]);
            if (userResult.rows.length === 0) {
                throw new errors_1.AppError("Invalid credentials", 401);
            }
            const user = userResult.rows[0];
            // Check approval status
            if (user.approval_status !== "approved") {
                throw new errors_1.AppError("Your account is pending admin approval. You will be notified once approved.", 403);
            }
            // Proceed with login (service expects plain identifier and will handle password)
            const result = await authService.login(identifier, password, req.ip, req.headers["user-agent"]);
            setRefreshCookie(res, result.refreshToken);
            return (0, response_1.successResponse)(res, {
                user: result.user,
                accessToken: result.accessToken,
            }, "Login successful");
        }
        catch (error) {
            next(error);
        }
    }
    async refreshToken(req, res, next) {
        try {
            const token = req.cookies?.refreshToken;
            if (!token) {
                throw new errors_1.AppError("Refresh token missing", 401);
            }
            const tokens = await authService.refreshToken(token, req.ip, req.headers["user-agent"]);
            setRefreshCookie(res, tokens.refreshToken);
            return (0, response_1.successResponse)(res, {
                accessToken: tokens.accessToken,
            }, "Token refreshed");
        }
        catch (error) {
            next(error);
        }
    }
    async logout(req, res, next) {
        try {
            const userId = req.user.userId;
            const authHeader = req.headers.authorization;
            const accessToken = authHeader?.split(" ")[1] || "";
            await authService.logout(userId, accessToken);
            // Mark the session as expired in the database
            await database_1.default.query(`UPDATE user_sessions 
         SET expires_at = NOW() 
         WHERE user_id = $1 AND expires_at IS NULL`, [userId]);
            res.clearCookie("refreshToken", { path: "/api/v1/auth" });
            return (0, response_1.successResponse)(res, null, "Logout successful");
        }
        catch (error) {
            next(error);
        }
    }
    async sendOtp(req, res, next) {
        try {
            const userId = req.user.userId;
            const { type } = req.body;
            if (!["email", "phone"].includes(type)) {
                throw new errors_1.AppError("Type must be email or phone", 400);
            }
            const result = await otpService.sendOtp(userId, type);
            return (0, response_1.successResponse)(res, result, "OTP sent");
        }
        catch (error) {
            next(error);
        }
    }
    async verifyOtp(req, res, next) {
        try {
            const userId = req.user.userId;
            const { code } = req.body;
            const tokens = await otpService.verifyOtp(userId, code, req.ip, req.headers["user-agent"]);
            await database_1.default.query("UPDATE users SET last_sensitive_auth_at = NOW() WHERE id = $1", [userId]);
            if (tokens.accessToken && tokens.refreshToken) {
                setRefreshCookie(res, tokens.refreshToken);
                const user = await database_1.default.query("SELECT id, full_name, role FROM users WHERE id = $1", [userId]);
                return (0, response_1.successResponse)(res, {
                    user: user.rows[0],
                    accessToken: tokens.accessToken,
                }, "OTP verified successfully. Account activated.");
            }
            return (0, response_1.successResponse)(res, null, "OTP verified successfully");
        }
        catch (error) {
            next(error);
        }
    }
    async createVerificationSession(req, res, next) {
        try {
            const { email, firstName, lastName } = req.body;
            const verificationSession = await stripe.identity.verificationSessions.create({
                type: "document",
                options: {
                    document: {
                        allowed_types: ["id_card", "passport", "driving_license"],
                        require_matching_selfie: true,
                    },
                },
                metadata: {
                    full_name: `${firstName} ${lastName}`,
                    email: email || "",
                },
            });
            return (0, response_1.successResponse)(res, {
                verificationUrl: verificationSession.url,
                verificationId: verificationSession.id,
                status: verificationSession.status,
            }, "Verification session created");
        }
        catch (error) {
            next(error);
        }
    }
    async checkVerificationStatus(req, res, next) {
        try {
            const { sessionId } = req.params;
            const session = await stripe.identity.verificationSessions.retrieve(sessionId);
            return (0, response_1.successResponse)(res, {
                status: session.status,
                verified: session.status === "verified",
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getSessions(req, res, next) {
        try {
            const userId = req.user.userId;
            const sessions = await authService.listSessions(userId);
            return (0, response_1.successResponse)(res, sessions);
        }
        catch (error) {
            next(error);
        }
    }
    async revokeSession(req, res, next) {
        try {
            const userId = req.user.userId;
            const { sessionId } = req.params;
            await authService.revokeSession(userId, sessionId);
            return (0, response_1.successResponse)(res, null, "Session revoked");
        }
        catch (error) {
            next(error);
        }
    }
    async revokeAllSessions(req, res, next) {
        try {
            const userId = req.user.userId;
            await authService.revokeAllSessions(userId);
            return (0, response_1.successResponse)(res, null, "All sessions revoked");
        }
        catch (error) {
            next(error);
        }
    }
    async getProfile(req, res, next) {
        try {
            const userId = req.user.userId;
            const profile = await authService.getProfile(userId);
            return (0, response_1.successResponse)(res, { user: profile });
        }
        catch (error) {
            next(error);
        }
    }
    async forgotPassword(req, res, next) {
        try {
            const { email, phoneNumber } = req.body;
            const type = email ? "email" : "phone";
            const identifier = email || phoneNumber;
            if (!identifier) {
                return next(new errors_1.AppError("Please provide an email or phone number", 400));
            }
            const hash = (0, encryption_1.hashField)(identifier);
            let user;
            if (type === "email") {
                user = await database_1.default.query("SELECT id FROM users WHERE email_hash = $1", [
                    hash,
                ]);
            }
            else {
                user = await database_1.default.query("SELECT id FROM users WHERE phone_hash = $1", [
                    hash,
                ]);
            }
            if (user.rows.length > 0) {
                await authService.forgotPassword(identifier, type);
                logger_1.default.info(`[DEV PASSWORD RESET] OTP sent to ${type}: ${identifier}`);
            }
            else {
                logger_1.default.info(`[DEV PASSWORD RESET] No user found for ${type}: ${identifier}`);
            }
            return (0, response_1.successResponse)(res, { message: "If that account exists, a reset code has been sent." }, "Reset code sent");
        }
        catch (error) {
            return (0, response_1.successResponse)(res, { message: "If that account exists, a reset code has been sent." }, "Reset code sent");
        }
    }
    async resetPassword(req, res, next) {
        try {
            const { email, phoneNumber, code, newPassword } = req.body;
            const identifier = email || phoneNumber;
            if (!identifier || !code || !newPassword) {
                return next(new errors_1.AppError("All fields are required", 400));
            }
            const result = await otpService.verifyPasswordResetOtp(identifier, code);
            if (!result.valid || !result.userId) {
                throw new errors_1.AppError("Invalid or expired reset code", 400);
            }
            await authService.updatePassword(result.userId, newPassword);
            return (0, response_1.successResponse)(res, null, "Password has been reset successfully");
        }
        catch (error) {
            next(error);
        }
    }
    async sendPublicVerificationCode(req, res, next) {
        try {
            const { identifier, method } = req.body;
            if (!identifier || !method)
                throw new errors_1.AppError("Identifier and method required", 400);
            const type = method;
            const hash = (0, encryption_1.hashField)(identifier.trim());
            let user;
            if (type === "email") {
                user = await database_1.default.query("SELECT id, email FROM users WHERE email_hash = $1", [hash]);
            }
            else {
                user = await database_1.default.query("SELECT id, phone FROM users WHERE phone_hash = $1", [hash]);
            }
            if (user.rows.length === 0) {
                return (0, response_1.successResponse)(res, null, "If the account exists, a verification code has been sent.");
            }
            const userId = user.rows[0].id;
            const contact = type === "email" ? user.rows[0].email : user.rows[0].phone;
            if (!contact) {
                return (0, response_1.successResponse)(res, null, "No contact information found.");
            }
            const code = Math.floor(100000 + Math.random() * 900000).toString();
            const isDev = process.env.NODE_ENV === "development";
            const codeToStore = isDev ? code : await bcryptjs_1.default.hash(code, 12);
            const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
            await database_1.default.query("INSERT INTO otp_codes (user_id, code, type, expires_at) VALUES ($1, $2, $3, $4)", [userId, codeToStore, type, expiresAt]);
            if (isDev) {
                logger_1.default.info(`[DEV VERIFY] ${type}: ${contact} -> ${code}`);
            }
            else {
                // send real email or SMS here if needed
            }
            return (0, response_1.successResponse)(res, null, "If the account exists, a verification code has been sent.");
        }
        catch (error) {
            next(error);
        }
    }
    async verifyPublicCode(req, res, next) {
        try {
            const { identifier, method, code } = req.body;
            if (!identifier || !method || !code)
                throw new errors_1.AppError("Missing fields", 400);
            const type = method;
            const hash = (0, encryption_1.hashField)(identifier.trim());
            let user;
            if (type === "email") {
                user = await database_1.default.query("SELECT id FROM users WHERE email_hash = $1", [
                    hash,
                ]);
            }
            else {
                user = await database_1.default.query("SELECT id FROM users WHERE phone_hash = $1", [
                    hash,
                ]);
            }
            if (user.rows.length === 0)
                throw new errors_1.AppError("Invalid verification request", 400);
            const userId = user.rows[0].id;
            const otp = await database_1.default.query(`SELECT id, code FROM otp_codes
       WHERE user_id = $1 AND type = $2 AND used = FALSE AND expires_at > NOW()
       ORDER BY created_at DESC LIMIT 1`, [userId, type]);
            if (otp.rows.length === 0)
                throw new errors_1.AppError("No valid verification code found", 400);
            const isDev = process.env.NODE_ENV === "development";
            const valid = isDev
                ? otp.rows[0].code === code
                : await bcryptjs_1.default.compare(code, otp.rows[0].code);
            if (!valid)
                throw new errors_1.AppError("Incorrect verification code", 400);
            await database_1.default.query("UPDATE otp_codes SET used = TRUE WHERE id = $1", [
                otp.rows[0].id,
            ]);
            if (type === "email") {
                await database_1.default.query("UPDATE users SET email_verified = TRUE WHERE id = $1", [userId]);
            }
            else {
                await database_1.default.query("UPDATE users SET phone_verified = TRUE WHERE id = $1", [userId]);
            }
            logger_1.default.info(`User ${userId} ${type} verified via public endpoint`);
            return (0, response_1.successResponse)(res, null, "Account verified. You can now log in.");
        }
        catch (error) {
            next(error);
        }
    }
}
exports.AuthController = AuthController;
//# sourceMappingURL=auth.controller.js.map