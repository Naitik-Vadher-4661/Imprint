import { z } from 'zod';
import { MeasurementUnit } from '../../types/enums';

export const CreateActivitySchema = z.object({
  categoryId: z.string().uuid(),
  subcategory: z.string(),
  displayName: z.string(),
  value: z.number().positive(),
  unit: z.nativeEnum(MeasurementUnit),
  notes: z.string().max(500).optional(),
  loggedAt: z.string().datetime().optional(),
  isQuickLog: z.boolean().optional(),
});

export type CreateActivityInput = z.infer<typeof CreateActivitySchema>;

export const UpdateActivitySchema = CreateActivitySchema.partial();
export type UpdateActivityInput = z.infer<typeof UpdateActivitySchema>;
