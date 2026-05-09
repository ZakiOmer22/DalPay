import { Worker, Job } from 'bullmq';
import { QUEUES } from '../config/queue';
import { NotificationService } from '../modules/notification/notification.service';
import logger from '../utils/logger';

interface EmailJob {
  userId: string;
  paymentId: string;
  amount: number;
}

const connection = new (require('ioredis'))(process.env.REDIS_URL || 'redis://127.0.0.1:6379', {
  maxRetriesPerRequest: null,
});

const worker = new Worker<EmailJob>(
  QUEUES.EMAIL_NOTIFICATION,
  async (job: Job<EmailJob>) => {
    const { userId, paymentId, amount } = job.data;
    logger.info('Sending payment confirmation', { userId, paymentId });
    await NotificationService.sendPaymentConfirmation(userId, paymentId, amount);
  },
  { connection, concurrency: 10 },
);

worker.on('failed', (job, err) => {
  logger.error('Email notification job failed', { jobId: job?.id, error: err.message });
});