"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyTurnstile = verifyTurnstile;
const TURNSTILE_SECRET_KEY = process.env.TURNSTILE_SECRET_KEY;
async function verifyTurnstile(token) {
    if (!TURNSTILE_SECRET_KEY) {
        // In dev, skip verification if key is not set
        if (process.env.NODE_ENV === 'development')
            return true;
        throw new Error('TURNSTILE_SECRET_KEY is not configured');
    }
    const formData = new URLSearchParams();
    formData.append('secret', TURNSTILE_SECRET_KEY);
    formData.append('response', token);
    const result = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        body: formData,
    });
    const data = await result.json();
    return data.success;
}
//# sourceMappingURL=turnstile.js.map