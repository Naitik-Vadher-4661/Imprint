import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding demo user...');

  const email = 'demo@example.com';
  const password = 'password123';
  const hashedPassword = await bcrypt.hash(password, 10);

  // Clean up existing demo user
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    await prisma.user.delete({ where: { id: existingUser.id } });
  }

  // Create user
  const user = await prisma.user.create({
    data: {
      email,
      name: 'Demo User',
      password: hashedPassword,
      profile: {
        create: {
          country: 'United States',
          householdSize: 2,
          primaryTransport: 'Car (Electric)',
          dietaryPreference: 'Vegetarian',
          homeEnergySource: 'Electricity',
          avgCommuteKm: 15,
        },
      },
      streak: {
        create: {
          currentStreak: 5,
          longestStreak: 12,
          lastActivityAt: new Date(),
        }
      }
    },
  });

  // Need categories
  const transportCategory = await prisma.activityCategory.findFirst({ where: { slug: 'transport' } });
  const foodCategory = await prisma.activityCategory.findFirst({ where: { slug: 'food' } });

  // Seed Activities
  if (transportCategory) {
    await prisma.activity.createMany({
      data: [
        {
          userId: user.id,
          categoryId: transportCategory.id,
          subcategory: 'car_electric',
          displayName: 'Car (Electric)',
          value: 20,
          unit: 'km',
          emissionKg: 1.06,
          loggedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        },
        {
          userId: user.id,
          categoryId: transportCategory.id,
          subcategory: 'bicycle',
          displayName: 'Bicycle',
          value: 5,
          unit: 'km',
          emissionKg: 0,
          loggedAt: new Date(),
        }
      ]
    });
  }

  if (foodCategory) {
    await prisma.activity.createMany({
      data: [
        {
          userId: user.id,
          categoryId: foodCategory.id,
          subcategory: 'vegetarian_meal',
          displayName: 'Vegetarian Meal',
          value: 1,
          unit: 'meal',
          emissionKg: 0.5,
          loggedAt: new Date(),
        }
      ]
    });
  }

  // Seed Goals
  const preset = await prisma.goalPreset.findFirst();
  if (preset) {
    await prisma.goal.create({
      data: {
        userId: user.id,
        presetId: preset.id,
        name: 'Weekly Vegan Challenge',
        description: 'Eat vegan meals for a week',
        type: 'ACTIVITY_COUNT',
        targetValue: 7,
        currentValue: 3,
        status: 'ACTIVE',
        startDate: new Date(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      }
    });
  }

  // Seed Badges
  const firstStepBadge = await prisma.badge.findUnique({ where: { slug: 'first_step' } });
  if (firstStepBadge) {
    await prisma.userBadge.create({
      data: {
        userId: user.id,
        badgeId: firstStepBadge.id,
      }
    });
  }

  console.log('Demo user seeded successfully!');
  console.log('Email:', email);
  console.log('Password:', password);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
