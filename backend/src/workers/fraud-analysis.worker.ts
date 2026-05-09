import { Worker, Job } from 'bullmq';
import { getConnection, QUEUES } from '@/config/queue';
import { FraudService } from '@/modules/fraud/fraud.service';
import { GeminiFraudService } from '@/modules/fraud/gemini-fraud.service';
import logger from '@/utils/logger';

const fraudService = new FraudService();
const geminiFraud = new GeminiFraudService();

interface FraudJob {
  paymentId: string;
  userId: string;
  amount: number;
}

const worker = new Worker<FraudJob>(
  QUEUES.FRAUD_ANALYSIS,
  async (job: Job<FraudJob>) => {
    const { paymentId, userId, amount } = job.data;
    logger.info('Processing fraud analysis job', { paymentId });

    // Rule-based analysis (synchronous, fast)
    await fraudService.analyzePayment(paymentId, userId, amount);

    // AI analysis (may take longer)
    await geminiFraud.analyzeWithAI(paymentId);

    logger.info('Fraud analysis completed', { paymentId });
  },
  { connection: getConnection(), concurrency: 5 },
);

worker.on('failed', (job, err) => {
  logger.error('Fraud analysis job failed', { jobId: job?.id, error: err.message });
});