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
const stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY || "");
const authService = new auth_service_1.AuthService();
const otpService = new otp_service_1.OtpService();
class AuthController {
    async register(req, res, next) {
        try {
            const { nationalId, firstName, lastName, email, phoneNumber, password, dateOfBirth, gender, occupation, region, district, address, idType, idNumber, drivingLicenseNumber, proofOfAddressType, stripeVerificationId, parentName, parentNationalId, parentPhone, } = req.body;
            const result = await authService.register({
                nationalId,
                firstName,
                lastName,
                email,
                phoneNumber,
                password,
                dateOfBirth,
                gender,
                occupation,
                region,
                district,
                address,
                idType,
                idNumber,
                drivingLicenseNumber,
                proofOfAddressType,
                stripeVerificationId,
                parentName,
                parentNationalId,
                parentPhone,
                ipAddress: req.ip,
                userAgent: req.headers["user-agent"],
            });
            return (0, response_1.successResponse)(res, result, "Registration successful", 201);
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
            return (0, response_1.successResponse)(res, result, "Login successful");
        }
        catch (error) {
            next(error);
        }
    }
    async refreshToken(req, res, next) {
        try {
            const { refreshToken } = req.body;
            const tokens = await authService.refreshToken(refreshToken, req.ip, req.headers["user-agent"]);
            return (0, response_1.successResponse)(res, tokens, "Token refreshed");
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
            await otpService.verifyOtp(userId, code);
            // Set the step‑up timestamp after successful verification
            await database_1.default.query("UPDATE users SET last_sensitive_auth_at = NOW() WHERE id = $1", [userId]);
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
}
exports.AuthController = AuthController;
//# sourceMappingURL=auth.controller.js.map