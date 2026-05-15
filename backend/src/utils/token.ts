import jwt, { SignOptions } from "jsonwebtoken";
import crypto from "crypto";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";
import pool from "../config/database";
import { env } from "../config/env";

const BCRYPT_ROUNDS = 12;

export async function generateAndStoreTokens(
  userId: string,
  tokenVersion: number,
  role: string,
  ipAddress?: string,
  userAgent?: string
) {
  const accessJti = uuidv4();
  const refreshJti = uuidv4();

  const fingerprint = crypto
    .createHash("sha256")
    .update(`${ipAddress || ""}${userAgent || ""}`)
    .digest("hex");

  const accessToken = jwt.sign(
    {
      userId,
      tokenVersion,
      jti: accessJti,
      fingerprint,
      role,
      keyVersion: parseInt(process.env.ACTIVE_JWT_VERSION || "1"),
    },
    env.jwt.secret,
    { expiresIn: env.jwt.expiry } as SignOptions
  );
  const refreshToken = jwt.sign(
    { userId, tokenVersion, jti: refreshJti },
    env.jwt.refreshSecret,
    { expiresIn: env.jwt.refreshExpiry } as SignOptions
  );

  // Store session in DB
  const hashedToken = await bcrypt.hash(refreshToken, BCRYPT_ROUNDS);
  await pool.query(
    `INSERT INTO user_sessions (user_id, refresh_token_hash, ip, user_agent)
     VALUES ($1, $2, $3, $4)`,
    [userId, hashedToken, ipAddress || null, userAgent || null]
  );
  // Legacy hash update (compatibility)
  await pool.query("UPDATE users SET refresh_token_hash = $1 WHERE id = $2", [
    hashedToken,
    userId,
  ]);

  return { accessToken, refreshToken };
}