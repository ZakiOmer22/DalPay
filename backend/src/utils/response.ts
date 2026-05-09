import { Response } from 'express';

interface SuccessResponseBody {
  success: true;
  message: string;
  data: any;
  timestamp: string;
}

interface ErrorResponseBody {
  success: false;
  message: string;
  code: string;
  errors?: any;
  timestamp: string;
  path?: string;
  statusCode: number;
}

export function successResponse(
  res: Response,
  data: any,
  message = 'Success',
  statusCode = 200
) {
  const body: SuccessResponseBody = {
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
  };
  return res.status(statusCode).json(body);
}

export function errorResponse(
  res: Response,
  message = 'Internal Server Error',
  statusCode = 500,
  errors?: any,
  code = 'INTERNAL_ERROR',
  path?: string
) {
  const body: ErrorResponseBody = {
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