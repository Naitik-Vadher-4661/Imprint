import { Router } from 'express';
import { GoalsController } from './goals.controller';
import { authenticate } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { CreateGoalSchema } from './goals.schema';

const router = Router();

router.use(authenticate);

router.get('/', GoalsController.getGoals);
router.post('/', validate(CreateGoalSchema), GoalsController.createGoal);
router.patch('/:id/progress', GoalsController.updateProgress);
router.post('/:id/complete', GoalsController.markComplete);

export default router;

