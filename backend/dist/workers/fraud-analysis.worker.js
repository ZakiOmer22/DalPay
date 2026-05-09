"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bullmq_1 = require("bullmq");
const queue_1 = require("@/config/queue");
const fraud_service_1 = require("@/modules/fraud/fraud.service");
const gemini_fraud_service_1 = require("@/modules/fraud/gemini-fraud.service");
const logger_1 = __importDefault(require("@/utils/logger"));
const fraudService = new fraud_service_1.FraudService();
const geminiFraud = new gemini_fraud_service_1.GeminiFraudService();
const worker = new bullmq_1.Worker(queue_1.QUEUES.FRAUD_ANALYSIS, async (job) => {
    const { paymentId, userId, amount } = job.data;
    logger_1.default.info('Processing fraud analysis job', { paymentId });
    // Rule-based analysis (synchronous, fast)
    await fraudService.analyzePayment(paymentId, userId, amount);
    // AI analysis (may take longer)
    await geminiFraud.analyzeWithAI(paymentId);
    logger_1.default.info('Fraud analysis completed', { paymentId });
}, { connection: (0, queue_1.getConnection)(), concurrency: 5 });
worker.on('failed', (job, err) => {
    logger_1.default.error('Fraud analysis job failed', { jobId: job?.id, error: err.message });
});
//# sourceMappingURL=fraud-analysis.worker.js.map