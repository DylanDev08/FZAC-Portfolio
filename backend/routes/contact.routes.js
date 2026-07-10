import { Router } from 'express';
import { createContactController, listContactsController, updateContactController } from '../controllers/contact.controller.js';
import { authMiddleware } from '../middleware/auth.js';
import { adminActionLimiter } from '../middleware/security.js';

const router = Router();

router.post('/', createContactController);
router.get('/', authMiddleware, listContactsController);
router.patch('/:id', adminActionLimiter, authMiddleware, updateContactController);

export default router;
