"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyCallbackSignature = verifyCallbackSignature;
const signature_1 = require("../utils/signature");
const errors_1 = require("../utils/errors");
const CALLBACK_SECRET = process.env.MOBILE_MONEY_CALLBACK_SECRET || '';
function verifyCallbackSignature(req, res, next) {
    const signature = req.headers['x-signature'];
    const payload = JSON.stringify(req.body);
    if (!(0, signature_1.verifySignature)(payload, signature, CALLBACK_SECRET)) {
        return next(new errors_1.AppError('Invalid signature', 401));
    }
    next();
}
//# sourceMappingURL=signature.js.map