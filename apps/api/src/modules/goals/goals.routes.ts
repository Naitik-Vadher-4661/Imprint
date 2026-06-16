import { Router } from 'express';
import { GoalsController } from './goals.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', GoalsController.getGoals);
router.post('/', GoalsController.createGoal);
router.patch('/:id/progress', GoalsController.updateProgress);
router.post('/:id/complete', GoalsController.markComplete);

export default router;
