"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlertService = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const logger_1 = __importDefault(require("../../utils/logger"));
const ALERT_EMAIL = process.env.ALERT_EMAIL || 'security@dalpay.gov.so';
const SMTP_HOST = process.env.SMTP_HOST || 'smtp.ethereal.email';
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587');
const SMTP_USER = process.env.SMTP_USER || '';
const SMTP_PASS = process.env.SMTP_PASS || '';
const transporter = nodemailer_1.default.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: false,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
});
class AlertService {
    static async send(event, details) {
        const message = `[SECURITY] ${event}\n${JSON.stringify(details, null, 2)}`;
        logger_1.default.warn(message);
        if (process.env.NODE_ENV === 'production') {
            await transporter.sendMail({
                from: process.env.SMTP_FROM || 'noreply@dalpay.gov.so',
                to: ALERT_EMAIL,
                subject: `Security Alert: ${event}`,
                text: message,
            }).catch(err => logger_1.default.error('Failed to send alert email', err));
        }
    }
}
exports.AlertService = AlertService;
//# sourceMappingURL=alert.service.js.map