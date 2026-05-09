"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginSchema = exports.registerSchema = void 0;
// middleware/schemas.ts
const zod_1 = require("zod");
exports.registerSchema = zod_1.z.object({
    nationalId: zod_1.z.string().min(5).max(50),
    firstName: zod_1.z.string().min(1).max(100),
    lastName: zod_1.z.string().min(1).max(100),
    email: zod_1.z.string().email().max(255).optional(),
    phoneNumber: zod_1.z.string().min(7).max(20),
    password: zod_1.z.string().min(8).max(128),
    dateOfBirth: zod_1.z.string().optional(),
    gender: zod_1.z.enum(['male', 'female', 'other']).optional(),
    occupation: zod_1.z.string().max(100).optional(),
    region: zod_1.z.string().max(100).optional(),
    district: zod_1.z.string().max(100).optional(),
    address: zod_1.z.string().max(500).optional(),
    idType: zod_1.z.string().max(50).optional(),
    idNumber: zod_1.z.string().max(50).optional(),
    drivingLicenseNumber: zod_1.z.string().max(50).optional(),
    proofOfAddressType: zod_1.z.string().max(50).optional(),
    stripeVerificationId: zod_1.z.string().uuid().optional(),
    parentName: zod_1.z.string().max(200).optional(),
    parentNationalId: zod_1.z.string().max(50).optional(),
    parentPhone: zod_1.z.string().max(20).optional(),
}).strict(); // rejects any extra fields
exports.loginSchema = zod_1.z.object({
    nationalId: zod_1.z.string().optional(),
    email: zod_1.z.string().email().optional(),
    phoneNumber: zod_1.z.string().optional(),
    password: zod_1.z.string().min(1).max(128),
}).strict().refine(data => data.email || data.phoneNumber || data.nationalId, {
    message: 'Provide an email, phone number, or National ID',
    path: ['identifier'],
});
//# sourceMappingURL=schemas.js.map