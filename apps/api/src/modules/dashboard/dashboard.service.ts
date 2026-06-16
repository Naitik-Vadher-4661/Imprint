import { prisma } from '../../config/database';
import { redis } from '../../config/redis';

export class DashboardService {
  static async getSummary(userId: string, timeRange: 'week' | 'month' | 'year' = 'month') {
    const cacheKey = `dashboard:summary:${timeRange}`;
    
    // 1. Try Cache
    const cached = await prisma.dashboardCache.findUnique({
      where: { userId_cacheKey: { userId, cacheKey } }
    });
    
    if (cached && cached.expiresAt > new Date()) {
      try {
        return JSON.parse(cached.data);
      } catch (e) {
        return cached.data;
      }
    }

    // 2. Calculate date range
    const now = new Date();
    const startDate = new Date();
    if (timeRange === 'week') startDate.setDate(now.getDate() - 7);
    if (timeRange === 'month') startDate.setMonth(now.getMonth() - 1);
    if (timeRange === 'year') startDate.setFullYear(now.getFullYear() - 1);

    const profile = await prisma.userProfile.findUnique({ where: { userId } });
    const region = profile?.country || 'global';
    
    // Mock regional averages per month (in Kg)
    const regionalAverageMap: Record<string, number> = {
      'United States': 1400,
      'India': 150,
      'global': 400,
    };
    let regionalAverageKg = regionalAverageMap[region] || 400;
    
    // Scale average based on timeRange
    if (timeRange === 'week') regionalAverageKg = regionalAverageKg / 4;
    if (timeRange === 'year') regionalAverageKg = regionalAverageKg * 12;

    // 3. Aggregate Data
    const [totalEmissionsResult, categoryBreakdown, recentActivities] = await Promise.all([
      // Total emission sum
      prisma.activity.aggregate({
        where: { userId, loggedAt: { gte: startDate } },
        _sum: { emissionKg: true }
      }),
      
      // Emissions grouped by category
      prisma.activity.groupBy({
        by: ['categoryId'],
        where: { userId, loggedAt: { gte: startDate } },
        _sum: { emissionKg: true },
      }),

      // Recent activities for the feed
      prisma.activity.findMany({
        where: { userId },
        orderBy: { loggedAt: 'desc' },
        take: 5,
        include: { category: true }
      })
    ]);

    // Format category breakdown with names
    const categories = await prisma.activityCategory.findMany();
    const formattedBreakdown = categoryBreakdown.map(cb => {
      const cat = categories.find(c => c.id === cb.categoryId);
      return {
        category: cat?.name || 'Unknown',
        icon: cat?.icon || '❓',
        totalKg: cb._sum.emissionKg || 0
      };
    });

    const result = {
      totalEmissionKg: totalEmissionsResult._sum.emissionKg || 0,
      regionalAverageKg,
      timeRange,
      categoryBreakdown: formattedBreakdown,
      recentActivities
    };

    // 4. Save to Cache (TTL 1 hour)
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
    await prisma.dashboardCache.upsert({
      where: { userId_cacheKey: { userId, cacheKey } },
      update: { data: JSON.stringify(result), expiresAt },
      create: { userId, cacheKey, data: JSON.stringify(result), expiresAt }
    });

    return result;
  }
}
