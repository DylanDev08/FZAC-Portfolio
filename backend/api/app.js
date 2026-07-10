import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import fzacRoutes from '../routes/fzac.routes.js';
import adminRoutes from '../routes/admin.routes.js';
import authRoutes from '../routes/auth.routes.js';
import contactRoutes from '../routes/contact.routes.js';
import logRoutes from '../routes/log.routes.js';
import settingsRoutes from '../routes/settings.routes.js';
import { env } from '../config/env.js';

function corsOrigin(origin, callback) {
  if (!origin || env.corsOrigins.length === 0 || env.corsOrigins.includes(origin)) {
    callback(null, true);
    return;
  }

  callback(new Error('Origen no permitido por CORS'));
}

export function createApp() {
  const app = express();

  app.disable('x-powered-by');
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
        adminEmail: env.adminEmail,
        adminEmails: env.adminEmails,
      },
    });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/contactos', contactRoutes);
  app.use('/api/login-logs', logRoutes);
  app.use('/api/site-settings', settingsRoutes);
  app.use('/api/fzac', fzacRoutes);

  return app;
}
