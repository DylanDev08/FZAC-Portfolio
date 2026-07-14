import { createClient } from '@supabase/supabase-js';

function envValue(key) {
  const value = String((import.meta.env || {})[key] || '').trim();
  const invalidTokens = ['PEGAR_', 'YOUR_', 'TU_', 'REEMPLAZAR_', 'undefined', 'null'];
  if (!value) return '';
  if (invalidTokens.some((token) => value.toUpperCase().startsWith(token))) return '';
  return value;
}

function normalizeSupabaseUrl(value) {
  return String(value || '').replace(/\/rest\/v1\/?$/i, '').replace(/\/$/, '');
}

function getConfiguredApiUrl() {
  const viteEnv = import.meta.env || {};
  const apiOrigin = String(viteEnv.VITE_API_ORIGIN || '').trim().replace(/\/$/, '');
  return String(
    (apiOrigin ? `${apiOrigin}/api` : '')
    || viteEnv.VITE_API_URL
    || viteEnv.VITE_CONTACT_API_URL
    || ''
  ).replace(/\/$/, '');
}

function getApiUrlCandidates() {
  const configured = getConfiguredApiUrl();
  if (configured) return [configured];
  if ((import.meta.env || {}).PROD) return ['/api'];

  return [4000, 4001, 4002, 4003, 4004, 4005].map((port) => `http://localhost:${port}/api`);
}

export let SUPABASE_URL = normalizeSupabaseUrl(
  envValue('VITE_SUPABASE_URL')
  || envValue('VITE_SUPABASE_REST_URL')
  || envValue('VITE_SUPABASE_API_URL')
);
export let SUPABASE_ANON_KEY = envValue('VITE_SUPABASE_ANON_KEY');
export let SUPABASE_BUCKET = envValue('VITE_SUPABASE_STORAGE_BUCKET') || 'crud-images';
export let isSupabaseReady = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

export let supabase = isSupabaseReady ? createSupabaseClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

let configLoadPromise = null;

function createSupabaseClient(url, anonKey) {
  return createClient(url, anonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  });
}

function applyRuntimeConfig(config = {}) {
  SUPABASE_URL = normalizeSupabaseUrl(config.supabaseUrl || config.url || SUPABASE_URL);
  SUPABASE_ANON_KEY = String(config.supabaseAnonKey || config.anonKey || SUPABASE_ANON_KEY || '').trim();
  SUPABASE_BUCKET = String(config.supabaseStorageBucket || config.bucket || SUPABASE_BUCKET || 'crud-images').trim();
  isSupabaseReady = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
  supabase = isSupabaseReady ? createSupabaseClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;
}

async function loadPublicConfig() {
  let lastError = null;

  for (const apiUrl of getApiUrlCandidates()) {
    try {
      const controller = new AbortController();
      const timeout = globalThis.setTimeout(() => controller.abort(), 4000);
      let response;
      try {
        response = await fetch(`${apiUrl}/public-config`, {
          headers: { Accept: 'application/json' },
          signal: controller.signal,
        });
      } finally {
        globalThis.clearTimeout(timeout);
      }

      const payload = await response.json().catch(() => ({}));

      if (!response.ok || payload.ok === false) {
        throw new Error(payload.error || 'No se pudo leer la configuracion publica de Supabase.');
      }

      applyRuntimeConfig(payload.data || payload);
      return;
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error('No se pudo leer la configuracion publica de Supabase.');
}

export async function ensureSupabaseReady() {
  if (isSupabaseReady && supabase) return supabase;

  if (!configLoadPromise) {
    configLoadPromise = loadPublicConfig().finally(() => {
      configLoadPromise = null;
    });
  }

  await configLoadPromise;

  if (!isSupabaseReady || !supabase) {
    throw new Error('Supabase no esta configurado. Revisa SUPABASE_URL y SUPABASE_ANON_KEY en el backend .env.');
  }

  return supabase;
}
