import { z } from 'zod';

export const RegisterSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
});

export type RegisterInput = z.infer<typeof RegisterSchema>;

export const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export type LoginInput = z.infer<typeof LoginSchema>;

export const RefreshTokenSchema = z.object({
  refreshToken: z.string(),
});

export const RequestPasswordResetSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const ResetPasswordSchema = z.object({
  token: z.string(),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
});

export const UpdateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  country: z.string().optional(),
  householdSize: z.number().min(1).optional(),
  primaryTransport: z.string().optional(),
  dietaryPreference: z.string().optional(),
  homeEnergySource: z.string().optional(),
  avgCommuteKm: z.number().min(0).optional(),
  measurementSystem: z.enum(['metric', 'imperial']).optional(),
  onboardingComplete: z.boolean().optional(),
});
