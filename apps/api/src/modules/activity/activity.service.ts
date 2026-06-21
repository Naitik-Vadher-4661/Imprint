import { prisma } from '../../config/database';
import { CarbonCalculator } from '../../utils/carbonCalculator';
import { CreateActivityInput } from './activity.schema';
import { AppError } from '../../utils/AppError';

export class ActivityService {
  static async createActivity(userId: string, data: CreateActivityInput) {
    // 1. Get user profile for region
    const profile = await prisma.userProfile.findUnique({ where: { userId } });
    const region = profile?.country || 'global';

    // 2. Calculate emissions
    const { emissionKg, source } = await CarbonCalculator.calculateEmission(
      data.categoryId,
      data.subcategory,
      data.value,
      data.unit,
      region
    );

    // 3. Save activity
    const activity = await prisma.activity.create({
      data: {
        userId,
        categoryId: data.categoryId,
        subcategory: data.subcategory,
        displayName: data.displayName,
        value: data.value,
        unit: data.unit,
        emissionKg,
        notes: data.notes,
        loggedAt: data.loggedAt ? new Date(data.loggedAt) : new Date(),
        isQuickLog: data.isQuickLog || false,
      },
    });

    // 4. Invalidate dashboard cache
    await prisma.dashboardCache.deleteMany({ where: { userId } });

    // In a real app we'd dispatch events for gamification/streaks here

    return { ...activity, _meta: { emissionSource: source } };
  }

  static async getActivities(userId: string, skip: number, take: number) {
    const [items, total] = await Promise.all([
      prisma.activity.findMany({
        where: { userId },
        orderBy: { loggedAt: 'desc' },
        skip,
        take,
        include: { category: true },
      }),
      prisma.activity.count({ where: { userId } }),
    ]);

    return { items, total };
  }

  static async deleteActivity(userId: string, activityId: string) {
    const activity = await prisma.activity.findUnique({ where: { id: activityId } });
    
    if (!activity || activity.userId !== userId) {
      throw AppError.notFound('Activity not found');
    }

    await prisma.activity.delete({ where: { id: activityId } });
    await prisma.dashboardCache.deleteMany({ where: { userId } });

    return { success: true };
  }
}

