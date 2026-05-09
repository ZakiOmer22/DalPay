"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const database_1 = __importDefault(require("../../config/database"));
const logger_1 = __importDefault(require("../../utils/logger"));
const transporter = nodemailer_1.default.createTransport({
    host: process.env.SMTP_HOST || 'smtp.ethereal.email',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || '',
    },
});
class NotificationService {
    /**
     * Send a payment confirmation to the user and optionally a security alert.
     */
    static async sendPaymentConfirmation(userId, paymentId, amount) {
        try {
            const userResult = await database_1.default.query('SELECT email, phone FROM users WHERE id = $1', [userId]);
            if (userResult.rows.length === 0)
                return;
            const { email, phone } = userResult.rows[0];
            const message = `DalPay Tax Payment Confirmed\nAmount: ${amount} SOS\nPayment ID: ${paymentId}\nThank you for your payment.`;
            // Email
            if (email && process.env.NODE_ENV === 'production') {
                await transporter.sendMail({
                    from: process.env.SMTP_FROM || 'noreply@dalpay.gov',
                    to: email,
                    subject: 'Payment Confirmed – DalPay',
                    text: message,
                }).catch(err => logger_1.default.error('Failed to send payment email', err));
            }
            else {
                logger_1.default.info(`[DEV EMAIL] To: ${email} – ${message}`);
            }
            // SMS (simulated)
            if (phone) {
                logger_1.default.info(`[SMS] To: ${phone} – ${message}`);
                // In production, integrate with an SMS gateway here
            }
            // Store notification in DB
            await database_1.default.query(`INSERT INTO notifications (user_id, title, message) VALUES ($1, $2, $3)`, [userId, 'Payment Confirmed', message]);
        }
        catch (err) {
            logger_1.default.error('Notification error', err);
        }
    }
    /**
     * Send a custom notification to a user (admin tool).
     */
    static async sendCustomNotification(userId, title, message) {
        await database_1.default.query(`INSERT INTO notifications (user_id, title, message) VALUES ($1, $2, $3)`, [userId, title, message]);
        logger_1.default.info(`Custom notification sent to user ${userId}: ${title}`);
    }
}
exports.NotificationService = NotificationService;
//# sourceMappingURL=notification.service.js.map