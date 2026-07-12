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
  return String(
    viteEnv.VITE_API_URL
    || viteEnv.VITE_CONTACT_API_URL
    || ''
  ).replace(/\/$/, '');
}

function getApiUrlCandidates() {
  const configured = getConfiguredApiUrl();
  if (configured) return [configured];

  return [4000, 4001, 4002, 4003, 4004, 4005].map((port) => `http://localhost:${port}/api`);
}

const DEFAULT_ADMIN_EMAILS = [
  'fortalezaconstruccionesrosario@gmail.com',
  'materialezfzacecommerce@gmail.com',
  'dylansalcedo333@gmail.com',
];

function emailListFromValue(value) {
  return String(Array.isArray(value) ? value.join(',') : value || '')
    .split(',')
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
}

function uniqueEmailList(items) {
  return [...new Set(items)];
}

function resolveAdminEmails(adminEmails, legacyAdminEmail = '') {
  const configured = emailListFromValue(adminEmails);
  if (configured.length) return configured;

  return uniqueEmailList([
    ...DEFAULT_ADMIN_EMAILS,
    ...emailListFromValue(legacyAdminEmail),
  ]);
}

export let SUPABASE_URL = normalizeSupabaseUrl(
  envValue('VITE_SUPABASE_URL')
  || envValue('VITE_SUPABASE_REST_URL')
  || envValue('VITE_SUPABASE_API_URL')
);
export let SUPABASE_ANON_KEY = envValue('VITE_SUPABASE_ANON_KEY');
export let SUPABASE_BUCKET = envValue('VITE_SUPABASE_STORAGE_BUCKET') || 'crud-images';
export let ADMIN_EMAILS = resolveAdminEmails(
  envValue('VITE_ADMIN_EMAILS'),
  (import.meta.env || {}).VITE_ADMIN_EMAIL,
);
export let ADMIN_EMAIL = ADMIN_EMAILS[0] || '';
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
  ADMIN_EMAILS = resolveAdminEmails(config.adminEmails, config.adminEmail || ADMIN_EMAILS.join(','));
  ADMIN_EMAIL = ADMIN_EMAILS[0] || '';
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
        throw new Error(payload.error || 'No se pudo leer la configuración pública de Supabase.');
      }

      applyRuntimeConfig(payload.data || payload);
      return;
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error('No se pudo leer la configuración pública de Supabase.');
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
    throw new Error('Supabase no está configurado. Revisá SUPABASE_URL y SUPABASE_ANON_KEY en el backend .env.');
  }

  return supabase;
}

export function isAuthorizedAdmin(user) {
  const email = String(user?.email || '').trim().toLowerCase();
  return isAuthorizedAdminEmail(email);
}

export function isAuthorizedAdminEmail(email) {
  const cleanEmail = String(email || '').trim().toLowerCase();
  return Boolean(cleanEmail && ADMIN_EMAILS.includes(cleanEmail));
}
