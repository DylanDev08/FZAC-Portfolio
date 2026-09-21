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

const suspiciousInputPattern = /<\s*script\b|javascript\s*:|data\s*:\s*text\/html|on(?:error|load|click|focus|mouseover)\s*=/i;

function findSuspiciousInput(value, path = 'body', depth = 0) {
  if (depth > 12) return path;
  if (typeof value === 'string') return suspiciousInputPattern.test(value) ? path : '';
  if (Array.isArray(value)) {
    for (let index = 0; index < value.length; index += 1) {
      const found = findSuspiciousInput(value[index], `${path}[${index}]`, depth + 1);
      if (found) return found;
    }
    return '';
  }
  if (value && typeof value === 'object') {
    for (const [key, child] of Object.entries(value)) {
      const found = findSuspiciousInput(child, `${path}.${key}`, depth + 1);
      if (found) return found;
    }
  }
  return '';
}

export function validateSafeBody(req, res, next) {
  if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
    return res.status(400).json({ ok: false, status: 400, error: 'El cuerpo debe ser un objeto valido' });
  }

  const suspiciousPath = findSuspiciousInput(req.body);
  if (suspiciousPath) {
    return res.status(400).json({
      ok: false,
      status: 400,
      error: `Entrada sospechosa en ${suspiciousPath}`,
    });
  }

  next();
}
