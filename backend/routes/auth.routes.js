import { Router } from 'express';
import { adminActionLimiter } from '../middleware/security.js';
import { authMiddleware } from '../middleware/auth.js';
import { bootstrapAdminController } from '../controllers/auth.controller.js';

const router = Router();

router.post('/admin/bootstrap', authMiddleware, adminActionLimiter, bootstrapAdminController);

export default router;
