import { Router } from 'express';
import { getSiteSettingsController, saveSiteSettingsController } from '../controllers/settings.controller.js';
import { authMiddleware } from '../middleware/auth.js';
import { adminActionLimiter } from '../middleware/security.js';

const router = Router();

router.get('/:id', getSiteSettingsController);
router.put('/:id', adminActionLimiter, authMiddleware, saveSiteSettingsController);

export default router;
