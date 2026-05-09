"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bullmq_1 = require("bullmq");
const queue_1 = require("../config/queue");
const notification_service_1 = require("../modules/notification/notification.service");
const logger_1 = __importDefault(require("../utils/logger"));
const connection = new (require('ioredis'))(process.env.REDIS_URL || 'redis://127.0.0.1:6379', {
    maxRetriesPerRequest: null,
});
const worker = new bullmq_1.Worker(queue_1.QUEUES.EMAIL_NOTIFICATION, async (job) => {
    const { userId, paymentId, amount } = job.data;
    logger_1.default.info('Sending payment confirmation', { userId, paymentId });
    await notification_service_1.NotificationService.sendPaymentConfirmation(userId, paymentId, amount);
}, { connection, concurrency: 10 });
worker.on('failed', (job, err) => {
    logger_1.default.error('Email notification job failed', { jobId: job?.id, error: err.message });
});
//# sourceMappingURL=email-notification.worker.js.map