import { Queue, JobsOptions } from 'bullmq';
import IORedis from 'ioredis';

const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

let connection: IORedis | null = null;

export function getConnection(): IORedis {
  if (!connection) {
    connection = new IORedis(REDIS_URL, {
      maxRetriesPerRequest: null,
      lazyConnect: true,
    });
    connection.on('error', (err) => {
      console.warn('[Redis] connection error:', err.message);
    });
    connection.connect().catch((err) => {
      console.warn('[Redis] unable to connect – background jobs will be skipped');
    });
  }
  return connection;
}

export const QUEUES = {
  FRAUD_ANALYSIS: 'fraud-analysis',
  EMAIL_NOTIFICATION: 'email-notification',
  RECONCILIATION: 'reconciliation',
};

export async function enqueue<T = any>(queueName: string, data: T, options?: JobsOptions) {
  try {
    const queue = new Queue(queueName, { connection: getConnection() });
    await queue.add(queueName, data, options ?? {});
    await queue.close();
  } catch (error) {
    console.warn(`[Queue] Failed to enqueue ${queueName} – job will not be processed`);
  }
}