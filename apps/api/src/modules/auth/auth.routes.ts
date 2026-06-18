import { Router } from 'express';
import { AuthController } from './auth.controller';
import { validate } from '../../middleware/validate';
import { authenticate } from '../../middleware/auth';
import { z } from 'zod';

const RegisterSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
});

const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

const router = Router();

router.post('/register', validate(RegisterSchema), AuthController.register);
router.post('/login', validate(LoginSchema), AuthController.login);

const ProfileSchema = z.object({
  country: z.string().optional(),
  householdSize: z.number().or(z.string()).optional(),
  primaryTransport: z.string().optional(),
  dietType: z.string().optional(),
  dietaryPreference: z.string().optional(),
  onboardingComplete: z.boolean().optional(),
});

router.get('/profile', authenticate, AuthController.getProfile);
router.patch('/profile', authenticate, validate(ProfileSchema), AuthController.updateProfile);

export default router;
