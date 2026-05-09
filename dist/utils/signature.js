"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifySignature = verifySignature;
const crypto_1 = __importDefault(require("crypto"));
function verifySignature(payload, signature, secret) {
    if (!signature || !secret)
        return false;
    const expected = crypto_1.default.createHmac('sha256', secret).update(payload).digest('hex');
    return crypto_1.default.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}
//# sourceMappingURL=signature.js.map