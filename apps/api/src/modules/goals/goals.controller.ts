import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { GoalsService } from './goals.service';
import { sendSuccess } from '../../utils/apiResponse';

export class GoalsController {
  static async getGoals(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const goals = await GoalsService.getUserGoals(req.user!.userId);
      return sendSuccess(res, goals);
    } catch (error) {
      next(error);
    }
  }

  static async createGoal(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const goal = await GoalsService.createGoal(req.user!.userId, req.body);
      return sendSuccess(res, goal, 201);
    } catch (error) {
      next(error);
    }
  }

  static async updateProgress(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { progressValue } = req.body;
      const goal = await GoalsService.updateGoalProgress(req.user!.userId, req.params.id as string, progressValue);
      return sendSuccess(res, goal);
    } catch (error) {
      next(error);
    }
  }

  static async markComplete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await GoalsService.markGoalCompleted(req.user!.userId, req.params.id as string);
      return sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }
}
