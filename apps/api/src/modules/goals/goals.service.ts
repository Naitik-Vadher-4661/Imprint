import { prisma } from '../../config/database';
import { GoalStatus } from '../../types/enums';
import { GamificationService } from '../gamification/gamification.service';

export class GoalsService {
  static async getUserGoals(userId: string) {
    return prisma.goal.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async createGoal(userId: string, data: any) {
    return prisma.goal.create({
      data: {
        userId,
        ...data,
      },
    });
  }

  static async updateGoalProgress(userId: string, goalId: string, progressValue: number) {
    const goal = await prisma.goal.findUnique({ where: { id: goalId } });
    if (!goal || goal.userId !== userId) throw new Error('Goal not found');

    const newCurrentValue = goal.currentValue + progressValue;
    const newStatus: GoalStatus = newCurrentValue >= goal.targetValue
      ? GoalStatus.COMPLETED
      : GoalStatus.ACTIVE;

    return prisma.goal.update({
      where: { id: goalId },
      data: {
        currentValue: newCurrentValue,
        status: newStatus,
        ...(newStatus === GoalStatus.COMPLETED && !goal.completedAt ? { completedAt: new Date() } : {}),
      },
    });
  }

  static async markGoalCompleted(userId: string, goalId: string) {
    const goal = await prisma.goal.findUnique({ where: { id: goalId } });
    if (!goal || goal.userId !== userId) throw new Error('Goal not found');

    const updated = await prisma.goal.update({
      where: { id: goalId },
      data: {
        status: GoalStatus.COMPLETED,
        currentValue: goal.targetValue, // Set current to target to ensure it's logically complete
        completedAt: goal.completedAt || new Date(),
      },
    });

    const newBadges = await GamificationService.checkAndAwardBadges(userId);
    return { goal: updated, newBadges };
  }
}
