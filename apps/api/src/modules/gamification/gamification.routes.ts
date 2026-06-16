import { Router } from 'express';
import { GamificationController } from './gamification.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

router.get('/tasks', authenticate, GamificationController.getTasks);
router.post('/tasks/accept', authenticate, GamificationController.acceptTask);
router.get('/badges', authenticate, GamificationController.getBadges);

export default router;
