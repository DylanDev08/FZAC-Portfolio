import rateLimit from 'express-rate-limit';
import { env } from '../config/env.js';

export const loginLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: env.loginRateLimit,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiados intentos de acceso. Intentá nuevamente en unos minutos.' },
});

export const adminActionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: env.adminRateLimit,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiadas acciones administrativas. Intentá nuevamente en unos minutos.' },
});

export function protectRoutes(req, res, next) {
  const token = req.headers.authorization || '';
  const isValid = token.startsWith('Bearer ') && token.split(' ')[1]?.length;

  if (!isValid) {
    return res.status(401).json({ error: 'Token de autorización requerido' });
  }

  next();
}

export function sanitizeBody(req, res, next) {
  if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
    return res.status(400).json({ ok: false, status: 400, error: 'El cuerpo debe ser un objeto válido' });
  }

  const forbidden = /select|union|drop|insert|delete|from|where|script|<|>/i;
  for (const [key, value] of Object.entries(req.body)) {
    if (typeof value === 'string' && forbidden.test(value)) {
      return res.status(400).json({ ok: false, status: 400, error: `Entrada sospechosa en el campo ${key}` });
    }
  }

  next();
}
