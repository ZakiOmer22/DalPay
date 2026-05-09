import { Request, Response, NextFunction } from "express";
import { AuthService } from "./auth.service";
import { OtpService } from "./otp.service";
import { successResponse } from "../../utils/response";
import Stripe from "stripe";
import { AppError } from "../../utils/errors";
import pool from "../../config/database";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");
const authService = new AuthService();
const otpService = new OtpService();

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const {
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
      } = req.body;

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

      return successResponse(res, result, "Registration successful", 201);
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { nationalId, email, phoneNumber, password } = req.body;
      const identifier = email || phoneNumber || nationalId;

      if (!identifier) {
        return next(
          new AppError("Provide an email, phone number, or National ID", 400),
        );
      }

      const result = await authService.login(
        identifier,
        password,
        req.ip,
        req.headers["user-agent"],
      );
      return successResponse(res, result, "Login successful");
    } catch (error) {
      next(error);
    }
  }

  async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;
      const tokens = await authService.refreshToken(
        refreshToken,
        req.ip,
        req.headers["user-agent"],
      );
      return successResponse(res, tokens, "Token refreshed");
    } catch (error) {
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.userId;
      const authHeader = req.headers.authorization;
      const accessToken = authHeader?.split(" ")[1] || "";
      await authService.logout(userId, accessToken);
      return successResponse(res, null, "Logout successful");
    } catch (error) {
      next(error);
    }
  }

  async sendOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.userId;
      const { type } = req.body;
      if (!["email", "phone"].includes(type)) {
        throw new AppError("Type must be email or phone", 400);
      }
      const result = await otpService.sendOtp(userId, type);
      return successResponse(res, result, "OTP sent");
    } catch (error) {
      next(error);
    }
  }

  async verifyOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.userId;
      const { code } = req.body;
      await otpService.verifyOtp(userId, code);

      // Set the step‑up timestamp after successful verification
      await pool.query(
        "UPDATE users SET last_sensitive_auth_at = NOW() WHERE id = $1",
        [userId]
      );

      return successResponse(res, null, "OTP verified successfully");
    } catch (error) {
      next(error);
    }
  }

  async createVerificationSession(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { email, firstName, lastName } = req.body;

      const verificationSession =
        await stripe.identity.verificationSessions.create({
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

      return successResponse(
        res,
        {
          verificationUrl: verificationSession.url,
          verificationId: verificationSession.id,
          status: verificationSession.status,
        },
        "Verification session created",
      );
    } catch (error) {
      next(error);
    }
  }

  async checkVerificationStatus(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { sessionId } = req.params;
      const session = await stripe.identity.verificationSessions.retrieve(
        sessionId as string,
      );
      return successResponse(res, {
        status: session.status,
        verified: session.status === "verified",
      });
    } catch (error) {
      next(error);
    }
  }

  async getSessions(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.userId;
      const sessions = await authService.listSessions(userId);
      return successResponse(res, sessions);
    } catch (error) {
      next(error);
    }
  }

  async revokeSession(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.userId;
      const { sessionId } = req.params;
      await authService.revokeSession(userId, sessionId as string);
      return successResponse(res, null, "Session revoked");
    } catch (error) {
      next(error);
    }
  }

  async revokeAllSessions(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.userId;
      await authService.revokeAllSessions(userId);
      return successResponse(res, null, "All sessions revoked");
    } catch (error) {
      next(error);
    }
  }
}