import pool from '../../config/database';

export class DashboardService {
  async getOverview() {
    const [revenueResult, outstandingResult, userResult] = await Promise.all([
      pool.query(
        `SELECT COALESCE(SUM(amount), 0) as total_revenue
         FROM payments WHERE status = 'confirmed'`
      ),
      pool.query(
        `SELECT COALESCE(SUM(amount), 0) as total_outstanding
         FROM tax_assessments WHERE status IN ('unpaid', 'partially_paid', 'overdue')`
      ),
      pool.query(
        `SELECT
           COUNT(*) FILTER (WHERE role = 'taxpayer') as total_taxpayers,
           COUNT(*) FILTER (WHERE role = 'admin') as total_admins,
           COUNT(*) as total_users
         FROM users`
      ),
    ]);

    const fraudResult = await pool.query(
      `SELECT COUNT(*) FILTER (WHERE flagged = TRUE) as flagged,
              COUNT(*) as total_analyses
       FROM fraud_analysis`
    );

    const disputesResult = await pool.query(
      `SELECT COUNT(*) FILTER (WHERE status = 'pending') as pending_disputes,
              COUNT(*) as total_disputes
       FROM tax_disputes`
    );

    return {
      revenue: parseFloat(revenueResult.rows[0].total_revenue),
      outstanding: parseFloat(outstandingResult.rows[0].total_outstanding),
      users: {
        total: parseInt(userResult.rows[0].total_users, 10),
        taxpayers: parseInt(userResult.rows[0].total_taxpayers, 10),
        admins: parseInt(userResult.rows[0].total_admins, 10),
      },
      fraud: {
        flagged: parseInt(fraudResult.rows[0].flagged, 10),
        total_analyses: parseInt(fraudResult.rows[0].total_analyses, 10),
      },
      disputes: {
        pending: parseInt(disputesResult.rows[0].pending_disputes, 10),
        total: parseInt(disputesResult.rows[0].total_disputes, 10),
      },
    };
  }

  async getMonthlyRevenue(months = 12) {
    const result = await pool.query(
      `SELECT
         to_char(created_at, 'YYYY-MM') as month,
         SUM(amount) as revenue
       FROM payments
       WHERE status = 'confirmed'
         AND created_at >= CURRENT_DATE - INTERVAL '1 month' * $1
       GROUP BY month
       ORDER BY month`,
      [months]
    );
    return result.rows.map(r => ({
      month: r.month,
      revenue: parseFloat(r.revenue),
    }));
  }

  async getRecentPayments(limit = 10) {
    const result = await pool.query(
      `SELECT p.id, p.amount, p.status, p.created_at, u.full_name
       FROM payments p
       JOIN users u ON p.user_id = u.id
       WHERE p.status = 'confirmed'
       ORDER BY p.created_at DESC
       LIMIT $1`,
      [limit]
    );
    return result.rows;
  }

  async getRecentFraudFlags(limit = 10) {
    const result = await pool.query(
      `SELECT fa.payment_id, fa.risk_score, fa.reason, fa.created_at, p.amount, u.full_name
       FROM fraud_analysis fa
       JOIN payments p ON fa.payment_id = p.id
       JOIN users u ON p.user_id = u.id
       WHERE fa.flagged = TRUE
       ORDER BY fa.created_at DESC
       LIMIT $1`,
      [limit]
    );
    return result.rows;
  }
}