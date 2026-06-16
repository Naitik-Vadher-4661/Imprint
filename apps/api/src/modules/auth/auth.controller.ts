import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { AuthService } from './auth.service';
import { sendSuccess } from '../../utils/apiResponse';

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AuthService.register(req.body);
      return sendSuccess(res, result, 201);
    } catch (error) {
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AuthService.login(req.body);
      return sendSuccess(res, result, 200);
    } catch (error) {
      next(error);
    }
  }

  static async getProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await AuthService.getProfile(req.user!.userId);
      return sendSuccess(res, result, 200);
    } catch (error) {
      next(error);
    }
  }

  static async updateProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await AuthService.updateProfile(req.user!.userId, req.body);
      return sendSuccess(res, result, 200);
    } catch (error) {
      next(error);
    }
  }
}
