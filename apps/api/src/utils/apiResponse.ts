import { Response } from 'express';

type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: unknown;
};

export const sendSuccess = <T>(res: Response, data: T, statusCode = 200, meta?: unknown) => {
  const response: ApiResponse<T> = {
    success: true,
    data,
  };
  if (meta) response.meta = meta;
  return res.status(statusCode).json(response);
};

export const sendError = (
  res: Response,
  message: string,
  statusCode = 400,
  code = 'BAD_REQUEST',
  details?: unknown
) => {
  const response: ApiResponse<null> = {
    success: false,
    error: {
      code,
      message,
      details,
    },
  };
  return res.status(statusCode).json(response);
};
