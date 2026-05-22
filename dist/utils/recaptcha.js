"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyRecaptcha = verifyRecaptcha;
// utils/recaptcha.ts
async function verifyRecaptcha(token) {
    const secretKey = process.env.RECAPTCHA_SECRET_KEY;
    if (!secretKey) {
        console.warn("RECAPTCHA_SECRET_KEY not set, skipping verification in dev");
        return process.env.NODE_ENV !== "production";
    }
    try {
        const response = await fetch("https://www.google.com/recaptcha/api/siteverify", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: `secret=${secretKey}&response=${token}`,
        });
        const data = (await response.json());
        return data.success === true;
    }
    catch (error) {
        console.error("reCAPTCHA verification error:", error);
        return false;
    }
}
//# sourceMappingURL=recaptcha.js.map