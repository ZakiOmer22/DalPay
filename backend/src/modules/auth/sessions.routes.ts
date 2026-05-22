// src/modules/auth/sessions.routes.ts
import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import { successResponse } from '@/utils/response';
import pool from '@/config/database';

const router = Router();

// GET /api/v1/auth/sessions - Get current user's own sessions
router.get("/sessions", authenticate, async (req: any, res, next) => {
  try {
    // Get current session ID from different possible sources
    const currentSessionId = req.session?.id || req.sessionID || req.headers['x-session-id'];
    
    const result = await pool.query(
      `SELECT us.id, us.ip, us.user_agent, us.is_revoked, us.created_at,
              CASE WHEN us.id = $2 THEN true ELSE false END as is_current
       FROM user_sessions us
       WHERE us.user_id = $1
       ORDER BY 
         CASE WHEN us.id = $2 THEN 0 ELSE 1 END,
         us.created_at DESC`,
      [req.user.userId, currentSessionId]
    );
    
    return successResponse(res, result.rows);
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/auth/sessions/:id/revoke - User revokes their own session
router.post("/sessions/:id/revoke", authenticate, async (req: any, res, next) => {
  try {
    
    // Verify the session belongs to the current user
    const session = await pool.query(
      "SELECT * FROM user_sessions WHERE id = $1 AND user_id = $2",
      [req.params.id, req.user.userId]
    );
    
    if (session.rows.length === 0) {
      return next({ statusCode: 404, message: "Session not found" });
    }
    
    await pool.query(
      "UPDATE user_sessions SET is_revoked = TRUE WHERE id = $1 AND user_id = $2",
      [req.params.id, req.user.userId]
    );
    
    return successResponse(res, { revoked: true });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/auth/sessions/revoke-all - User revokes all other sessions
router.post("/sessions/revoke-all", authenticate, async (req: any, res, next) => {
  try {
    // Get current session ID from body (sent by frontend) or fallback
    const currentSessionId = req.body?.currentSessionId || req.session?.id || req.sessionID;
    
    if (!currentSessionId) {
      return next({ statusCode: 400, message: "Could not determine current session" });
    }
    
    const result = await pool.query(
      "UPDATE user_sessions SET is_revoked = TRUE WHERE user_id = $1 AND id != $2 AND is_revoked = FALSE",
      [req.user.userId, currentSessionId]
    );
    
    return successResponse(res, { revoked: true, count: result.rowCount });
  } catch (error) {
    next(error);
  }
});

export default router;