import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { ActivityService } from './activity.service';
import { sendSuccess } from '../../utils/apiResponse';
import { getPagination, createPaginatedResult } from '../../utils/pagination';

export class ActivityController {
  static async createActivity(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await ActivityService.createActivity(req.user!.userId, req.body);
      return sendSuccess(res, result, 201);
    } catch (error) {
      next(error);
    }
  }

  static async getActivities(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { skip, take, page, limit } = getPagination(req.query as unknown as Record<string, string>);
      const { items, total } = await ActivityService.getActivities(req.user!.userId, skip, take);
      
      return sendSuccess(res, createPaginatedResult(items, total, page, limit));
    } catch (error) {
      next(error);
    }
  }

  static async deleteActivity(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const activityId = req.params.id as string;
      await ActivityService.deleteActivity(req.user!.userId, activityId);
      return sendSuccess(res, { message: 'Activity deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
}
