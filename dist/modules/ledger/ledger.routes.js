"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../../middleware/auth");
const ledger_service_1 = require("./ledger.service");
const response_1 = require("../../utils/response");
const router = (0, express_1.Router)();
const ledgerService = new ledger_service_1.LedgerService();
router.get('/verify', auth_1.authenticate, (0, auth_1.authorize)('admin', 'auditor'), async (req, res, next) => {
    try {
        const balanced = await ledgerService.verifyBalance();
        return (0, response_1.successResponse)(res, { balanced });
    }
    catch (error) {
        next(error);
    }
});
router.get('/', auth_1.authenticate, (0, auth_1.authorize)('admin', 'auditor'), async (req, res, next) => {
    try {
        const { page = '1', limit = '20', search, type, startDate, endDate } = req.query;
        const filters = { search, type, startDate, endDate };
        const pageNum = parseInt(page, 10) || 1;
        const limitNum = parseInt(limit, 10) || 20;
        const offset = (pageNum - 1) * limitNum;
        const data = await ledgerService.getFilteredLedger(filters, limitNum, offset);
        return (0, response_1.successResponse)(res, data);
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=ledger.routes.js.map