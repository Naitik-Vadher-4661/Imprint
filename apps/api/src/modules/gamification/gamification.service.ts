import { prisma } from '../../config/database';
import { AppError } from '../../utils/AppError';

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
    if (!preset) throw AppError.notFound('Task not found');

    const existingGoal = await prisma.goal.findFirst({
      where: {
        userId,
        presetId,
        status: 'ACTIVE',
      },
    });

    if (existingGoal) {
      throw AppError.conflict('You already have an active goal for this task.');
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

    const badgeChecks = [
      { slug: 'achiever', required: 1 },
      { slug: 'hat_trick', required: 3 },
      { slug: 'task_novice', required: 5 },
      { slug: 'task_pro', required: 15 },
      { slug: 'task_master', required: 50 },
    ];

    // Batch load all relevant badges
    const slugs = badgeChecks.map(b => b.slug);
    const badges = await prisma.badge.findMany({
      where: { slug: { in: slugs } },
    });

    // Batch load all existing user badges
    const badgeIds = badges.map(b => b.id);
    const existingUserBadges = await prisma.userBadge.findMany({
      where: {
        userId,
        badgeId: { in: badgeIds },
      },
      select: { badgeId: true },
    });

    const existingBadgeIds = new Set(existingUserBadges.map(ub => ub.badgeId));
    const unlockedBadges: string[] = [];

    for (const check of badgeChecks) {
      if (completedGoalsCount >= check.required) {
        const badge = badges.find(b => b.slug === check.slug);
        if (!badge) continue;

        if (!existingBadgeIds.has(badge.id)) {
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

