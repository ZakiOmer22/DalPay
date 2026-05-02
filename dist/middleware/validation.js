"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = validate;
const errors_1 = require("../utils/errors");
const schemas = {
    register: (body) => {
        const { nationalId, firstName, lastName, phoneNumber, password } = body;
        if (!nationalId || !firstName || !lastName || !phoneNumber || !password) {
            return 'Missing required fields: nationalId, firstName, lastName, phoneNumber, password';
        }
        if (password.length < 8) {
            return 'Password must be at least 8 characters';
        }
        if (body.email && !body.email.includes('@')) {
            return 'Invalid email format';
        }
        return null;
    },
    login: (body) => {
        const { nationalId, email, phoneNumber, password } = body;
        // Must have password
        if (!password) {
            return 'Password is required';
        }
        // Must have at least one identifier
        if (!nationalId && !email && !phoneNumber) {
            return 'Please provide your National ID, email, or phone number';
        }
        return null;
    },
};
function validate(schemaName) {
    return (req, res, next) => {
        const schema = schemas[schemaName];
        if (!schema) {
            return next();
        }
        const error = schema(req.body);
        if (error) {
            return next(new errors_1.ValidationError(error));
        }
        next();
    };
}
//# sourceMappingURL=validation.js.map