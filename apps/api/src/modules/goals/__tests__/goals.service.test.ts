import { GoalsService } from '../goals.service';
import { prisma } from '../../../config/database';
import { GamificationService } from '../../gamification/gamification.service';
import { GoalStatus } from '../../../types/enums';

jest.mock('../../../config/database', () => ({
  prisma: {
    goal: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  },
}));

jest.mock('../../gamification/gamification.service', () => ({
  GamificationService: {
    checkAndAwardBadges: jest.fn(),
  },
}));

describe('GoalsService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserGoals', () => {
    it('should return all goals for a user ordered by creation date descending', async () => {
      const mockGoals = [
        { id: 'g-2', name: 'Goal 2', createdAt: new Date('2026-06-20') },
        { id: 'g-1', name: 'Goal 1', createdAt: new Date('2026-06-10') },
      ];
      (prisma.goal.findMany as jest.Mock).mockResolvedValue(mockGoals);

      const result = await GoalsService.getUserGoals('user-123');

      expect(prisma.goal.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-123' },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual(mockGoals);
    });

    it('should return empty array if no goals exist', async () => {
      (prisma.goal.findMany as jest.Mock).mockResolvedValue([]);

      const result = await GoalsService.getUserGoals('user-no-goals');
      expect(result).toEqual([]);
    });
  });

  describe('createGoal', () => {
    it('should create a goal with provided data and optional fields', async () => {
      const mockGoal = { id: 'g-new', name: 'Cut emissions 10%' };
      (prisma.goal.create as jest.Mock).mockResolvedValue(mockGoal);

      const input = {
        name: 'Cut emissions 10%',
        description: 'Reduce by 10%',
        type: 'REDUCTION_PERCENTAGE',
        targetValue: 10,
        endDate: '2026-07-01T00:00:00.000Z',
        presetId: 'preset-1',
        categoryId: 'cat-1',
        baselineValue: 100,
      };

      const result = await GoalsService.createGoal('user-123', input);

      expect(prisma.goal.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: 'user-123',
          name: 'Cut emissions 10%',
          description: 'Reduce by 10%',
          type: 'REDUCTION_PERCENTAGE',
          targetValue: 10,
          presetId: 'preset-1',
          categoryId: 'cat-1',
          baselineValue: 100,
        }),
      });
      expect(result).toEqual(mockGoal);
    });

    it('should default startDate to now when not provided', async () => {
      (prisma.goal.create as jest.Mock).mockResolvedValue({ id: 'g-1' });

      await GoalsService.createGoal('user-123', {
        name: 'Test',
        type: 'ACTIVITY_COUNT',
        targetValue: 5,
        endDate: '2026-07-01T00:00:00.000Z',
      });

      const createCall = (prisma.goal.create as jest.Mock).mock.calls[0][0];
      expect(createCall.data.startDate).toBeInstanceOf(Date);
    });
  });

  describe('updateGoalProgress', () => {
    it('should throw error if goal not found', async () => {
      (prisma.goal.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        GoalsService.updateGoalProgress('user-123', 'g-999', 5)
      ).rejects.toThrow('Goal not found');
    });

    it('should throw error if goal belongs to another user', async () => {
      (prisma.goal.findUnique as jest.Mock).mockResolvedValue({
        id: 'g-1',
        userId: 'user-other',
        currentValue: 0,
        targetValue: 10,
      });

      await expect(
        GoalsService.updateGoalProgress('user-123', 'g-1', 5)
      ).rejects.toThrow('Goal not found');
    });

    it('should increment currentValue and keep status ACTIVE when target not met', async () => {
      (prisma.goal.findUnique as jest.Mock).mockResolvedValue({
        id: 'g-1',
        userId: 'user-123',
        currentValue: 3,
        targetValue: 10,
      });
      (prisma.goal.update as jest.Mock).mockResolvedValue({ id: 'g-1', currentValue: 8, status: 'ACTIVE' });

      await GoalsService.updateGoalProgress('user-123', 'g-1', 5);

      expect(prisma.goal.update).toHaveBeenCalledWith({
        where: { id: 'g-1' },
        data: {
          currentValue: 8,
          status: GoalStatus.ACTIVE,
        },
      });
    });

    it('should mark goal COMPLETED when progress meets target', async () => {
      (prisma.goal.findUnique as jest.Mock).mockResolvedValue({
        id: 'g-1',
        userId: 'user-123',
        currentValue: 7,
        targetValue: 10,
        completedAt: null,
      });
      (prisma.goal.update as jest.Mock).mockResolvedValue({ id: 'g-1', currentValue: 12, status: 'COMPLETED' });

      await GoalsService.updateGoalProgress('user-123', 'g-1', 5);

      const updateCall = (prisma.goal.update as jest.Mock).mock.calls[0][0];
      expect(updateCall.data.status).toBe(GoalStatus.COMPLETED);
      expect(updateCall.data.currentValue).toBe(12);
      expect(updateCall.data.completedAt).toBeInstanceOf(Date);
    });
  });

  describe('markGoalCompleted', () => {
    it('should throw error if goal not found', async () => {
      (prisma.goal.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        GoalsService.markGoalCompleted('user-123', 'g-999')
      ).rejects.toThrow('Goal not found');
    });

    it('should set status to COMPLETED, align currentValue to target, and check badges', async () => {
      const mockGoal = {
        id: 'g-1',
        userId: 'user-123',
        currentValue: 3,
        targetValue: 10,
        completedAt: null,
      };
      (prisma.goal.findUnique as jest.Mock).mockResolvedValue(mockGoal);

      const updatedGoal = { ...mockGoal, status: GoalStatus.COMPLETED, currentValue: 10 };
      (prisma.goal.update as jest.Mock).mockResolvedValue(updatedGoal);
      (GamificationService.checkAndAwardBadges as jest.Mock).mockResolvedValue(['Achiever']);

      const result = await GoalsService.markGoalCompleted('user-123', 'g-1');

      expect(prisma.goal.update).toHaveBeenCalledWith({
        where: { id: 'g-1' },
        data: expect.objectContaining({
          status: GoalStatus.COMPLETED,
          currentValue: 10,
        }),
      });
      expect(GamificationService.checkAndAwardBadges).toHaveBeenCalledWith('user-123');
      expect(result).toEqual({ goal: updatedGoal, newBadges: ['Achiever'] });
    });
  });
});
