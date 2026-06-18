import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/apiResponse';
import { config } from '../config/env';
import { AppError } from '../utils/AppError';

export const errorHandler = (
  err: Error & { statusCode?: number; code?: string; isOperational?: boolean; details?: unknown },
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('❌ Error:', err);

  const isProduction = config.NODE_ENV === 'production';

  if (err instanceof AppError) {
    const details = isProduction && !err.isOperational ? undefined : err.details;
    return sendError(
      res,
      err.message,
      err.statusCode,
      err.code,
      !isProduction ? (err.stack || details) : details
    );
  }

  // Handle generic error (e.g. database error, third-party library error)
  const statusCode = err.statusCode || 500;
  const code = err.code || 'INTERNAL_ERROR';
  const message = isProduction && statusCode === 500 ? 'Internal Server Error' : err.message;

  return sendError(
    res,
    message,
    statusCode,
    code,
    !isProduction ? err.stack : undefined
  );
};

