import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';

// Read all possible encryption keys from environment
const KEYS: Record<number, string> = {
  1: process.env.ENCRYPTION_KEY_V1 || process.env.ENCRYPTION_KEY || '',
  2: process.env.ENCRYPTION_KEY_V2 || '',
};

// Active version for new encryption
const ACTIVE_VERSION = parseInt(process.env.ACTIVE_ENCRYPTION_KEY_VERSION || '1', 10);

function getKey(version: number): Buffer {
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
export function encrypt(text: string): string {
  const version = ACTIVE_VERSION;
  const key = getKey(version);
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');
  return `v${version}:${iv.toString('hex')}:${authTag}:${encrypted}`;
}

/**
 * Decrypt a ciphertext that may include a "vX:" prefix.
 * If no version prefix is present, assumes version 1.
 */
export function decrypt(encrypted: string): string {
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
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  let decrypted = decipher.update(data, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

// Deterministic SHA‑256 hash for search
export function hashField(value: string): string {
  const salt = process.env.HASH_SALT || 'default-salt-change-me';
  return crypto.createHash('sha256').update(value + salt).digest('hex');
}