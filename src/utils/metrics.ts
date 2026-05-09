// utils/metrics.ts
import { Registry, Counter, Gauge } from 'prom-client';

const register = new Registry();

export const metrics = {
  loginAttempts: new Counter({
    name: 'dalpay_login_attempts_total',
    help: 'Total login attempts',
    registers: [register],
  }),
  loginFailures: new Counter({
    name: 'dalpay_login_failures_total',
    help: 'Total failed login attempts',
    registers: [register],
  }),
  paymentsInitiated: new Counter({
    name: 'dalpay_payments_initiated_total',
    help: 'Total payment initiations',
    registers: [register],
  }),
  paymentsConfirmed: new Counter({
    name: 'dalpay_payments_confirmed_total',
    help: 'Total confirmed payments',
    registers: [register],
  }),
  fraudFlags: new Counter({
    name: 'dalpay_fraud_flags_total',
    help: 'Total fraud flags raised',
    registers: [register],
  }),
  activeSessions: new Gauge({
    name: 'dalpay_active_sessions',
    help: 'Number of active user sessions',
    registers: [register],
  }),
};

export const prometheusRegister = register;