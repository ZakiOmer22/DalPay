import { Request, Response, NextFunction } from "express";
import { successResponse } from "../../utils/response";
import pool from "../../config/database";
import { decrypt } from "../../utils/encryption";
import logger from "../../utils/logger"; // optional but good for consistency
import { AppError } from "@/utils/errors";

export const getTaxpayers = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { search = "", region = "", page = "1", limit = "20" } = req.query;
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
    const countResult = await pool.query(
      `SELECT COUNT(*) FROM (${queryStr}) AS cnt`,
      params,
    );

    queryStr += ` ORDER BY u.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(Number(limit), offset);

    const { rows } = await pool.query(queryStr, params);

    // Decrypt sensitive fields
    const taxpayers = rows.map((row) => ({
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

export const getTaxpayerDetail = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { userId } = req.params;

    // User
    const userRes = await pool.query(
      "SELECT * FROM users WHERE id = $1 AND role = $2",
      [userId, "taxpayer"],
    );
    if (userRes.rows.length === 0)
      return next({ statusCode: 404, message: "Taxpayer not found" });

    const userRow = userRes.rows[0];
    const user = {
      ...userRow,
      phone: decrypt(userRow.phone),
      email: decrypt(userRow.email),
      national_id: decrypt(userRow.national_id),
    };

    // Profile
    const profileRes = await pool.query(
      "SELECT * FROM taxpayer_profiles WHERE user_id = $1",
      [userId],
    );
    const profile = profileRes.rows[0] || null;

    // Tax summary
    const summaryRes = await pool.query(
      `
      SELECT
        COALESCE(SUM(CASE WHEN status IN ('unpaid','partially_paid','overdue') THEN amount ELSE 0 END), 0) AS total_due,
        COALESCE(SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END), 0) AS total_paid,
        COUNT(CASE WHEN status IN ('unpaid','partially_paid') THEN 1 END) AS pending,
        COUNT(CASE WHEN status = 'overdue' THEN 1 END) AS overdue,
        COUNT(CASE WHEN status = 'paid' THEN 1 END) AS paid
      FROM tax_assessments WHERE user_id = $1
    `,
      [userId],
    );

    const taxSummary = summaryRes.rows[0] || {
      total_due: 0,
      total_paid: 0,
      pending: 0,
      overdue: 0,
      paid: 0,
    };

    // Assessments
    const assessmentsRes = await pool.query(
      "SELECT * FROM tax_assessments WHERE user_id = $1 ORDER BY year DESC",
      [userId],
    );
    const assessments = assessmentsRes.rows;

    // Payments
    const paymentsRes = await pool.query(
      "SELECT * FROM payments WHERE user_id = $1 ORDER BY created_at DESC LIMIT 10",
      [userId],
    );
    const payments = paymentsRes.rows;

    // Documents
    const documentsRes = await pool.query(
      "SELECT * FROM documents WHERE user_id = $1",
      [userId],
    );
    const documents = documentsRes.rows;

    // Disputes
    const disputesRes = await pool.query(
      "SELECT * FROM tax_disputes WHERE user_id = $1",
      [userId],
    );
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

export const getUserRegistrationDetails = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
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
      [userId],
    );
    if (userRes.rows.length === 0) throw new AppError("User not found", 404);
    const user = userRes.rows[0];

    // Fetch uploaded documents (assuming a `user_documents` table)
    const docsRes = await pool.query(
      `SELECT document_type, file_url, uploaded_at
       FROM user_documents
       WHERE user_id = $1`,
      [userId],
    );

    return successResponse(res, { user, documents: docsRes.rows });
  } catch (error) {
    next(error);
  }
};

export const getSessions = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
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

    const sessions = result.rows.map((row) => ({
      ...row,
      email: decrypt(row.email) || row.email,
    }));

    return successResponse(res, sessions);
  } catch (error) {
    next(error);
  }
};

// Add revoke session function
export const revokeSession = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `UPDATE user_sessions SET is_revoked = true WHERE id = $1 RETURNING *`,
      [id],
    );

    if (result.rowCount === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Session not found" });
    }

    logger.info("Session revoked by admin", { sessionId: id });
    return successResponse(res, { id }, "Session revoked successfully");
  } catch (error) {
    next(error);
  }
};

export const getPendingVerifications = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await pool.query(
      `SELECT v.id, v.user_id, v.type, v.data, v.created_at, u.full_name, u.email, u.phone
       FROM verification v
       JOIN users u ON v.user_id = u.id
       WHERE v.status = 'pending'
       ORDER BY v.created_at ASC`,
    );
    const verifications = result.rows.map((v) => ({
      id: v.id,
      user_id: v.user_id,
      type: v.type,
      data: v.data,
      created_at: v.created_at,
      full_name: v.full_name,
      email: decrypt(v.email),
      phone: decrypt(v.phone),
    }));
    return successResponse(res, verifications);
  } catch (error) {
    next(error);
  }
};

export const approveVerification = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { verificationId } = req.params;
    const { notes } = req.body;
    const adminId = (req as any).user.userId;

    await pool.query("BEGIN");

    // 1. Get the verification record
    const verifResult = await pool.query(
      `SELECT user_id, type, data FROM verification
       WHERE id = $1 AND status = 'pending'
       FOR UPDATE`,
      [verificationId],
    );
    if (verifResult.rows.length === 0) {
      throw new AppError("Verification not found or already processed", 404);
    }
    const { user_id, type, data } = verifResult.rows[0];

    // 2. Mark verification as approved
    await pool.query(
      `UPDATE verification
       SET status = 'approved', admin_notes = $1, verified_by = $2, verified_at = NOW()
       WHERE id = $3`,
      [notes, adminId, verificationId],
    );

    // 3. Handle tax_profile verification – ensure profile exists and set verified = true
    if (type === "tax_profile") {
      // Check if a taxpayer_profiles row exists
      const existing = await pool.query(
        `SELECT id FROM taxpayer_profiles WHERE user_id = $1`,
        [user_id],
      );

      if (existing.rows.length === 0) {
        // Create profile from the data submitted in verification
        await pool.query(
          `INSERT INTO taxpayer_profiles
            (user_id, occupation, monthly_income, region, district, business_name, business_type, property_value, verified, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true, NOW(), NOW())`,
          [
            user_id,
            data.occupation,
            data.monthly_income,
            data.region,
            data.district,
            data.business_name || null,
            data.business_type || null,
            data.property_value || 0,
          ],
        );
      } else {
        // Update existing profile to verified
        await pool.query(
          `UPDATE taxpayer_profiles
           SET verified = true, updated_at = NOW()
           WHERE user_id = $1`,
          [user_id],
        );
      }
      const currentYear = new Date().getFullYear();
      await generateAssessmentsForUser(user_id, currentYear);
    }

    await pool.query("COMMIT");
    return successResponse(
      res,
      null,
      "Profile verified and assessments generated",
    );
  } catch (error) {
    await pool.query("ROLLBACK").catch(() => {});
    next(error);
  }
};

async function generateAssessmentsForUser(userId: string, year: number) {
  // Get the taxpayer profile
  const profile = await pool.query(
    `SELECT monthly_income, business_type, property_value FROM taxpayer_profiles WHERE user_id = $1`,
    [userId],
  );
  if (profile.rows.length === 0) return;

  const { monthly_income, business_type, property_value } = profile.rows[0];

  // Simple rule-based assessment (customise as needed)
  let incomeTax = 0;
  if (monthly_income) {
    // Example: 10% income tax
    incomeTax = monthly_income * 12 * 0.1;
  }

  let propertyTax = 0;
  if (property_value) {
    // Example: 1% property tax
    propertyTax = property_value * 0.01;
  }

  // Insert assessments
  if (incomeTax > 0) {
    await pool.query(
      `INSERT INTO tax_assessments (user_id, tax_type, amount, year, due_date, status, auto_generated)
       VALUES ($1, 'income_tax', $2, $3, $4, 'unpaid', true)`,
      [userId, incomeTax, year, new Date(year, 11, 31)],
    );
  }
  if (propertyTax > 0) {
    await pool.query(
      `INSERT INTO tax_assessments (user_id, tax_type, amount, year, due_date, status, auto_generated)
       VALUES ($1, 'property_tax', $2, $3, $4, 'unpaid', true)`,
      [userId, propertyTax, year, new Date(year, 11, 31)],
    );
  }
}

export const rejectVerification = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { verificationId } = req.params;
    const { notes } = req.body;
    const adminId = (req as any).user.userId;

    const result = await pool.query(
      `UPDATE verification
       SET status = 'rejected', admin_notes = $1, verified_by = $2, verified_at = NOW()
       WHERE id = $3 AND status = 'pending'
       RETURNING id`,
      [notes, adminId, verificationId],
    );
    if (result.rows.length === 0)
      throw new AppError("Verification not found or already processed", 404);

    return successResponse(res, null, "Verification rejected");
  } catch (error) {
    next(error);
  }
};
