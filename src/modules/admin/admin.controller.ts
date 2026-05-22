import { Request, Response, NextFunction } from 'express';
import { successResponse } from '../../utils/response';
import pool from '../../config/database';
import { decrypt } from '../../utils/encryption';
import logger from '../../utils/logger';   // optional but good for consistency
import { AppError } from '@/utils/errors';

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

export const getUserRegistrationDetails = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;
    // Fetch user with plain fields
    const userRes = await pool.query(
      `SELECT id, full_name, email_plain as email, phone_plain as phone, national_id_plain as national_id,
              date_of_birth, gender, occupation, region, district, address,
              id_type, id_number, driving_license_number, proof_of_address_type,
              stripe_verification_id, created_at, approval_status
       FROM users
       WHERE id = $1`,
      [userId]
    );
    if (userRes.rows.length === 0) throw new AppError("User not found", 404);
    const user = userRes.rows[0];

    // Fetch uploaded documents (assuming a `user_documents` table)
    const docsRes = await pool.query(
      `SELECT document_type, file_url, uploaded_at
       FROM user_documents
       WHERE user_id = $1`,
      [userId]
    );

    return successResponse(res, { user, documents: docsRes.rows });
  } catch (error) {
    next(error);
  }
};

export const getSessions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = `
      SELECT
        us.id,                     
        us.user_id,
        u.full_name,
        u.email,
        u.role,
        us.ip,
        us.user_agent,
        us.created_at,
        us.last_activity,
        us.is_revoked
      FROM user_sessions us
      JOIN users u ON us.user_id = u.id
      ORDER BY us.last_activity DESC
    `;

    const result = await pool.query(query);

    const sessions = result.rows.map(row => ({
      ...row,
      email: decrypt(row.email) || row.email,
    }));

    return successResponse(res, sessions);
  } catch (error) {
    next(error);
  }
};

// Add revoke session function
export const revokeSession = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `UPDATE user_sessions SET is_revoked = true WHERE id = $1 RETURNING *`,
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    logger.info('Session revoked by admin', { sessionId: id });
    return successResponse(res, { id }, 'Session revoked successfully');
  } catch (error) {
    next(error);
  }
};

export const getPendingUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await pool.query(
      `SELECT id, full_name, email, phone, national_id, created_at, approval_status
       FROM users
       WHERE approval_status = 'pending'
       ORDER BY created_at ASC`
    );
    // Decode sensitive fields? Not necessary for admin review – just show identifiers
    const users = result.rows.map(u => ({
      id: u.id,
      fullName: u.full_name,
      email: u.email,
      phone: u.phone,
      nationalId: u.national_id,
      createdAt: u.created_at,
      approvalStatus: u.approval_status,
    }));
    return successResponse(res, users);
  } catch (error) {
    next(error);
  }
};

export const approveUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;
    const result = await pool.query(
      `UPDATE users SET approval_status = 'approved', updated_at = NOW()
       WHERE id = $1 AND approval_status = 'pending'
       RETURNING id, full_name, approval_status`,
      [userId]
    );
    if (result.rows.length === 0) {
      throw new AppError('User not found or already processed', 404);
    }
    // Optionally: send email notification to user
    return successResponse(res, result.rows[0], 'User approved successfully');
  } catch (error) {
    next(error);
  }
};

export const rejectUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;
    const result = await pool.query(
      `UPDATE users SET approval_status = 'rejected', updated_at = NOW()
       WHERE id = $1 AND approval_status = 'pending'
       RETURNING id, full_name, approval_status`,
      [userId]
    );
    if (result.rows.length === 0) {
      throw new AppError('User not found or already processed', 404);
    }
    return successResponse(res, result.rows[0], 'User rejected');
  } catch (error) {
    next(error);
  }
};