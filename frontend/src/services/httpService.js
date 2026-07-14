import { ensureSupabaseReady } from '../supabase/config.js';

const viteEnv = import.meta.env || {};
const DEFAULT_API_URL = viteEnv.PROD ? '/api' : 'http://localhost:4000/api';
const LOCAL_API_CANDIDATES = [4000, 4001, 4002, 4003, 4004, 4005].map((port) => `http://localhost:${port}/api`);
const TOKEN_KEY = 'fzac_token';

function apiUrlFromOrigin(origin) {
  const normalizedOrigin = String(origin || '').trim().replace(/\/$/, '');
  return normalizedOrigin ? `${normalizedOrigin}/api` : '';
}

const CONFIGURED_API_URL = String(
  apiUrlFromOrigin(viteEnv.VITE_API_ORIGIN)
  || viteEnv.VITE_API_URL
  || viteEnv.VITE_CONTACT_API_URL
  || ''
).replace(/\/$/, '');

export const API_URL = CONFIGURED_API_URL || DEFAULT_API_URL;

let resolvedApiUrlPromise = null;

async function resolveAuthToken(forceRefresh = false) {
  const storedToken = localStorage.getItem(TOKEN_KEY) || '';

  try {
    const client = await ensureSupabaseReady();
    let { data, error } = await client.auth.getSession();
    if (error) throw error;

    const expiresSoon = Number(data.session?.expires_at || 0) * 1000 < Date.now() + 60_000;
    if (data.session && (forceRefresh || expiresSoon)) {
      const refreshed = await client.auth.refreshSession();
      if (refreshed.error) throw refreshed.error;
      data = refreshed.data;
    }

    const token = data.session?.access_token || '';
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
      return token;
    }

    if (forceRefresh) {
      localStorage.removeItem(TOKEN_KEY);
      return '';
    }
  } catch (error) {
    if (forceRefresh) {
      localStorage.removeItem(TOKEN_KEY);
      throw new Error('La sesión de administrador venció. Iniciá sesión nuevamente.');
    }
  }

  return storedToken;
}

async function fetchWithAuthRetry(url, init, auth) {
  let response = await fetch(url, init);
  if (!auth || response.status !== 401) return response;

  const token = await resolveAuthToken(true);
  if (!token) return response;

  response = await fetch(url, {
    ...init,
    headers: { ...init.headers, Authorization: `Bearer ${token}` },
  });
  return response;
}

async function hasPublicConfig(apiUrl) {
  const controller = new AbortController();
  const timeout = globalThis.setTimeout(() => controller.abort(), 2500);
  try {
    const response = await fetch(`${apiUrl}/public-config`, {
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });
    const payload = await response.json().catch(() => ({}));
    return response.ok && payload.ok === true && Boolean(payload.data);
  } finally {
    globalThis.clearTimeout(timeout);
  }
}

async function resolveApiUrl() {
  if (CONFIGURED_API_URL) return CONFIGURED_API_URL;
  if (viteEnv.PROD) return '/api';
  if (resolvedApiUrlPromise) return resolvedApiUrlPromise;

  resolvedApiUrlPromise = (async () => {
    for (const apiUrl of LOCAL_API_CANDIDATES) {
      try {
        if (await hasPublicConfig(apiUrl)) return apiUrl;
      } catch {
        // Continúa con el siguiente puerto local disponible.
      }
    }
    return '';
  })();

  const resolvedApiUrl = await resolvedApiUrlPromise;
  if (resolvedApiUrl) return resolvedApiUrl;

  resolvedApiUrlPromise = null;
  return DEFAULT_API_URL;
}

export async function apiRequest(path, options = {}) {
  const {
    method = 'GET',
    body,
    auth = false,
    headers = {},
  } = options;

  const requestHeaders = {
    Accept: 'application/json',
    ...headers,
  };

  if (body !== undefined) {
    requestHeaders['Content-Type'] = 'application/json';
  }

  if (auth) {
    const token = await resolveAuthToken();
    if (token) requestHeaders.Authorization = `Bearer ${token}`;
  }

  const apiUrl = await resolveApiUrl();
  const response = await fetchWithAuthRetry(`${apiUrl}${path}`, {
    method,
    headers: requestHeaders,
    body: body === undefined ? undefined : JSON.stringify(body),
  }, auth);

  const payload = await response.json().catch(() => ({}));
  const responsePayload = {
    ...payload,
    status: response.status,
  };

  if (!response.ok) {
    const error = new Error(payload.error || payload.message || 'No se pudo completar la solicitud.');
    error.status = response.status || 400;
    error.payload = responsePayload;
    throw error;
  }

  return responsePayload;
}

export async function uploadFormRequest(path, formData, options = {}) {
  const {
    method = 'POST',
    auth = true,
    headers = {},
  } = options;

  const requestHeaders = {
    Accept: 'application/json',
    ...headers,
  };

  if (auth) {
    const token = await resolveAuthToken();
    if (token) requestHeaders.Authorization = `Bearer ${token}`;
  }

  const apiUrl = await resolveApiUrl();
  const response = await fetchWithAuthRetry(`${apiUrl}${path}`, {
    method,
    headers: requestHeaders,
    body: formData,
  }, auth);

  const payload = await response.json().catch(() => ({}));
  const responsePayload = {
    ...payload,
    status: response.status,
  };

  if (!response.ok) {
    const error = new Error(payload.error || payload.message || 'No se pudo completar la carga.');
    error.status = response.status || 400;
    error.payload = responsePayload;
    throw error;
  }

  return responsePayload;
}

export function unwrapData(payload) {
  if (payload && Object.prototype.hasOwnProperty.call(payload, 'data')) return payload.data;
  return payload;
}
