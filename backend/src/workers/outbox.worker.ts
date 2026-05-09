import { Worker } from 'bullmq';
import { getConnection } from '../config/queue';
import { enqueue, QUEUES } from '../config/queue';
import pool from '../config/database';
import logger from '../utils/logger';

const worker = new Worker(
  'outbox-dispatch',
  async (job) => {
    const { rows } = await pool.query(
      `SELECT * FROM outbox_events WHERE processed = FALSE ORDER BY created_at LIMIT 10`
    );
    for (const event of rows) {
      try {
        const queueName = event.event_type === 'FRAUD_ANALYSIS' ? QUEUES.FRAUD_ANALYSIS
                        : event.event_type === 'EMAIL_NOTIFICATION' ? QUEUES.EMAIL_NOTIFICATION
                        : QUEUES.RECONCILIATION;
        await enqueue(queueName, event.payload);
        await pool.query('UPDATE outbox_events SET processed = TRUE WHERE id = $1', [event.id]);
      } catch (err) {
        logger.error('Outbox dispatch failed', { eventId: event.id, error: err });
      }
    }
  },
  { connection: getConnection(), concurrency: 1 }
);