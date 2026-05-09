// utils/audit.ts
import pool from '../config/database';
import crypto from 'crypto';

export async function insertAuditLog(data: {
  userId: string;
  action: string;
  entity: string;
  entityId: string;
  metadata?: any;
}) {
  const last = await pool.query(
    'SELECT hash_chain FROM audit_logs ORDER BY created_at DESC LIMIT 1'
  );
  const previousHash = last.rows.length > 0 ? last.rows[0].hash_chain : '0'.repeat(64);

  const payload = JSON.stringify({
    userId: data.userId,
    action: data.action,
    entity: data.entity,
    entityId: data.entityId,
    metadata: data.metadata,
    timestamp: new Date().toISOString(),
    previousHash,
  });

  const newHash = crypto.createHash('sha256').update(payload).digest('hex');

  await pool.query(
    `INSERT INTO audit_logs (user_id, action, entity, entity_id, metadata, hash_chain)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [data.userId, data.action, data.entity, data.entityId, JSON.stringify(data.metadata), newHash]
  );
}