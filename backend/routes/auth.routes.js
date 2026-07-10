import { Router } from 'express';
import { loginLimiter } from '../middleware/security.js';
import { loginController, registerAdminController } from '../controllers/auth.controller.js';
import { validatePayload } from './fzac.routes.js';

const router = Router();

router.post('/login', loginLimiter, validatePayload, loginController);
router.post('/register', loginLimiter, validatePayload, registerAdminController);

export default router;
