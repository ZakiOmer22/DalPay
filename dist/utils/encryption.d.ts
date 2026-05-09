/**
 * Encrypt a plaintext string using the active key version.
 * Returns a string like "v2:iv:authTag:ciphertext".
 */
export declare function encrypt(text: string): string;
/**
 * Decrypt a ciphertext that may include a "vX:" prefix.
 * If no version prefix is present, assumes version 1.
 */
export declare function decrypt(encrypted: string): string;
export declare function hashField(value: string): string;
//# sourceMappingURL=encryption.d.ts.map