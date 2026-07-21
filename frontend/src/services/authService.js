import { ensureSupabaseReady } from '../supabase/config.js';
import { apiRequest, unwrapData } from './httpService.js';
import { createLoginLog } from './logsService.js';

const STORAGE_USER_KEY = 'fzac_user';
const STORAGE_TOKEN_KEY = 'fzac_token';

export function getToken() {
  return localStorage.getItem(STORAGE_TOKEN_KEY) || '';
}

export function setToken(token) {
  if (token) {
    localStorage.setItem(STORAGE_TOKEN_KEY, token);
    return;
  }
  localStorage.removeItem(STORAGE_TOKEN_KEY);
}

export function clearToken() {
  localStorage.removeItem(STORAGE_TOKEN_KEY);
  localStorage.removeItem(STORAGE_USER_KEY);
}

export function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_USER_KEY) || 'null');
  } catch {
    return null;
  }
}

export function setStoredUser(user) {
  if (!user) return;
  localStorage.setItem(STORAGE_USER_KEY, JSON.stringify({ email: user.email, uid: user.id || user.uid }));
}

export async function getCurrentSession() {
  const client = await ensureSupabaseReady();
  const { data, error } = await client.auth.getSession();
  if (error) throw error;
  return data.session || null;
}

export function subscribeAuth(callback) {
  let active = true;
  let unsubscribe = () => {};

  ensureSupabaseReady()
    .then((client) => {
      if (!active) return;

      client.auth.getSession()
        .then(({ data, error }) => {
          if (error) throw error;
          if (active) callback(data.session?.user || null, data.session || null);
        })
        .catch((error) => {
          if (active) callback(null, null, error);
        });

      const { data } = client.auth.onAuthStateChange((_event, session) => {
        if (active) callback(session?.user || null, session || null);
      });

      unsubscribe = () => data.subscription.unsubscribe();
    })
    .catch((error) => {
      if (active) callback(null, null, error);
    });

  return () => {
    active = false;
    unsubscribe();
  };
}

export async function bootstrapAdminProfile() {
  const response = await apiRequest('/auth/admin/bootstrap', {
    method: 'POST',
    auth: true,
  });
  return unwrapData(response);
}

export async function login(email, password) {
  const normalizedEmail = String(email || '').trim().toLowerCase();

  try {
    const client = await ensureSupabaseReady();
    clearToken();
    await client.auth.signOut({ scope: 'local' }).catch(() => {});

    const { data, error } = await client.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

    if (error) throw error;

    setToken(data.session?.access_token || '');
    setStoredUser(data.user);

    try {
      await bootstrapAdminProfile();
    } catch (bootstrapError) {
      await client.auth.signOut();
      clearToken();
      if ([401, 403].includes(bootstrapError?.status)) {
        throw new Error('Acceso no autorizado.');
      }
      throw bootstrapError;
    }

    await createLoginLog({ email: normalizedEmail, success: true });
    return { token: data.session?.access_token || '', user: { email: data.user.email, uid: data.user.id } };
  } catch (error) {
    await createLoginLog({ email: normalizedEmail, success: false, reason: error?.code || error?.message || 'login-error' });
    throw mapSupabaseAuthError(error);
  }
}

export async function logout() {
  const client = await ensureSupabaseReady();
  await client.auth.signOut();
  clearToken();
}

export function mapSupabaseAuthError(error) {
  const message = String(error?.message || '').toLowerCase();

  if (error?.message === 'Acceso no autorizado.') {
    return new Error('La cuenta es valida, pero no tiene permisos de administrador.');
  }

  if (message.includes('invalid login') || message.includes('invalid credentials')) {
    return new Error('Credenciales invalidas o no autorizadas.');
  }

  if (message.includes('rate') || message.includes('too many')) {
    return new Error('Demasiados intentos. Proba nuevamente mas tarde.');
  }

  if (message.includes('email')) {
    return new Error('Revisa el email ingresado.');
  }

  return new Error('No se pudo validar el acceso. Revisa las credenciales e intenta nuevamente.');
}
