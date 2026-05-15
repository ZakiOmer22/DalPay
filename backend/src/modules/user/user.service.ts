// modules/user/user.service.ts
import pool from "../../config/database";
import bcrypt from "bcryptjs";
import { AppError } from "../../utils/errors";

export class UserService {
  async getProfile(userId: string): Promise<any> {
    const result = await pool.query(
      `SELECT id, full_name, email, phone, role, region, district, occupation,
              email_verified, phone_verified, created_at
       FROM users WHERE id = $1`,
      [userId]
    );
    if (result.rows.length === 0) throw new AppError("User not found", 404);

    const user = result.rows[0];
    return {
      id: user.id,
      fullName: user.full_name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      region: user.region,
      district: user.district,
      occupation: user.occupation,
      emailVerified: user.email_verified,
      phoneVerified: user.phone_verified,
      memberSince: user.created_at,
    };
  }

  async updateProfile(userId: string, data: { occupation?: string; region?: string; district?: string }): Promise<any> {
    const fields: string[] = [];
    const params: any[] = [userId];
    let idx = 2;

    if (data.occupation !== undefined) {
      fields.push(`occupation = $${idx++}`);
      params.push(data.occupation);
    }
    if (data.region !== undefined) {
      fields.push(`region = $${idx++}`);
      params.push(data.region);
    }
    if (data.district !== undefined) {
      fields.push(`district = $${idx++}`);
      params.push(data.district);
    }

    if (fields.length === 0) throw new AppError("No fields to update", 400);
    await pool.query(`UPDATE users SET ${fields.join(", ")} WHERE id = $1`, params);
    return this.getProfile(userId);
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const result = await pool.query("SELECT password_hash FROM users WHERE id = $1", [userId]);
    if (result.rows.length === 0) throw new AppError("User not found", 404);

    const hash = result.rows[0].password_hash;
    const valid = await bcrypt.compare(currentPassword, hash);
    if (!valid) throw new AppError("Current password is incorrect", 401);

    const newHash = await bcrypt.hash(newPassword, 12);
    await pool.query("UPDATE users SET password_hash = $1 WHERE id = $2", [newHash, userId]);
  }
}