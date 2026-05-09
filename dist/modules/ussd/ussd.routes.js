"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ussd_controller_1 = require("./ussd.controller");
const router = (0, express_1.Router)();
const ussdController = new ussd_controller_1.USSDController();
router.post('/', ussdController.handleRequest);
exports.default = router;
//# sourceMappingURL=ussd.routes.js.map