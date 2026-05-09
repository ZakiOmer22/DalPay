"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Import workers to start them
require("./fraud-analysis.worker");
require("./email-notification.worker");
require("./reconciliation.worker");
console.log('Background workers started');
//# sourceMappingURL=index.js.map