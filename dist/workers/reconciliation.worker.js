"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bullmq_1 = require("bullmq");
const queue_1 = require("../config/queue");
const reconciliation_service_1 = require("../modules/reconciliation/reconciliation.service");
const logger_1 = __importDefault(require("../utils/logger"));
const reconciliationService = new reconciliation_service_1.ReconciliationService();
const connection = new (require('ioredis'))(process.env.REDIS_URL || 'redis://127.0.0.1:6379', {
    maxRetriesPerRequest: null,
});
const worker = new bullmq_1.Worker(queue_1.QUEUES.RECONCILIATION, async (job) => {
    logger_1.default.info('Processing reconciliation job');
    await reconciliationService.runDailyReconciliation(job.data.adminId, job.data.date);
    logger_1.default.info('Reconciliation job completed');
}, { connection, concurrency: 1 });
// Schedule daily at 2 AM UTC
const repeatableQueue = new bullmq_1.Queue(queue_1.QUEUES.RECONCILIATION, { connection });
repeatableQueue.add('daily-reconciliation', { adminId: '00000000-0000-0000-0000-000000000000', date: new Date().toISOString().split('T')[0] }, {
    repeat: { pattern: '0 2 * * *' },
    jobId: 'daily-reconciliation',
});
worker.on('failed', (job, err) => {
    logger_1.default.error('Reconciliation job failed', { jobId: job?.id, error: err.message });
});
//# sourceMappingURL=reconciliation.worker.js.map