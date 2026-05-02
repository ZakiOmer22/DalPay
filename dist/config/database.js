"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg");
const env_1 = require("./env");
const pool = new pg_1.Pool({
    connectionString: env_1.env.db.url,
    ssl: {
        rejectUnauthorized: false, // Required for Neon
    },
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
});
pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
});
exports.default = pool;
//# sourceMappingURL=database.js.map