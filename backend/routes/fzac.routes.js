import { Router } from 'express';
import {
  listObras,
  getObra,
  createObraController,
  updateObraController,
  deleteObraController,
} from '../controllers/fzac.controller.js';
import { makeContentController } from '../controllers/content.controller.js';
import { authMiddleware } from '../middleware/auth.js';
import { adminActionLimiter, sanitizeBody } from '../middleware/security.js';

const router = Router();
const trabajos = makeContentController('trabajos');
const eventos = makeContentController('eventos');

function basicSanitize(input) {
  return String(input || '').replace(/[<>"'`]/g, '').trim();
}

export function validatePayload(req, res, next) {
  const body = req.body || {};

  if (typeof body !== 'object' || Array.isArray(body)) {
    return res.status(400).json({ ok: false, status: 400, error: 'El cuerpo debe ser un objeto' });
  }

  for (const [key, value] of Object.entries(body)) {
    if (typeof value === 'string') {
      const cleaned = basicSanitize(value);
      if (cleaned.length !== value.length) {
        return res.status(400).json({ ok: false, status: 400, error: `Campo inválido: ${key}` });
      }
    }
  }

  next();
}

router.get('/', listObras);
router.get('/obras', listObras);
router.get('/obras/:id', getObra);
router.post('/obras', adminActionLimiter, authMiddleware, sanitizeBody, validatePayload, createObraController);
router.put('/obras/:id', adminActionLimiter, authMiddleware, sanitizeBody, validatePayload, updateObraController);
router.delete('/obras/:id', adminActionLimiter, authMiddleware, deleteObraController);

router.get('/trabajos', trabajos.list);
router.post('/trabajos', adminActionLimiter, authMiddleware, sanitizeBody, validatePayload, trabajos.create);
router.put('/trabajos/:id', adminActionLimiter, authMiddleware, sanitizeBody, validatePayload, trabajos.update);
router.delete('/trabajos/:id', adminActionLimiter, authMiddleware, trabajos.remove);

router.get('/eventos', eventos.list);
router.post('/eventos', adminActionLimiter, authMiddleware, sanitizeBody, validatePayload, eventos.create);
router.put('/eventos/:id', adminActionLimiter, authMiddleware, sanitizeBody, validatePayload, eventos.update);
router.delete('/eventos/:id', adminActionLimiter, authMiddleware, eventos.remove);

router.get('/:id', getObra);

export default router;
