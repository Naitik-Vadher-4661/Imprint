import { AuthService } from '../auth.service';
import { prisma } from '../../../config/database';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

jest.mock('../../../config/database', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    userProfile: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    refreshToken: {
      create: jest.fn(),
    },
    dashboardCache: {
      deleteMany: jest.fn(),
    },
  },
}));

jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(),
}));

describe('AuthService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should throw error if email is already registered', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: '1', email: 'test@example.com' });

      await expect(
        AuthService.register({ email: 'test@example.com', password: 'password', name: 'Test User' })
      ).rejects.toThrow('Email already registered');
    });

    it('should hash password, create user, and generate tokens successfully', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');
      (prisma.user.create as jest.Mock).mockResolvedValue({
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
      });
      (jwt.sign as jest.Mock).mockReturnValue('token-abc');

      const result = await AuthService.register({
        email: 'test@example.com',
        password: 'password',
        name: 'Test User',
      });

      expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email: 'test@example.com' } });
      expect(bcrypt.hash).toHaveBeenCalledWith('password', 10);
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          email: 'test@example.com',
          name: 'Test User',
          password: 'hashed_password',
          profile: { create: {} },
        },
      });
      expect(prisma.refreshToken.create).toHaveBeenCalled();
      expect(result).toEqual({
        user: { id: 'user-123', email: 'test@example.com', name: 'Test User' },
        accessToken: 'token-abc',
        refreshToken: 'token-abc',
      });
    });
  });

  describe('login', () => {
    it('should throw error if user is not found', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        AuthService.login({ email: 'test@example.com', password: 'password' })
      ).rejects.toThrow('Invalid email or password');
    });

    it('should throw error if password comparison fails', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: '1', password: 'hashed' });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        AuthService.login({ email: 'test@example.com', password: 'password' })
      ).rejects.toThrow('Invalid email or password');
    });

    it('should return user and tokens on successful login', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'user-123',
        email: 'test@example.com',
        password: 'hashed',
        name: 'Test User',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock).mockReturnValue('token-xyz');

      const result = await AuthService.login({ email: 'test@example.com', password: 'password' });

      expect(result.user).toEqual({ id: 'user-123', email: 'test@example.com', name: 'Test User' });
      expect(result.accessToken).toBe('token-xyz');
    });
  });

  describe('getProfile', () => {
    it('should return user metadata and profile details', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({ email: 'test@example.com', name: 'Test' });
      (prisma.userProfile.findUnique as jest.Mock).mockResolvedValue({ userId: 'user-123', country: 'US' });

      const result = await AuthService.getProfile('user-123');

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        select: { email: true, name: true, createdAt: true },
      });
      expect(prisma.userProfile.findUnique).toHaveBeenCalledWith({ where: { userId: 'user-123' } });
      expect(result).toEqual({
        user: { email: 'test@example.com', name: 'Test' },
        profile: { userId: 'user-123', country: 'US' },
      });
    });
  });

  describe('updateProfile', () => {
    it('should update user profile and invalidate dashboard cache', async () => {
      (prisma.userProfile.update as jest.Mock).mockResolvedValue({ userId: 'user-123', country: 'US' });

      const result = await AuthService.updateProfile('user-123', { country: 'US', primaryTransport: 'Car' });

      expect(prisma.userProfile.update).toHaveBeenCalledWith({
        where: { userId: 'user-123' },
        data: {
          country: 'US',
          householdSize: undefined,
          primaryTransport: 'car',
          dietaryPreference: undefined,
          onboardingComplete: undefined,
        },
      });
      expect(prisma.dashboardCache.deleteMany).toHaveBeenCalledWith({ where: { userId: 'user-123' } });
      expect(result).toEqual({ profile: { userId: 'user-123', country: 'US' } });
    });
  });
});
