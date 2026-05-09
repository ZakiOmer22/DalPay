"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prometheusRegister = exports.metrics = void 0;
// utils/metrics.ts
const prom_client_1 = require("prom-client");
const register = new prom_client_1.Registry();
exports.metrics = {
    loginAttempts: new prom_client_1.Counter({
        name: 'dalpay_login_attempts_total',
        help: 'Total login attempts',
        registers: [register],
    }),
    loginFailures: new prom_client_1.Counter({
        name: 'dalpay_login_failures_total',
        help: 'Total failed login attempts',
        registers: [register],
    }),
    paymentsInitiated: new prom_client_1.Counter({
        name: 'dalpay_payments_initiated_total',
        help: 'Total payment initiations',
        registers: [register],
    }),
    paymentsConfirmed: new prom_client_1.Counter({
        name: 'dalpay_payments_confirmed_total',
        help: 'Total confirmed payments',
        registers: [register],
    }),
    fraudFlags: new prom_client_1.Counter({
        name: 'dalpay_fraud_flags_total',
        help: 'Total fraud flags raised',
        registers: [register],
    }),
    activeSessions: new prom_client_1.Gauge({
        name: 'dalpay_active_sessions',
        help: 'Number of active user sessions',
        registers: [register],
    }),
};
exports.prometheusRegister = register;
//# sourceMappingURL=metrics.js.map