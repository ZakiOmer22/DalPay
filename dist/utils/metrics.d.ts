import { Registry, Counter, Gauge } from 'prom-client';
export declare const metrics: {
    loginAttempts: Counter<string>;
    loginFailures: Counter<string>;
    paymentsInitiated: Counter<string>;
    paymentsConfirmed: Counter<string>;
    fraudFlags: Counter<string>;
    activeSessions: Gauge<string>;
};
export declare const prometheusRegister: Registry<"text/plain; version=0.0.4; charset=utf-8">;
//# sourceMappingURL=metrics.d.ts.map