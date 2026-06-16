import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../config/database';
import { config } from '../../config/env';

export interface RegisterInput {
  email: string;
  password: string;
  name: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export class AuthService {
  static async register(data: RegisterInput) {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw { statusCode: 409, code: 'USER_EXISTS', message: 'Email already registered' };
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        password: hashedPassword,
        profile: {
          create: {}, // Creates empty profile
        },
      },
    });

    const tokens = await this.generateTokens(user.id);
    return { user: { id: user.id, email: user.email, name: user.name }, ...tokens };
  }

  static async login(data: LoginInput) {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user || !(await bcrypt.compare(data.password, user.password))) {
      throw { statusCode: 401, code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' };
    }

    const tokens = await this.generateTokens(user.id);
    return { user: { id: user.id, email: user.email, name: user.name }, ...tokens };
  }

  static async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true, createdAt: true }
    });
    const profile = await prisma.userProfile.findUnique({
      where: { userId }
    });
    return { user, profile };
  }

  static async updateProfile(userId: string, data: any) {
    const profile = await prisma.userProfile.update({
      where: { userId },
      data: {
        country: data.country,
        householdSize: data.householdSize ? Number(data.householdSize) : undefined,
        primaryTransport: data.primaryTransport,
        dietaryPreference: data.dietType,
      },
    });
    return { profile };
  }

  private static async generateTokens(userId: string) {
    const accessToken = jwt.sign({ userId }, config.JWT_SECRET, {
      expiresIn: config.JWT_ACCESS_TTL as any,
    });

    const refreshToken = jwt.sign({ userId }, config.JWT_REFRESH_SECRET, {
      expiresIn: config.JWT_REFRESH_TTL as any,
    });

    // Hash the refresh token before storing it
    const tokenHash = await bcrypt.hash(refreshToken, 10);
    const tokenFamily = crypto.randomUUID();

    await prisma.refreshToken.create({
      data: {
        userId,
        tokenHash,
        tokenFamily,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    return { accessToken, refreshToken };
  }
}
