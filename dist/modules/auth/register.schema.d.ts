import { z } from "zod";
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
    region: z.ZodOptional<z.ZodEnum<{
        maroodi_jeex: "maroodi_jeex";
        togdheer: "togdheer";
        saxil: "saxil";
        sanaag: "sanaag";
        awdal: "awdal";
        sool: "sool";
    }>>;
    district: z.ZodOptional<z.ZodString>;
    address: z.ZodOptional<z.ZodString>;
    idType: z.ZodOptional<z.ZodEnum<{
        national_id: "national_id";
        passport: "passport";
        driving_license: "driving_license";
    }>>;
    idNumber: z.ZodOptional<z.ZodString>;
    drivingLicenseNumber: z.ZodOptional<z.ZodString>;
    proofOfAddressType: z.ZodOptional<z.ZodEnum<{
        utility_bill: "utility_bill";
        bank_statement: "bank_statement";
        rental_agreement: "rental_agreement";
        employer_letter: "employer_letter";
    }>>;
    stripeVerificationId: z.ZodOptional<z.ZodString>;
    parentName: z.ZodOptional<z.ZodString>;
    parentNationalId: z.ZodOptional<z.ZodString>;
    parentPhone: z.ZodOptional<z.ZodString>;
    recaptchaToken: z.ZodString;
    agreeToTerms: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    isUnder18: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, z.core.$strict>;
export type RegisterInput = z.infer<typeof registerSchema>;
//# sourceMappingURL=register.schema.d.ts.map