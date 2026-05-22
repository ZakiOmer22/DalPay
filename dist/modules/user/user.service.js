"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
// modules/user/user.service.ts
const database_1 = __importDefault(require("../../config/database"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const errors_1 = require("../../utils/errors");
class UserService {
    async getProfile(userId) {
        const result = await database_1.default.query(`SELECT id, full_name, email, phone, role, region, district, occupation,
              email_verified, phone_verified, created_at
       FROM users WHERE id = $1`, [userId]);
        if (result.rows.length === 0)
            throw new errors_1.AppError("User not found", 404);
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
    async updateProfile(userId, data) {
        const fields = [];
        const params = [userId];
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
        if (fields.length === 0)
            throw new errors_1.AppError("No fields to update", 400);
        await database_1.default.query(`UPDATE users SET ${fields.join(", ")} WHERE id = $1`, params);
        return this.getProfile(userId);
    }
    async changePassword(userId, currentPassword, newPassword) {
        const result = await database_1.default.query("SELECT password_hash FROM users WHERE id = $1", [userId]);
        if (result.rows.length === 0)
            throw new errors_1.AppError("User not found", 404);
        const hash = result.rows[0].password_hash;
        const valid = await bcryptjs_1.default.compare(currentPassword, hash);
        if (!valid)
            throw new errors_1.AppError("Current password is incorrect", 401);
        const newHash = await bcryptjs_1.default.hash(newPassword, 12);
        await database_1.default.query("UPDATE users SET password_hash = $1 WHERE id = $2", [newHash, userId]);
    }
}
exports.UserService = UserService;
//# sourceMappingURL=user.service.js.map