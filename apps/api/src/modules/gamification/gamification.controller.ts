import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { GamificationService } from './gamification.service';
import { sendSuccess } from '../../utils/apiResponse';

export class GamificationController {
  static async getTasks(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const tasks = await GamificationService.getTasks();
      return sendSuccess(res, tasks);
    } catch (error) {
      next(error);
    }
  }

  static async getBadges(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const badges = await GamificationService.getBadges(req.user!.userId);
      return sendSuccess(res, badges);
    } catch (error) {
      next(error);
    }
  }

  static async acceptTask(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { presetId } = req.body;
      const goal = await GamificationService.acceptTask(req.user!.userId, presetId);
      return sendSuccess(res, goal, 201);
    } catch (error) {
      next(error);
    }
  }
}
