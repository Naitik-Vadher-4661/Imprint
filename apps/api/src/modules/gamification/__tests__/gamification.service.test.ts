import { GamificationService } from '../gamification.service';
import { prisma } from '../../../config/database';

jest.mock('../../../config/database', () => ({
  prisma: {
    goalPreset: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
    badge: {
      findMany: jest.fn(),
    },
    userBadge: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
    goal: {
      findFirst: jest.fn(),
      create: jest.fn(),
      count: jest.fn(),
    },
  },
}));

describe('GamificationService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getTasks', () => {
    it('should fetch all goal presets', async () => {
      const presets = [{ id: '1', name: 'Preset 1' }];
      (prisma.goalPreset.findMany as jest.Mock).mockResolvedValue(presets);

      const result = await GamificationService.getTasks();
      expect(prisma.goalPreset.findMany).toHaveBeenCalled();
      expect(result).toEqual(presets);
    });
  });

  describe('getBadges', () => {
    it('should retrieve badges and mark which ones are unlocked by user', async () => {
      const allBadges = [
        { id: 'badge-1', name: 'Achiever', sortOrder: 1 },
        { id: 'badge-2', name: 'Eco Warrior', sortOrder: 2 },
      ];
      const userBadges = [
        { badgeId: 'badge-1', unlockedAt: new Date('2026-06-18T10:00:00Z') },
      ];
      (prisma.badge.findMany as jest.Mock).mockResolvedValue(allBadges);
      (prisma.userBadge.findMany as jest.Mock).mockResolvedValue(userBadges);

      const result = await GamificationService.getBadges('user-123');

      expect(prisma.badge.findMany).toHaveBeenCalledWith({ orderBy: { sortOrder: 'asc' } });
      expect(prisma.userBadge.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-123' },
        select: { badgeId: true, unlockedAt: true },
      });
      expect(result).toEqual([
        { id: 'badge-1', name: 'Achiever', sortOrder: 1, unlockedAt: new Date('2026-06-18T10:00:00Z'), isUnlocked: true },
        { id: 'badge-2', name: 'Eco Warrior', sortOrder: 2, unlockedAt: null, isUnlocked: false },
      ]);
    });
  });

  describe('acceptTask', () => {
    it('should throw error if task preset does not exist', async () => {
      (prisma.goalPreset.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        GamificationService.acceptTask('user-123', 'preset-999')
      ).rejects.toThrow('Task not found');
    });

    it('should throw error if user already has an active goal for this preset', async () => {
      (prisma.goalPreset.findUnique as jest.Mock).mockResolvedValue({ id: 'preset-1', durationDays: 7 });
      (prisma.goal.findFirst as jest.Mock).mockResolvedValue({ id: 'goal-1', status: 'ACTIVE' });

      await expect(
        GamificationService.acceptTask('user-123', 'preset-1')
      ).rejects.toThrow('You already have an active goal for this task.');
    });

    it('should create a new active goal with correct duration', async () => {
      (prisma.goalPreset.findUnique as jest.Mock).mockResolvedValue({
        id: 'preset-1',
        name: 'Task 1',
        description: 'Do something',
        type: 'CARBON_REDUCTION',
        targetValue: 10,
        durationDays: 7,
      });
      (prisma.goal.findFirst as jest.Mock).mockResolvedValue(null);
      
      const mockGoal = { id: 'goal-123', name: 'Task 1', status: 'ACTIVE' };
      (prisma.goal.create as jest.Mock).mockResolvedValue(mockGoal);

      const result = await GamificationService.acceptTask('user-123', 'preset-1');

      expect(prisma.goal.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({
          userId: 'user-123',
          presetId: 'preset-1',
          name: 'Task 1',
          description: 'Do something',
          type: 'CARBON_REDUCTION',
          targetValue: 10,
        }),
      }));
      expect(result).toEqual(mockGoal);
    });
  });

  describe('checkAndAwardBadges', () => {
    it('should award new badges if user reaches completed goals threshold', async () => {
      (prisma.goal.count as jest.Mock).mockResolvedValue(4); // Achieved 'achiever' (1) and 'hat_trick' (3)
      (prisma.badge.findMany as jest.Mock).mockResolvedValue([
        { id: 'b-achiever', name: 'Achiever', slug: 'achiever' },
        { id: 'b-hat-trick', name: 'Hat Trick', slug: 'hat_trick' },
        { id: 'b-novice', name: 'Task Novice', slug: 'task_novice' },
      ]);
      (prisma.userBadge.findMany as jest.Mock).mockResolvedValue([
        { badgeId: 'b-achiever' }, // Already unlocked achiever
      ]);
      (prisma.userBadge.create as jest.Mock).mockResolvedValue({});

      const result = await GamificationService.checkAndAwardBadges('user-123');

      expect(prisma.goal.count).toHaveBeenCalledWith({
        where: { userId: 'user-123', status: 'COMPLETED' },
      });
      expect(prisma.badge.findMany).toHaveBeenCalled();
      expect(prisma.userBadge.findMany).toHaveBeenCalled();
      // Should create user badge only for Hat Trick (since Achiever was already unlocked, and Task Novice threshold of 5 is not met)
      expect(prisma.userBadge.create).toHaveBeenCalledWith({
        data: { userId: 'user-123', badgeId: 'b-hat-trick' },
      });
      expect(prisma.userBadge.create).toHaveBeenCalledTimes(1);
      expect(result).toEqual(['Hat Trick']);
    });
  });
});
