// middleware/validation.ts
import { Request, Response, NextFunction } from 'express';
import { ValidationError } from '../utils/errors';
import { ZodError, ZodSchema } from 'zod';

// Manual validation schemas
const manualSchemas: Record<string, (body: any) => string | null> = {
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
    if (!password) {
      return 'Password is required';
    }
    if (!nationalId && !email && !phoneNumber) {
      return 'Please provide your National ID, email, or phone number';
    }
    return null;
  },
};

// Zod schema registry (empty by default)
const zodSchemas: Record<string, ZodSchema> = {};

export function validate(schemaName: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const zodSchema = zodSchemas[schemaName];
    const manualSchema = manualSchemas[schemaName];

    // 1. Zod schema takes priority
    if (zodSchema) {
      try {
        req.body = zodSchema.parse(req.body);
        return next();
      } catch (error) {
        if (error instanceof ZodError) {
          const message = error.issues
            .map((e) => `${e.path.join('.')}: ${e.message}`)
            .join('; ');
          return next(new ValidationError(message));
        }
        return next(error);
      }
    }

    // 2. Fallback to manual validation
    if (manualSchema) {
      const error = manualSchema(req.body);
      if (error) {
        return next(new ValidationError(error));
      }
      return next();
    }

    next();
  };
}