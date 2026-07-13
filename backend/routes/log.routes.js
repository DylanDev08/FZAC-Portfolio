import { Router } from 'express';
import { createLoginLogController, listLoginLogsController } from '../controllers/log.controller.js';
import { authMiddleware } from '../middleware/auth.js';
import { loginLogLimiter } from '../middleware/security.js';

const router = Router();

router.post('/', loginLogLimiter, createLoginLogController);
router.get('/', authMiddleware, listLoginLogsController);

export default router;
