import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { DashboardService } from './dashboard.service';
import { sendSuccess } from '../../utils/apiResponse';

export class DashboardController {
  static async getSummary(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const timeRange = (req.query.timeRange as 'week' | 'month' | 'year') || 'month';
      const result = await DashboardService.getSummary(req.user!.userId, timeRange);
      return sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }
}
