import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import fzacRoutes from './routes/fzac.routes.js';
import adminRoutes from './routes/admin.routes.js';
import authRoutes from './routes/auth.routes.js';
import contactRoutes from './routes/contact.routes.js';
import logRoutes from './routes/log.routes.js';
import settingsRoutes from './routes/settings.routes.js';
import { env, validateEnvironment } from './config/env.js';

function corsOrigin(origin, callback) {
  const localDevelopmentOrigin = process.env.NODE_ENV !== 'production' && /^http:\/\/(localhost|127\.0\.0\.1):\d+$/i.test(origin || '');
  if (!origin || env.corsOrigins.includes(origin) || localDevelopmentOrigin) {
    callback(null, true);
    return;
  }

  callback(new Error('Origen no permitido por CORS'));
}

export function createApp() {
  validateEnvironment();
  const app = express();

  app.disable('x-powered-by');
  if (process.env.NODE_ENV === 'production') app.set('trust proxy', 1);
  app.use(helmet());
  app.use(cors({ origin: corsOrigin, credentials: true }));
  app.use(express.json({ limit: env.jsonLimit }));

  app.use(rateLimit({
    windowMs: 15 * 60 * 1000,
    max: env.generalRateLimit,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Demasiadas solicitudes. Intentá nuevamente en unos minutos.' },
  }));

  app.get('/health', (_req, res) => {
    res.json({ ok: true, service: 'fzac-backend' });
  });

  app.get('/api/public-config', (_req, res) => {
    res.json({
      ok: true,
      data: {
        supabaseUrl: env.supabaseUrl,
        supabaseAnonKey: env.supabaseAnonKey,
        supabaseStorageBucket: env.supabaseStorageBucket,
      },
    });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/contactos', contactRoutes);
  app.use('/api/login-logs', logRoutes);
  app.use('/api/site-settings', settingsRoutes);
  app.use('/api/fzac', fzacRoutes);

  app.use((error, _req, res, _next) => {
    const isCors = /CORS|Origen no permitido/i.test(error?.message || '');
    const status = isCors ? 403 : (error?.type === 'entity.too.large' ? 413 : 500);
    if (status === 500) console.error(`[api] ${error?.message || 'Error interno'}`);
    res.status(status).json({
      ok: false,
      status,
      error: isCors
        ? 'Origen no permitido por CORS.'
        : status === 413
          ? 'El cuerpo de la solicitud es demasiado grande.'
          : 'Error interno del servidor.',
    });
  });

  return app;
}
