import { prisma } from '../../config/database';

export class GamificationService {
  static async getTasks() {
    return prisma.goalPreset.findMany();
  }

  static async getBadges(userId: string) {
    const allBadges = await prisma.badge.findMany({
      orderBy: { sortOrder: 'asc' },
    });
    
    const userBadges = await prisma.userBadge.findMany({
      where: { userId },
      select: { badgeId: true, unlockedAt: true },
    });

    const userBadgeMap = new Map(userBadges.map(ub => [ub.badgeId, ub.unlockedAt]));

    return allBadges.map(badge => ({
      ...badge,
      unlockedAt: userBadgeMap.get(badge.id) || null,
      isUnlocked: userBadgeMap.has(badge.id),
    }));
  }

  static async acceptTask(userId: string, presetId: string) {
    const preset = await prisma.goalPreset.findUnique({ where: { id: presetId } });
    if (!preset) throw new Error('Task not found');

    const existingGoal = await prisma.goal.findFirst({
      where: {
        userId,
        presetId,
        status: 'ACTIVE',
      },
    });

    if (existingGoal) {
      throw new Error('You already have an active goal for this task.');
    }

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + preset.durationDays);

    return prisma.goal.create({
      data: {
        userId,
        presetId: preset.id,
        name: preset.name,
        description: preset.description,
        type: preset.type,
        targetValue: preset.targetValue,
        startDate,
        endDate,
      },
    });
  }

  static async checkAndAwardBadges(userId: string) {
    // Count how many goals this user has completed
    const completedGoalsCount = await prisma.goal.count({
      where: { userId, status: 'COMPLETED' },
    });

    const unlockedBadges = [];

    // Define task completion badge thresholds based on slug
    const badgeChecks = [
      { slug: 'achiever', required: 1 },
      { slug: 'hat_trick', required: 3 },
      { slug: 'task_novice', required: 5 },
      { slug: 'task_pro', required: 15 },
      { slug: 'task_master', required: 50 },
    ];

    for (const check of badgeChecks) {
      if (completedGoalsCount >= check.required) {
        // Find badge ID
        const badge = await prisma.badge.findUnique({ where: { slug: check.slug } });
        if (!badge) continue;

        // Check if user already has it
        const existing = await prisma.userBadge.findUnique({
          where: {
            userId_badgeId: { userId, badgeId: badge.id },
          },
        });

        if (!existing) {
          await prisma.userBadge.create({
            data: { userId, badgeId: badge.id },
          });
          unlockedBadges.push(badge.name);
        }
      }
    }

    return unlockedBadges;
  }
}
