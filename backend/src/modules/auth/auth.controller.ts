import { Request, Response, NextFunction } from "express";
import { AuthService } from "./auth.service";
import { OtpService } from "./otp.service";
import { successResponse } from "../../utils/response";
import Stripe from "stripe";
import { AppError } from "../../utils/errors";
import pool from "../../config/database";
import { registerSchema, RegisterInput } from "./register.schema";
import { verifyTurnstile } from "../../utils/turnstile";
import { hashField } from "../../utils/encryption";
import logger from "../../utils/logger";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");
const authService = new AuthService();
const otpService = new OtpService();

function setRefreshCookie(res: Response, token: string) {
  res.cookie("refreshToken", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 24 * 60 * 60 * 1000,
    path: "/api/v1/auth",
  });
}

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = registerSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new AppError(
          "Validation failed: " +
            parsed.error.issues.map((i) => i.message).join("; "),
          400,
        );
      }
      const data: RegisterInput = parsed.data;

      if (data.turnstileToken) {
        const valid = await verifyTurnstile(data.turnstileToken);
        if (!valid) throw new AppError("CAPTCHA verification failed", 400);
      } else {
        if (process.env.NODE_ENV === "production") {
          throw new AppError("CAPTCHA token required", 400);
        }
      }

      if (data.stripeVerificationId) {
        try {
          const session = await stripe.identity.verificationSessions.retrieve(
            data.stripeVerificationId,
          );
          if (session.status !== "verified") {
            throw new AppError("Identity not verified by Stripe", 400);
          }
        } catch (err) {
          throw new AppError("Invalid Stripe verification ID", 400);
        }
      }

      const user = await authService.registerUnverified({
        ...data,
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
      });

      return successResponse(
        res,
        {
          user: {
            id: user.id,
            fullName: user.fullName,
            role: user.role,
          },
        },
        "Registration successful. Please verify your email or phone to activate your account.",
        201,
      );
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

      setRefreshCookie(res, result.refreshToken);

      return successResponse(
        res,
        {
          user: result.user,
          accessToken: result.accessToken,
        },
        "Login successful",
      );
    } catch (error) {
      next(error);
    }
  }

  async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.cookies?.refreshToken;
      if (!token) {
        throw new AppError("Refresh token missing", 401);
      }

      const tokens = await authService.refreshToken(
        token,
        req.ip,
        req.headers["user-agent"],
      );

      setRefreshCookie(res, tokens.refreshToken);

      return successResponse(
        res,
        {
          accessToken: tokens.accessToken,
        },
        "Token refreshed",
      );
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

      res.clearCookie("refreshToken", { path: "/api/v1/auth" });

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

      const tokens = await otpService.verifyOtp(
        userId,
        code,
        req.ip,
        req.headers["user-agent"],
      );

      await pool.query(
        "UPDATE users SET last_sensitive_auth_at = NOW() WHERE id = $1",
        [userId],
      );

      if (tokens.accessToken && tokens.refreshToken) {
        setRefreshCookie(res, tokens.refreshToken);

        const user = await pool.query(
          "SELECT id, full_name, role FROM users WHERE id = $1",
          [userId],
        );
        return successResponse(
          res,
          {
            user: user.rows[0],
            accessToken: tokens.accessToken,
          },
          "OTP verified successfully. Account activated.",
        );
      }

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

  async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.userId;
      const profile = await authService.getProfile(userId);
      return successResponse(res, { user: profile });
    } catch (error) {
      next(error);
    }
  }

  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, phoneNumber } = req.body;
      const type = email ? "email" : "phone";
      const identifier = email || phoneNumber;

      if (!identifier) {
        return next(
          new AppError("Please provide an email or phone number", 400),
        );
      }

      const hash = hashField(identifier);
      let user;
      if (type === "email") {
        user = await pool.query("SELECT id FROM users WHERE email_hash = $1", [
          hash,
        ]);
      } else {
        user = await pool.query("SELECT id FROM users WHERE phone_hash = $1", [
          hash,
        ]);
      }

      if (user.rows.length > 0) {
        await authService.forgotPassword(identifier, type);
        logger.info(`[DEV PASSWORD RESET] OTP sent to ${type}: ${identifier}`);
      } else {
        // Debug log to confirm no matching user
        logger.info(
          `[DEV PASSWORD RESET] No user found for ${type}: ${identifier}`,
        );
      }

      return successResponse(
        res,
        { message: "If that account exists, a reset code has been sent." },
        "Reset code sent",
      );
    } catch (error) {
      return successResponse(
        res,
        { message: "If that account exists, a reset code has been sent." },
        "Reset code sent",
      );
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, phoneNumber, code, newPassword } = req.body;
      const identifier = email || phoneNumber;
      if (!identifier || !code || !newPassword) {
        return next(new AppError("All fields are required", 400));
      }

      const result = await otpService.verifyPasswordResetOtp(identifier, code);
      if (!result.valid || !result.userId) {
        throw new AppError("Invalid or expired reset code", 400);
      }

      await authService.updatePassword(result.userId, newPassword);

      return successResponse(res, null, "Password has been reset successfully");
    } catch (error) {
      next(error);
    }
  }
}
