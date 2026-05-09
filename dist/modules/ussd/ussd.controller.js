"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.USSDController = void 0;
const ussd_service_1 = require("./ussd.service");
const response_1 = require("../../utils/response");
const errors_1 = require("../../utils/errors");
const ussdService = new ussd_service_1.USSDService();
class USSDController {
    async handleRequest(req, res, next) {
        try {
            const { phoneNumber, text, sessionId } = req.body;
            if (!phoneNumber) {
                throw new errors_1.AppError('Phone number is required', 400);
            }
            const result = await ussdService.processRequest(phoneNumber, text || '', sessionId);
            return (0, response_1.successResponse)(res, result, 'USSD response');
        }
        catch (error) {
            next(error);
        }
    }
}
exports.USSDController = USSDController;
//# sourceMappingURL=ussd.controller.js.map