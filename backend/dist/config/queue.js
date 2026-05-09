"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QUEUES = void 0;
exports.getConnection = getConnection;
exports.enqueue = enqueue;
const bullmq_1 = require("bullmq");
const ioredis_1 = __importDefault(require("ioredis"));
const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
let connection = null;
function getConnection() {
    if (!connection) {
        connection = new ioredis_1.default(REDIS_URL, {
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
exports.QUEUES = {
    FRAUD_ANALYSIS: 'fraud-analysis',
    EMAIL_NOTIFICATION: 'email-notification',
    RECONCILIATION: 'reconciliation',
};
async function enqueue(queueName, data, options) {
    try {
        const queue = new bullmq_1.Queue(queueName, { connection: getConnection() });
        await queue.add(queueName, data, options ?? {});
        await queue.close();
    }
    catch (error) {
        console.warn(`[Queue] Failed to enqueue ${queueName} – job will not be processed`);
    }
}
//# sourceMappingURL=queue.js.map