import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/apiResponse';
import { config } from '../config/env';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('❌ Error:', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  const code = err.code || 'INTERNAL_ERROR';

  if (config.NODE_ENV === 'development') {
    return sendError(res, message, statusCode, code, err.stack);
  }

  return sendError(res, message, statusCode, code);
};
