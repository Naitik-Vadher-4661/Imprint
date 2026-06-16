import { Router } from 'express';
import { ActivityController } from './activity.controller';
import { authenticate } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { CreateActivitySchema } from './activity.schema';

const router = Router();

router.use(authenticate);

router.post('/', validate(CreateActivitySchema), ActivityController.createActivity);
router.get('/', ActivityController.getActivities);
router.delete('/:id', ActivityController.deleteActivity);

export default router;
