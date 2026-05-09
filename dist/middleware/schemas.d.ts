import { z } from 'zod';
export declare const registerSchema: z.ZodObject<{
    nationalId: z.ZodString;
    firstName: z.ZodString;
    lastName: z.ZodString;
    email: z.ZodOptional<z.ZodString>;
    phoneNumber: z.ZodString;
    password: z.ZodString;
    dateOfBirth: z.ZodOptional<z.ZodString>;
    gender: z.ZodOptional<z.ZodEnum<{
        male: "male";
        female: "female";
        other: "other";
    }>>;
    occupation: z.ZodOptional<z.ZodString>;
    region: z.ZodOptional<z.ZodString>;
    district: z.ZodOptional<z.ZodString>;
    address: z.ZodOptional<z.ZodString>;
    idType: z.ZodOptional<z.ZodString>;
    idNumber: z.ZodOptional<z.ZodString>;
    drivingLicenseNumber: z.ZodOptional<z.ZodString>;
    proofOfAddressType: z.ZodOptional<z.ZodString>;
    stripeVerificationId: z.ZodOptional<z.ZodString>;
    parentName: z.ZodOptional<z.ZodString>;
    parentNationalId: z.ZodOptional<z.ZodString>;
    parentPhone: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
export declare const loginSchema: z.ZodObject<{
    nationalId: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodString>;
    phoneNumber: z.ZodOptional<z.ZodString>;
    password: z.ZodString;
}, z.core.$strict>;
//# sourceMappingURL=schemas.d.ts.map