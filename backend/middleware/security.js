import rateLimit from 'express-rate-limit';
import { env } from '../config/env.js';

export const loginLogLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiados intentos de acceso registrados. Intenta nuevamente en unos minutos.' },
});

export const adminActionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: env.adminRateLimit,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiadas acciones administrativas. Intenta nuevamente en unos minutos.' },
});

export const contactSubmissionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 8,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiados mensajes enviados. Esperá unos minutos antes de volver a intentar.' },
});

