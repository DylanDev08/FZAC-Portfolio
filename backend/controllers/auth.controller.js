import { timingSafeEqual } from 'crypto';
import { createClient } from '@supabase/supabase-js';
import { env, isAllowedAdminEmail } from '../config/env.js';
import { signToken } from '../middleware/auth.js';

function safeEqual(a, b) {
  const left = Buffer.from(String(a || ''));
  const right = Buffer.from(String(b || ''));
  if (!left.length || left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

export function loginController(req, res) {
  const { email, password } = req.body || {};
  const cleanEmail = String(email || '').trim().toLowerCase();

  const isAdmin = env.adminEmails.some((adminEmail) => safeEqual(cleanEmail, adminEmail));

  if (isAdmin && safeEqual(password, env.adminPassword)) {
    const token = signToken({ email: cleanEmail, role: 'admin' });
    return res.json({ token });
  }

  return res.status(401).json({ error: 'Credenciales inválidas' });
}

export async function registerAdminController(req, res) {
  const email = String(req.body?.email || '').trim().toLowerCase();
  const password = String(req.body?.password || '');

  if (!isAllowedAdminEmail(email)) {
    return res.status(403).json({ ok: false, error: 'Solo el email administrador autorizado puede registrarse.' });
  }

  if (password.length < 6) {
    return res.status(400).json({ ok: false, error: 'La contraseña debe tener al menos 6 caracteres.' });
  }

  if (!env.supabaseUrl || !env.supabaseServiceRoleKey) {
    return res.status(503).json({ ok: false, error: 'Supabase service role no está configurado en el backend.' });
  }

  const adminClient = createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const { data, error } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { role: 'admin' },
  });

  if (error) {
    const status = /already|registered/i.test(error.message) ? 409 : 400;
    return res.status(status).json({ ok: false, error: error.message });
  }

  return res.status(201).json({ ok: true, data: { id: data.user?.id, email } });
}
