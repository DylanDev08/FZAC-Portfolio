import { ensureSupabaseReady, isAuthorizedAdmin, isAuthorizedAdminEmail } from '../supabase/config.js';
import { apiRequest } from './httpService.js';
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

export async function login(email, password) {
  const normalizedEmail = String(email || '').trim().toLowerCase();

  try {
    const client = await ensureSupabaseReady();
    const { data, error } = await client.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

    if (error) throw error;

    if (!isAuthorizedAdmin(data.user)) {
      await createLoginLog({ email: normalizedEmail, success: false, reason: 'unauthorized-email' });
      await client.auth.signOut();
      clearToken();
      throw new Error('Acceso no autorizado.');
    }

    setToken(data.session?.access_token || '');
    setStoredUser(data.user);
    await createLoginLog({ email: normalizedEmail, success: true });

    return { token: data.session?.access_token || '', user: { email: data.user.email, uid: data.user.id } };
  } catch (error) {
    if (error?.message !== 'Acceso no autorizado.') {
      await createLoginLog({ email: normalizedEmail, success: false, reason: error?.code || error?.message || 'login-error' });
    }
    throw mapSupabaseAuthError(error);
  }
}

export async function registerAdmin(email, password) {
  const normalizedEmail = String(email || '').trim().toLowerCase();

  try {
    const client = await ensureSupabaseReady();

    if (!isAuthorizedAdminEmail(normalizedEmail)) {
      throw new Error('Solo el email administrador autorizado puede registrarse.');
    }

    try {
      await apiRequest('/auth/register', {
        method: 'POST',
        body: { email: normalizedEmail, password },
      });
    } catch (apiError) {
      const { error } = await client.auth.signUp({
        email: normalizedEmail,
        password,
      });
      if (error) throw error;
    }

    await createLoginLog({ email: normalizedEmail, success: true, reason: 'admin-register' });
    return login(normalizedEmail, password);
  } catch (error) {
    await createLoginLog({ email: normalizedEmail, success: false, reason: error?.code || error?.message || 'register-error' });
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
  const code = String(error?.code || '');

  if (error?.message === 'Acceso no autorizado.') {
    return new Error('Credenciales inválidas o no autorizadas.');
  }

  if (error?.message === 'Solo el email administrador autorizado puede registrarse.') {
    return new Error('Solo el email administrador autorizado puede registrarse.');
  }

  if (message.includes('already') || message.includes('registered') || code.includes('already')) {
    return new Error('Ese administrador ya está registrado. Iniciá sesión.');
  }

  if (message.includes('password') && message.includes('6')) {
    return new Error('La contraseña debe tener al menos 6 caracteres.');
  }

  if (message.includes('invalid login') || message.includes('invalid credentials')) {
    return new Error('Credenciales inválidas o no autorizadas.');
  }

  if (message.includes('rate') || message.includes('too many')) {
    return new Error('Demasiados intentos. Probá nuevamente más tarde.');
  }

  if (message.includes('email')) {
    return new Error('Revisá el email ingresado.');
  }

  return new Error('No se pudo validar el acceso. Revisá las credenciales e intentá nuevamente.');
}
