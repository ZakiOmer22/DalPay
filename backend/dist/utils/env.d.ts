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
        zaadApiUrl: string;
        zaadApiKey: string;
        edahabApiUrl: string;
        edahabApiKey: string;
    };
    encryptionKey: string;
    hashSalt: string;
};
//# sourceMappingURL=env.d.ts.map