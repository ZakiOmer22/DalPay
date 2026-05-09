"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bullmq_1 = require("bullmq");
const queue_1 = require("../config/queue");
const queue_2 = require("../config/queue");
const database_1 = __importDefault(require("../config/database"));
const logger_1 = __importDefault(require("../utils/logger"));
const worker = new bullmq_1.Worker('outbox-dispatch', async (job) => {
    const { rows } = await database_1.default.query(`SELECT * FROM outbox_events WHERE processed = FALSE ORDER BY created_at LIMIT 10`);
    for (const event of rows) {
        try {
            const queueName = event.event_type === 'FRAUD_ANALYSIS' ? queue_2.QUEUES.FRAUD_ANALYSIS
                : event.event_type === 'EMAIL_NOTIFICATION' ? queue_2.QUEUES.EMAIL_NOTIFICATION
                    : queue_2.QUEUES.RECONCILIATION;
            await (0, queue_2.enqueue)(queueName, event.payload);
            await database_1.default.query('UPDATE outbox_events SET processed = TRUE WHERE id = $1', [event.id]);
        }
        catch (err) {
            logger_1.default.error('Outbox dispatch failed', { eventId: event.id, error: err });
        }
    }
}, { connection: (0, queue_1.getConnection)(), concurrency: 1 });
//# sourceMappingURL=outbox.worker.js.map