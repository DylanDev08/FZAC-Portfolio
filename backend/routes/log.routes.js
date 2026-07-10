import { Router } from 'express';
import { createLoginLogController, listLoginLogsController } from '../controllers/log.controller.js';
import { authMiddleware } from '../middleware/auth.js';
import { loginLimiter } from '../middleware/security.js';

const router = Router();

router.post('/', loginLimiter, createLoginLogController);
router.get('/', authMiddleware, listLoginLogsController);

export default router;
