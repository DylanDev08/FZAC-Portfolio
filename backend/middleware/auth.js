import { createClient } from '@supabase/supabase-js';
import { env, isAllowedAdminEmail } from '../config/env.js';

let supabaseAuthClient = null;

function getSupabaseAuthClient() {
  if (!env.supabaseUrl || !env.supabaseAnonKey) return null;
  if (!supabaseAuthClient) {
    supabaseAuthClient = createClient(env.supabaseUrl, env.supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }
  return supabaseAuthClient;
}

async function verifySupabaseToken(token) {
  const client = getSupabaseAuthClient();
  if (!client) return null;

  try {
    const { data, error } = await client.auth.getUser(token);
    if (error || !data?.user) return null;

    return {
      email: data.user.email,
      sub: data.user.id,
      role: 'admin',
      provider: 'supabase',
    };
  } catch {
    return null;
  }
}

export async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';

  if (!token) {
    return res.status(401).json({ error: 'Token JWT requerido' });
  }

  try {
    const decoded = await verifySupabaseToken(token);
    if (!decoded) {
      return res.status(401).json({ error: 'Token JWT inválido' });
    }

    const email = String(decoded.email || '').trim().toLowerCase();
    if (!isAllowedAdminEmail(email)) {
      return res.status(403).json({ error: 'Acceso administrador requerido' });
    }
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: 'Token JWT inválido' });
  }
}
