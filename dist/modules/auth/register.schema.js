"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerSchema = void 0;
// modules/auth/register.schema.ts
const zod_1 = require("zod");
exports.registerSchema = zod_1.z.object({
    nationalId: zod_1.z
        .string()
        .regex(/^SL-\d{4}-\d{3}$/, "National ID must be like SL-2026-999"),
    firstName: zod_1.z.string().min(1).max(100).trim(),
    lastName: zod_1.z.string().min(1).max(100).trim(),
    email: zod_1.z.string().email().optional(),
    phoneNumber: zod_1.z
        .string()
        .regex(/^\+2526\d{8,9}$/, "Phone must be +2526XXXXXXXX or +2526XXXXXXXXX"),
    password: zod_1.z
        .string()
        .min(12, "Password must be at least 12 characters")
        .regex(/[A-Z]/, "Must contain uppercase")
        .regex(/[a-z]/, "Must contain lowercase")
        .regex(/[0-9]/, "Must contain number")
        .regex(/[^A-Za-z0-9]/, "Must contain symbol"),
    dateOfBirth: zod_1.z
        .string()
        .optional()
        .refine((d) => !d || new Date(d) < new Date(), "Date of birth cannot be in the future")
        .refine((d) => !d ||
        new Date(d).getFullYear() < new Date().getFullYear() - 17, "You must be at least 18 years old"),
    gender: zod_1.z.enum(["male", "female", "other"]).optional(),
    occupation: zod_1.z.string().max(100).trim().optional(),
    region: zod_1.z
        .enum(["maroodi_jeex", "togdheer", "saxil", "sanaag", "awdal", "sool"])
        .optional(),
    district: zod_1.z.string().max(100).trim().optional(),
    address: zod_1.z.string().max(500).trim().optional(),
    idType: zod_1.z
        .enum(["national_id", "passport", "driving_license"])
        .optional(),
    idNumber: zod_1.z.string().min(1).max(100).optional(),
    drivingLicenseNumber: zod_1.z.string().max(100).optional(),
    proofOfAddressType: zod_1.z
        .enum(["utility_bill", "bank_statement", "rental_agreement", "employer_letter"])
        .optional(),
    stripeVerificationId: zod_1.z.string().optional(),
    parentName: zod_1.z.string().max(200).trim().optional(),
    parentNationalId: zod_1.z.string().optional(),
    parentPhone: zod_1.z.string().optional(),
    recaptchaToken: zod_1.z.string().min(1, "reCAPTCHA token required"),
    agreeToTerms: zod_1.z.boolean().optional().default(false),
    isUnder18: zod_1.z.boolean().optional().default(false),
}).strict();
//# sourceMappingURL=register.schema.js.map