export declare const env: {
    port: number;
    nodeEnv: string;
    db: {
        url: string;
    };
    jwt: {
        secret: string;
        refreshSecret: string;
        expiry: string;
        refreshExpiry: string;
    };
    session: {
        secret: string;
    };
    rateLimit: {
        windowMs: number;
        max: number;
    };
    mobileMoney: {
        zaad: {
            apiUrl: string;
            apiKey: string;
        };
        edahab: {
            apiUrl: string;
            apiKey: string;
        };
    };
};
//# sourceMappingURL=env.d.ts.map