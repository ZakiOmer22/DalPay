"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminRoutes = void 0;
// src/modules/admin/admin.routes.ts
const express_1 = require("express");
const auth_1 = require("../../middleware/auth");
const adminController = __importStar(require("./admin.controller"));
const response_1 = require("@/utils/response");
const database_1 = __importDefault(require("@/config/database")); // ← ensure this is imported
const router = (0, express_1.Router)();
exports.adminRoutes = router;
router.get('/taxpayers', auth_1.authenticate, (0, auth_1.authorize)('admin', 'super_admin', 'employee'), adminController.getTaxpayers);
router.get('/taxpayers/:userId', auth_1.authenticate, (0, auth_1.authorize)('admin', 'super_admin', 'employee'), adminController.getTaxpayerDetail);
router.get('/sessions', auth_1.authenticate, (0, auth_1.authorize)('admin', 'super_admin', 'employee'), adminController.getSessions);
router.post('/sessions/:id/revoke', auth_1.authenticate, (0, auth_1.authorize)('admin', 'super_admin'), adminController.revokeSession);
router.get('/users/pending', auth_1.authenticate, (0, auth_1.authorize)('admin', 'super_admin'), adminController.getPendingUsers);
router.put('/users/:userId/approve', auth_1.authenticate, (0, auth_1.authorize)('admin', 'super_admin'), adminController.approveUser);
router.put('/users/:userId/reject', auth_1.authenticate, (0, auth_1.authorize)('admin', 'super_admin'), adminController.rejectUser);
router.get('/users/:userId/details', auth_1.authenticate, (0, auth_1.authorize)('admin', 'super_admin'), adminController.getUserRegistrationDetails);
// Admin/Employee view all assessments
router.get('/assessments', auth_1.authenticate, (0, auth_1.authorize)('admin', 'super_admin', 'employee'), async (req, res, next) => {
    try {
        const result = await database_1.default.query('SELECT * FROM tax_assessments ORDER BY created_at DESC LIMIT 50');
        return (0, response_1.successResponse)(res, result.rows);
    }
    catch (error) {
        next(error);
    }
});
//# sourceMappingURL=admin.routes.js.map