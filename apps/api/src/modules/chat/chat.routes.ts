import { Router } from 'express';
import { ChatController } from './chat.controller';
import { validate } from '../../middleware/validate';
import { authenticate } from '../../middleware/auth';
import { z } from 'zod';

const ChatSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty'),
  history: z.array(
    z.object({
      role: z.enum(['user', 'assistant']),
      content: z.string(),
    })
  ).optional(),
});

const router = Router();

router.post('/', authenticate, validate(ChatSchema), ChatController.chat);

export default router;
