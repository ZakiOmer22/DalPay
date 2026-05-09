import { Worker, Queue } from 'bullmq';
import { QUEUES } from '../config/queue';
import { ReconciliationService } from '../modules/reconciliation/reconciliation.service';
import logger from '../utils/logger';

const reconciliationService = new ReconciliationService();

const connection = new (require('ioredis'))(process.env.REDIS_URL || 'redis://127.0.0.1:6379', {
  maxRetriesPerRequest: null,
});

const worker = new Worker(
  QUEUES.RECONCILIATION,
  async (job) => {
    logger.info('Processing reconciliation job');
    await reconciliationService.runDailyReconciliation(job.data.adminId, job.data.date);
    logger.info('Reconciliation job completed');
  },
  { connection, concurrency: 1 },
);

// Schedule daily at 2 AM UTC
const repeatableQueue = new Queue(QUEUES.RECONCILIATION, { connection });
repeatableQueue.add(
  'daily-reconciliation',
  { adminId: '00000000-0000-0000-0000-000000000000', date: new Date().toISOString().split('T')[0] },
  {
    repeat: { pattern: '0 2 * * *' },
    jobId: 'daily-reconciliation',
  },
);

worker.on('failed', (job, err) => {
  logger.error('Reconciliation job failed', { jobId: job?.id, error: err.message });
});