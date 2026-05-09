import { JobsOptions } from 'bullmq';
import IORedis from 'ioredis';
export declare function getConnection(): IORedis;
export declare const QUEUES: {
    FRAUD_ANALYSIS: string;
    EMAIL_NOTIFICATION: string;
    RECONCILIATION: string;
};
export declare function enqueue<T = any>(queueName: string, data: T, options?: JobsOptions): Promise<void>;
//# sourceMappingURL=queue.d.ts.map