import { DashboardService } from '../dashboard.service';
import { prisma } from '../../../config/database';


jest.mock('../../../config/database', () => ({
  prisma: {
    dashboardCache: {
      findUnique: jest.fn(),
      upsert: jest.fn(),
    },
    userProfile: {
      findUnique: jest.fn(),
      count: jest.fn(),
    },
    activity: {
      aggregate: jest.fn(),
      groupBy: jest.fn(),
      findMany: jest.fn(),
    },
    activityCategory: {
      findMany: jest.fn(),
    },
  },
}));

jest.mock('../../../config/redis', () => ({
  redis: {
    get: jest.fn(),
    setex: jest.fn(),
  },
}));

describe('DashboardService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getSummary', () => {
    it('should return cached data when cache is valid and not expired', async () => {
      const cachedData = {
        totalEmissionKg: 150,
        regionalAverageKg: 400,
        timeRange: 'month',
        categoryBreakdown: [],
        recentActivities: [],
      };
      (prisma.dashboardCache.findUnique as jest.Mock).mockResolvedValue({
        data: JSON.stringify(cachedData),
        expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour in the future
      });

      const result = await DashboardService.getSummary('user-123', 'month');
      expect(result).toEqual(cachedData);
      // Should not call any aggregation queries when cache is valid
      expect(prisma.activity.aggregate).not.toHaveBeenCalled();
    });

    it('should compute fresh data when cache is expired', async () => {
      // Expired cache
      (prisma.dashboardCache.findUnique as jest.Mock).mockResolvedValue({
        data: '{}',
        expiresAt: new Date(Date.now() - 1000), // expired 1 second ago
      });

      // Mock all the fresh computation calls
      (prisma.userProfile.findUnique as jest.Mock).mockResolvedValue({ country: 'India' });
      (prisma.userProfile.count as jest.Mock).mockResolvedValue(5);

      // Regional emissions aggregate
      (prisma.activity.aggregate as jest.Mock)
        .mockResolvedValueOnce({ _sum: { emissionKg: 500 } }) // regional total
        .mockResolvedValueOnce({ _sum: { emissionKg: 80 } }); // user total

      (prisma.activity.groupBy as jest.Mock).mockResolvedValue([
        { categoryId: 'cat-1', _sum: { emissionKg: 50 } },
        { categoryId: 'cat-2', _sum: { emissionKg: 30 } },
      ]);
      (prisma.activity.findMany as jest.Mock).mockResolvedValue([
        { id: 'act-1', category: { name: 'Transport' } },
      ]);
      (prisma.activityCategory.findMany as jest.Mock).mockResolvedValue([
        { id: 'cat-1', name: 'Transport', icon: '🚗' },
        { id: 'cat-2', name: 'Food', icon: '🍽️' },
      ]);
      (prisma.dashboardCache.upsert as jest.Mock).mockResolvedValue({});

      const result = await DashboardService.getSummary('user-123', 'month');

      expect(result.totalEmissionKg).toBe(80);
      expect(result.timeRange).toBe('month');
      expect(result.categoryBreakdown).toEqual([
        { category: 'Transport', icon: '🚗', totalKg: 50 },
        { category: 'Food', icon: '🍽️', totalKg: 30 },
      ]);
      expect(prisma.dashboardCache.upsert).toHaveBeenCalled();
    });

    it('should compute fresh data when no cache exists', async () => {
      (prisma.dashboardCache.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.userProfile.findUnique as jest.Mock).mockResolvedValue(null); // no profile
      (prisma.userProfile.count as jest.Mock).mockResolvedValue(0);

      (prisma.activity.aggregate as jest.Mock).mockResolvedValue({ _sum: { emissionKg: 0 } });
      (prisma.activity.groupBy as jest.Mock).mockResolvedValue([]);
      (prisma.activity.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.activityCategory.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.dashboardCache.upsert as jest.Mock).mockResolvedValue({});

      const result = await DashboardService.getSummary('user-no-data', 'week');

      expect(result.totalEmissionKg).toBe(0);
      expect(result.timeRange).toBe('week');
      // Regional average should fall back to static default for 'global', scaled to week (400/4=100)
      expect(result.regionalAverageKg).toBe(100);
    });

    it('should use static regional average for year time range', async () => {
      (prisma.dashboardCache.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.userProfile.findUnique as jest.Mock).mockResolvedValue({ country: 'United States' });
      (prisma.userProfile.count as jest.Mock).mockResolvedValue(0);

      (prisma.activity.aggregate as jest.Mock).mockResolvedValue({ _sum: { emissionKg: 500 } });
      (prisma.activity.groupBy as jest.Mock).mockResolvedValue([]);
      (prisma.activity.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.activityCategory.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.dashboardCache.upsert as jest.Mock).mockResolvedValue({});

      const result = await DashboardService.getSummary('user-us', 'year');

      // US static default is 1400, scaled to year = 1400 * 12 = 16800
      expect(result.regionalAverageKg).toBe(16800);
    });
  });
});
