"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTaxpayerDetail = exports.getTaxpayers = void 0;
const response_1 = require("../../utils/response");
const database_1 = __importDefault(require("../../config/database"));
const encryption_1 = require("../../utils/encryption");
const getTaxpayers = async (req, res, next) => {
    try {
        const { search = '', region = '', page = '1', limit = '20' } = req.query;
        const offset = (Number(page) - 1) * Number(limit);
        // Base query – join users with taxpayer_profiles (role = taxpayer)
        let queryStr = `
      SELECT u.id, u.full_name, u.phone, u.email, u.national_id,
             tp.region, tp.district, tp.occupation, tp.monthly_income,
             tp.property_value, tp.verified, u.created_at
      FROM users u
      LEFT JOIN taxpayer_profiles tp ON u.id = tp.user_id
      WHERE u.role = 'taxpayer'
    `;
        const params = [];
        if (search) {
            const s = `%${search}%`;
            queryStr += ` AND (u.full_name ILIKE $${params.length + 1} OR u.phone ILIKE $${params.length + 1} OR u.email ILIKE $${params.length + 1} OR u.national_id ILIKE $${params.length + 1})`;
            params.push(s);
        }
        if (region) {
            queryStr += ` AND tp.region ILIKE $${params.length + 1}`;
            params.push(region);
        }
        // Count total
        const countResult = await database_1.default.query(`SELECT COUNT(*) FROM (${queryStr}) AS cnt`, params);
        queryStr += ` ORDER BY u.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
        params.push(Number(limit), offset);
        const { rows } = await database_1.default.query(queryStr, params);
        // Decrypt sensitive fields
        const taxpayers = rows.map(row => ({
            ...row,
            phone: (0, encryption_1.decrypt)(row.phone),
            email: (0, encryption_1.decrypt)(row.email),
            national_id: (0, encryption_1.decrypt)(row.national_id),
        }));
        return (0, response_1.successResponse)(res, {
            taxpayers,
            total: parseInt(countResult.rows[0].count, 10),
            page: Number(page),
            limit: Number(limit),
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getTaxpayers = getTaxpayers;
const getTaxpayerDetail = async (req, res, next) => {
    try {
        const { userId } = req.params;
        // User
        const userRes = await database_1.default.query('SELECT * FROM users WHERE id = $1 AND role = $2', [userId, 'taxpayer']);
        if (userRes.rows.length === 0)
            return next({ statusCode: 404, message: 'Taxpayer not found' });
        const userRow = userRes.rows[0];
        const user = {
            ...userRow,
            phone: (0, encryption_1.decrypt)(userRow.phone),
            email: (0, encryption_1.decrypt)(userRow.email),
            national_id: (0, encryption_1.decrypt)(userRow.national_id),
        };
        // Profile
        const profileRes = await database_1.default.query('SELECT * FROM taxpayer_profiles WHERE user_id = $1', [userId]);
        const profile = profileRes.rows[0] || null;
        // Tax summary
        const summaryRes = await database_1.default.query(`
      SELECT
        COALESCE(SUM(CASE WHEN status IN ('unpaid','partially_paid','overdue') THEN amount ELSE 0 END), 0) AS total_due,
        COALESCE(SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END), 0) AS total_paid,
        COUNT(CASE WHEN status IN ('unpaid','partially_paid') THEN 1 END) AS pending,
        COUNT(CASE WHEN status = 'overdue' THEN 1 END) AS overdue,
        COUNT(CASE WHEN status = 'paid' THEN 1 END) AS paid
      FROM tax_assessments WHERE user_id = $1
    `, [userId]);
        const taxSummary = summaryRes.rows[0] || { total_due: 0, total_paid: 0, pending: 0, overdue: 0, paid: 0 };
        // Assessments
        const assessmentsRes = await database_1.default.query('SELECT * FROM tax_assessments WHERE user_id = $1 ORDER BY year DESC', [userId]);
        const assessments = assessmentsRes.rows;
        // Payments
        const paymentsRes = await database_1.default.query('SELECT * FROM payments WHERE user_id = $1 ORDER BY created_at DESC LIMIT 10', [userId]);
        const payments = paymentsRes.rows;
        // Documents
        const documentsRes = await database_1.default.query('SELECT * FROM documents WHERE user_id = $1', [userId]);
        const documents = documentsRes.rows;
        // Disputes
        const disputesRes = await database_1.default.query('SELECT * FROM tax_disputes WHERE user_id = $1', [userId]);
        const disputes = disputesRes.rows;
        return (0, response_1.successResponse)(res, {
            user,
            profile,
            taxSummary,
            assessments,
            payments,
            documents,
            disputes,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getTaxpayerDetail = getTaxpayerDetail;
//# sourceMappingURL=admin.controller.js.map