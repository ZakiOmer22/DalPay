"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.USSDController = void 0;
const ussd_service_1 = require("./ussd.service");
const response_1 = require("../../utils/response");
const ussdService = new ussd_service_1.USSDService();
class USSDController {
    async handleRequest(req, res, next) {
        try {
            const { phoneNumber, text, sessionId } = req.body;
            // phoneNumber is now optional – the service will prompt for it if missing
            const result = await ussdService.processRequest(phoneNumber || '', text || '', sessionId);
            return (0, response_1.successResponse)(res, result, 'USSD response');
        }
        catch (error) {
            next(error);
        }
    }
}
exports.USSDController = USSDController;
//# sourceMappingURL=ussd.controller.js.map