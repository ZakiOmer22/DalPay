"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.successResponse = successResponse;
exports.errorResponse = errorResponse;
function successResponse(res, data, message = 'Success', statusCode = 200) {
    const body = {
        success: true,
        message,
        data,
        timestamp: new Date().toISOString(),
    };
    return res.status(statusCode).json(body);
}
function errorResponse(res, message = 'Internal Server Error', statusCode = 500, errors, code = 'INTERNAL_ERROR', path) {
    const body = {
        success: false,
        message,
        code,
        errors,
        timestamp: new Date().toISOString(),
        path: path || res.req?.originalUrl,
        statusCode,
    };
    return res.status(statusCode).json(body);
}
//# sourceMappingURL=response.js.map