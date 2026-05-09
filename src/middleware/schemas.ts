// middleware/schemas.ts
import { z } from 'zod';

export const registerSchema = z.object({
  nationalId: z.string().min(5).max(50),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  email: z.string().email().max(255).optional(),
  phoneNumber: z.string().min(7).max(20),
  password: z.string().min(8).max(128),
  dateOfBirth: z.string().optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  occupation: z.string().max(100).optional(),
  region: z.string().max(100).optional(),
  district: z.string().max(100).optional(),
  address: z.string().max(500).optional(),
  idType: z.string().max(50).optional(),
  idNumber: z.string().max(50).optional(),
  drivingLicenseNumber: z.string().max(50).optional(),
  proofOfAddressType: z.string().max(50).optional(),
  stripeVerificationId: z.string().uuid().optional(),
  parentName: z.string().max(200).optional(),
  parentNationalId: z.string().max(50).optional(),
  parentPhone: z.string().max(20).optional(),
}).strict(); // rejects any extra fields

export const loginSchema = z.object({
  nationalId: z.string().optional(),
  email: z.string().email().optional(),
  phoneNumber: z.string().optional(),
  password: z.string().min(1).max(128),
}).strict().refine(data => data.email || data.phoneNumber || data.nationalId, {
  message: 'Provide an email, phone number, or National ID',
  path: ['identifier'],
});