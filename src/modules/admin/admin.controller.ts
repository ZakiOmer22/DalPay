import { Request, Response, NextFunction } from 'express';
import { successResponse } from '../../utils/response';
import pool from '../../config/database';
import { decrypt } from '../../utils/encryption';

export const getTaxpayers = async (req: Request, res: Response, next: NextFunction) => {
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
    const params: any[] = [];

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
    const countResult = await pool.query(`SELECT COUNT(*) FROM (${queryStr}) AS cnt`, params);

    queryStr += ` ORDER BY u.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(Number(limit), offset);

    const { rows } = await pool.query(queryStr, params);

    // Decrypt sensitive fields
    const taxpayers = rows.map(row => ({
      ...row,
      phone: decrypt(row.phone),
      email: decrypt(row.email),
      national_id: decrypt(row.national_id),
    }));

    return successResponse(res, {
      taxpayers,
      total: parseInt(countResult.rows[0].count, 10),
      page: Number(page),
      limit: Number(limit),
    });
  } catch (error) {
    next(error);
  }
};

export const getTaxpayerDetail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;

    // User
    const userRes = await pool.query('SELECT * FROM users WHERE id = $1 AND role = $2', [userId, 'taxpayer']);
    if (userRes.rows.length === 0) return next({ statusCode: 404, message: 'Taxpayer not found' });

    const userRow = userRes.rows[0];
    const user = {
      ...userRow,
      phone: decrypt(userRow.phone),
      email: decrypt(userRow.email),
      national_id: decrypt(userRow.national_id),
    };

    // Profile
    const profileRes = await pool.query('SELECT * FROM taxpayer_profiles WHERE user_id = $1', [userId]);
    const profile = profileRes.rows[0] || null;

    // Tax summary
    const summaryRes = await pool.query(`
      SELECT
        COALESCE(SUM(CASE WHEN status IN ('unpaid','partially_paid','overdue') THEN amount ELSE 0 END), 0) AS total_due,
        COALESCE(SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END), 0) AS total_paid,
        COUNT(CASE WHEN status IN ('unpaid','partially_paid') THEN 1 END) AS pending,
        COUNT(CASE WHEN status = 'overdue' THEN 1 END) AS overdue,
        COUNT(CASE WHEN status = 'paid' THEN 1 END) AS paid
      FROM tax_assessments WHERE user_id = $1
    `, [userId]);

    const taxSummary = summaryRes.rows[0] || { total_due:0, total_paid:0, pending:0, overdue:0, paid:0 };

    // Assessments
    const assessmentsRes = await pool.query('SELECT * FROM tax_assessments WHERE user_id = $1 ORDER BY year DESC', [userId]);
    const assessments = assessmentsRes.rows;

    // Payments
    const paymentsRes = await pool.query('SELECT * FROM payments WHERE user_id = $1 ORDER BY created_at DESC LIMIT 10', [userId]);
    const payments = paymentsRes.rows;

    // Documents
    const documentsRes = await pool.query('SELECT * FROM documents WHERE user_id = $1', [userId]);
    const documents = documentsRes.rows;

    // Disputes
    const disputesRes = await pool.query('SELECT * FROM tax_disputes WHERE user_id = $1', [userId]);
    const disputes = disputesRes.rows;

    return successResponse(res, {
      user,
      profile,
      taxSummary,
      assessments,
      payments,
      documents,
      disputes,
    });
  } catch (error) {
    next(error);
  }
};