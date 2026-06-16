import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { InsightsService } from './insights.service';
import { sendSuccess } from '../../utils/apiResponse';

export class InsightsController {
  static async getInsights(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const insights = await InsightsService.getUserInsights(req.user!.userId);
      return sendSuccess(res, insights);
    } catch (error) {
      next(error);
    }
  }

  static async generateInsights(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const insights = await InsightsService.generateInsightsForUser(req.user!.userId);
      return sendSuccess(res, insights, 201);
    } catch (error) {
      next(error);
    }
  }

  static async markActioned(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const insightId = req.params.id as string;
      const insight = await InsightsService.markInsightAsActioned(req.user!.userId, insightId);
      return sendSuccess(res, insight);
    } catch (error) {
      next(error);
    }
  }
}
