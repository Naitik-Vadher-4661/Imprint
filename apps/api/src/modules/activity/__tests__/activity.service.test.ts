import { ActivityService } from '../activity.service';
import { prisma } from '../../../config/database';
import { CarbonCalculator } from '../../../utils/carbonCalculator';
import { MeasurementUnit } from '../../../types/enums';

jest.mock('../../../config/database', () => ({
  prisma: {
    userProfile: {
      findUnique: jest.fn(),
    },
    activity: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
    },
    dashboardCache: {
      deleteMany: jest.fn(),
    },
  },
}));

jest.mock('../../../utils/carbonCalculator', () => ({
  CarbonCalculator: {
    calculateEmission: jest.fn(),
  },
}));

describe('ActivityService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createActivity', () => {
    it('should create an activity and invalidate cache', async () => {
      (prisma.userProfile.findUnique as jest.Mock).mockResolvedValue({ country: 'IN' });
      (CarbonCalculator.calculateEmission as jest.Mock).mockResolvedValue({
        emissionKg: 12.5,
        source: 'ClimateIQ API',
      });
      const mockActivity = {
        id: 'act-123',
        userId: 'user-123',
        categoryId: 'cat-trans',
        subcategory: 'car',
        displayName: 'Commute to office',
        value: 15,
        unit: MeasurementUnit.KM,
        emissionKg: 12.5,
        notes: 'weekly ride',
        loggedAt: new Date('2026-06-18T10:00:00Z'),
        isQuickLog: false,
      };
      (prisma.activity.create as jest.Mock).mockResolvedValue(mockActivity);

      const result = await ActivityService.createActivity('user-123', {
        categoryId: 'cat-trans',
        subcategory: 'car',
        displayName: 'Commute to office',
        value: 15,
        unit: MeasurementUnit.KM,
        notes: 'weekly ride',
        loggedAt: '2026-06-18T10:00:00Z',
      });

      expect(prisma.userProfile.findUnique).toHaveBeenCalledWith({ where: { userId: 'user-123' } });
      expect(CarbonCalculator.calculateEmission).toHaveBeenCalledWith(
        'cat-trans',
        'car',
        15,
        MeasurementUnit.KM,
        'IN'
      );
      expect(prisma.activity.create).toHaveBeenCalledWith({
        data: {
          userId: 'user-123',
          categoryId: 'cat-trans',
          subcategory: 'car',
          displayName: 'Commute to office',
          value: 15,
          unit: MeasurementUnit.KM,
          emissionKg: 12.5,
          notes: 'weekly ride',
          loggedAt: new Date('2026-06-18T10:00:00Z'),
          isQuickLog: false,
        },
      });
      expect(prisma.dashboardCache.deleteMany).toHaveBeenCalledWith({ where: { userId: 'user-123' } });
      expect(result).toEqual({
        ...mockActivity,
        _meta: { emissionSource: 'ClimateIQ API' },
      });
    });
  });

  describe('getActivities', () => {
    it('should list activities with pagination', async () => {
      const mockItems = [
        { id: 'act-1', displayName: 'Activity 1', category: { name: 'Transport' } },
        { id: 'act-2', displayName: 'Activity 2', category: { name: 'Food' } },
      ];
      (prisma.activity.findMany as jest.Mock).mockResolvedValue(mockItems);
      (prisma.activity.count as jest.Mock).mockResolvedValue(10);

      const result = await ActivityService.getActivities('user-123', 0, 2);

      expect(prisma.activity.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-123' },
        orderBy: { loggedAt: 'desc' },
        skip: 0,
        take: 2,
        include: { category: true },
      });
      expect(prisma.activity.count).toHaveBeenCalledWith({ where: { userId: 'user-123' } });
      expect(result).toEqual({ items: mockItems, total: 10 });
    });
  });

  describe('deleteActivity', () => {
    it('should throw error if activity not found or belongs to another user', async () => {
      (prisma.activity.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        ActivityService.deleteActivity('user-123', 'act-999')
      ).rejects.toThrow('Activity not found');

      (prisma.activity.findUnique as jest.Mock).mockResolvedValue({ id: 'act-1', userId: 'user-other' });

      await expect(
        ActivityService.deleteActivity('user-123', 'act-1')
      ).rejects.toThrow('Activity not found');
    });

    it('should delete activity and invalidate dashboard cache on success', async () => {
      (prisma.activity.findUnique as jest.Mock).mockResolvedValue({ id: 'act-1', userId: 'user-123' });
      (prisma.activity.delete as jest.Mock).mockResolvedValue({});

      const result = await ActivityService.deleteActivity('user-123', 'act-1');

      expect(prisma.activity.delete).toHaveBeenCalledWith({ where: { id: 'act-1' } });
      expect(prisma.dashboardCache.deleteMany).toHaveBeenCalledWith({ where: { userId: 'user-123' } });
      expect(result).toEqual({ success: true });
    });
  });
});
