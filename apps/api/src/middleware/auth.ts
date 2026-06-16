import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import { sendError } from '../utils/apiResponse';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
  };
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, 'Authentication required', 401, 'UNAUTHORIZED');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return sendError(res, 'Authentication required', 401, 'UNAUTHORIZED');
    }

    const decoded = jwt.verify(token, config.JWT_SECRET) as { userId: string };
    req.user = decoded;
    
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return sendError(res, 'Token expired', 401, 'TOKEN_EXPIRED');
    }
    return sendError(res, 'Invalid token', 401, 'INVALID_TOKEN');
  }
};
