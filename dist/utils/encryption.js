"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.encrypt = encrypt;
exports.decrypt = decrypt;
exports.hashField = hashField;
const crypto_1 = __importDefault(require("crypto"));
const ALGORITHM = 'aes-256-gcm';
// Read all possible encryption keys from environment
const KEYS = {
    1: process.env.ENCRYPTION_KEY_V1 || process.env.ENCRYPTION_KEY || '',
    2: process.env.ENCRYPTION_KEY_V2 || '',
};
// Active version for new encryption
const ACTIVE_VERSION = parseInt(process.env.ACTIVE_ENCRYPTION_KEY_VERSION || '1', 10);
function getKey(version) {
    const key = KEYS[version];
    if (!key) {
        throw new Error(`Encryption key version ${version} not configured`);
    }
    return Buffer.from(key, 'hex');
}
/**
 * Encrypt a plaintext string using the active key version.
 * Returns a string like "v2:iv:authTag:ciphertext".
 */
function encrypt(text) {
    const version = ACTIVE_VERSION;
    const key = getKey(version);
    const iv = crypto_1.default.randomBytes(16);
    const cipher = crypto_1.default.createCipheriv(ALGORITHM, key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');
    return `v${version}:${iv.toString('hex')}:${authTag}:${encrypted}`;
}
/**
 * Decrypt a ciphertext that may include a "vX:" prefix.
 * If no version prefix is present, assumes version 1.
 */
function decrypt(encrypted) {
    let version = 1;
    let payload = encrypted;
    // Check for version prefix (e.g., "v2:")
    const versionMatch = encrypted.match(/^v(\d+):/);
    if (versionMatch) {
        version = parseInt(versionMatch[1], 10);
        payload = encrypted.substring(versionMatch[0].length);
    }
    const key = getKey(version);
    const [ivHex, authTagHex, data] = payload.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const decipher = crypto_1.default.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(data, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}
// Deterministic SHA‑256 hash for search
function hashField(value) {
    const salt = process.env.HASH_SALT || 'default-salt-change-me';
    return crypto_1.default.createHash('sha256').update(value + salt).digest('hex');
}
//# sourceMappingURL=encryption.js.map