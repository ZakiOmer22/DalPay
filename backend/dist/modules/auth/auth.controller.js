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
const turnstile_1 = require("../../utils/turnstile");
const encryption_1 = require("../../utils/encryption");
const logger_1 = __importDefault(require("../../utils/logger"));
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
            const parsed = register_schema_1.registerSchema.safeParse(req.body);
            if (!parsed.success) {
                throw new errors_1.AppError("Validation failed: " +
                    parsed.error.issues.map((i) => i.message).join("; "), 400);
            }
            const data = parsed.data;
            if (data.turnstileToken) {
                const valid = await (0, turnstile_1.verifyTurnstile)(data.turnstileToken);
                if (!valid)
                    throw new errors_1.AppError("CAPTCHA verification failed", 400);
            }
            else {
                if (process.env.NODE_ENV === "production") {
                    throw new errors_1.AppError("CAPTCHA token required", 400);
                }
            }
            if (data.stripeVerificationId) {
                try {
                    const session = await stripe.identity.verificationSessions.retrieve(data.stripeVerificationId);
                    if (session.status !== "verified") {
                        throw new errors_1.AppError("Identity not verified by Stripe", 400);
                    }
                }
                catch (err) {
                    throw new errors_1.AppError("Invalid Stripe verification ID", 400);
                }
            }
            const user = await authService.registerUnverified({
                ...data,
                ipAddress: req.ip,
                userAgent: req.headers["user-agent"],
            });
            return (0, response_1.successResponse)(res, {
                user: {
                    id: user.id,
                    fullName: user.fullName,
                    role: user.role,
                },
            }, "Registration successful. Please verify your email or phone to activate your account.", 201);
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
                // Debug log to confirm no matching user
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
}
exports.AuthController = AuthController;
//# sourceMappingURL=auth.controller.js.map