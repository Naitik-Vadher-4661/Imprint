import { z } from 'zod';

export const CreateGoalSchema = z.object({
  name: z.string().min(1, 'Goal name is required').max(100),
  description: z.string().max(500).optional(),
  type: z.string().min(1),
  targetValue: z.number().positive('Target value must be positive'),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime(),
  presetId: z.string().uuid().optional(),
  categoryId: z.string().uuid().optional(),
  baselineValue: z.number().optional(),
});

export type CreateGoalInput = z.infer<typeof CreateGoalSchema>;
