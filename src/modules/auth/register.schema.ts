// modules/auth/register.schema.ts
import { z } from "zod";

export const registerSchema = z.object({
  nationalId: z
    .string()
    .regex(/^SL-\d{4}-\d{3}$/, "National ID must be like SL-2026-999"),
  firstName: z.string().min(1).max(100).trim(),
  lastName: z.string().min(1).max(100).trim(),
  email: z.string().email().optional(),
  phoneNumber: z
    .string()
    .regex(/^\+2526\d{8,9}$/, "Phone must be +2526XXXXXXXX or +2526XXXXXXXXX"),
  password: z
    .string()
    .min(12, "Password must be at least 12 characters")
    .regex(/[A-Z]/, "Must contain uppercase")
    .regex(/[a-z]/, "Must contain lowercase")
    .regex(/[0-9]/, "Must contain number")
    .regex(/[^A-Za-z0-9]/, "Must contain symbol"),
  dateOfBirth: z
    .string()
    .optional()
    .refine(
      (d) => !d || new Date(d) < new Date(),
      "Date of birth cannot be in the future"
    )
    .refine(
      (d) =>
        !d ||
        new Date(d).getFullYear() < new Date().getFullYear() - 17,
      "You must be at least 18 years old"
    ),
  gender: z.enum(["male", "female", "other"]).optional(),
  occupation: z.string().max(100).trim().optional(),
  region: z
    .enum(["maroodi_jeex", "togdheer", "saxil", "sanaag", "awdal", "sool"])
    .optional(),
  district: z.string().max(100).trim().optional(),
  address: z.string().max(500).trim().optional(),
  idType: z
    .enum(["national_id", "passport", "driving_license"])
    .optional(),
  idNumber: z.string().min(1).max(100).optional(),
  drivingLicenseNumber: z.string().max(100).optional(),
  proofOfAddressType: z
    .enum(["utility_bill", "bank_statement", "rental_agreement", "employer_letter"])
    .optional(),
  stripeVerificationId: z.string().optional(),
  parentName: z.string().max(200).trim().optional(),
  parentNationalId: z.string().optional(),
  parentPhone: z.string().optional(),
  recaptchaToken: z.string().min(1, "reCAPTCHA token required"),
  agreeToTerms: z.boolean().optional().default(false),
  isUnder18: z.boolean().optional().default(false),
}).strict();

export type RegisterInput = z.infer<typeof registerSchema>;