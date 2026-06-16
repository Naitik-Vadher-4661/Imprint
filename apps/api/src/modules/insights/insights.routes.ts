import { Router } from 'express';
import { InsightsController } from './insights.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', InsightsController.getInsights);
router.post('/generate', InsightsController.generateInsights);
router.patch('/:id/action', InsightsController.markActioned);

export default router;
