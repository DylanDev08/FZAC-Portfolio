import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.join(__dirname, '..', '.env');

function loadLocalEnv() {
  if (!fs.existsSync(envPath)) return;

  const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue;

    const index = trimmed.indexOf('=');
    const key = trimmed.slice(0, index).trim();
    const rawValue = trimmed.slice(index + 1).trim();
    if (!key || process.env[key] !== undefined) continue;

    process.env[key] = rawValue.replace(/^['"]|['"]$/g, '');
  }
}

function numberFromEnv(key, fallback) {
  const value = Number(process.env[key]);
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

function listFromEnv(key) {
  return String(process.env[key] || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

loadLocalEnv();

const DEFAULT_ADMIN_EMAILS = [
  'fortalezaconstruccionesrosario@gmail.com',
  'materialezfzacecommerce@gmail.com',
  'dylansalcedo333@gmail.com',
];

function emailListFromValue(value) {
  return String(value || '')
    .split(',')
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
}

function uniqueEmailList(items) {
  return [...new Set(items)];
}

function vercelOrigin(hostname) {
  const cleanHostname = String(hostname || '').trim().replace(/^https?:\/\//i, '').replace(/\/$/, '');
  return cleanHostname ? `https://${cleanHostname}` : '';
}

const configuredAdminEmails = process.env.ADMIN_EMAILS
  ? emailListFromValue(process.env.ADMIN_EMAILS)
  : uniqueEmailList([
    ...DEFAULT_ADMIN_EMAILS,
    ...emailListFromValue(process.env.ADMIN_EMAIL),
  ]);

const allowedAdminEmails = configuredAdminEmails.length
  ? configuredAdminEmails
  : DEFAULT_ADMIN_EMAILS;

const DEFAULT_PHOTO_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
  'image/heic',
  'image/heif',
  'image/heic-sequence',
  'image/heif-sequence',
  'image/bmp',
  'image/x-ms-bmp',
  'image/tiff',
  'image/x-tiff',
];

const uploadMimeTypes = uniqueEmailList([
  ...listFromEnv('ALLOWED_UPLOAD_MIME_TYPES'),
  ...DEFAULT_PHOTO_MIME_TYPES,
]);

const configuredCorsOrigins = uniqueEmailList([
  ...listFromEnv('CORS_ORIGINS'),
  process.env.CLIENT_URL,
  vercelOrigin(process.env.VERCEL_URL),
  vercelOrigin(process.env.VERCEL_BRANCH_URL),
  vercelOrigin(process.env.VERCEL_PROJECT_PRODUCTION_URL),
]);

export const env = {
  port: numberFromEnv('PORT', 4000),
  authRequired: process.env.AUTH_REQUIRED !== 'false',
  adminEmail: allowedAdminEmails[0] || '',
  adminEmails: allowedAdminEmails,
  adminPassword: String(process.env.ADMIN_PASSWORD || ''),
  jwtSecret: String(process.env.JWT_SECRET || 'dev-secret'),
  supabaseUrl: String(process.env.SUPABASE_URL || '').replace(/\/rest\/v1\/?$/i, '').replace(/\/$/, ''),
  supabaseAnonKey: String(process.env.SUPABASE_ANON_KEY || ''),
  supabaseServiceRoleKey: String(process.env.SUPABASE_SERVICE_ROLE_KEY || ''),
  supabaseStorageBucket: String(process.env.SUPABASE_STORAGE_BUCKET || 'crud-images'),
  maxUploadSizeMb: Math.max(numberFromEnv('MAX_UPLOAD_SIZE_MB', 25), 25),
  allowedUploadMimeTypes: uploadMimeTypes,
  corsOrigins: configuredCorsOrigins,
  jsonLimit: String(process.env.JSON_LIMIT || '2mb'),
  generalRateLimit: numberFromEnv('RATE_LIMIT_MAX', 100),
  adminRateLimit: numberFromEnv('ADMIN_RATE_LIMIT_MAX', 120),
  loginRateLimit: numberFromEnv('LOGIN_RATE_LIMIT_MAX', 8),
};

export function validateEnvironment() {
  const required = [
    'DATABASE_URL',
    'DIRECT_URL',
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'JWT_SECRET',
  ];
  const missing = required.filter((key) => !String(process.env[key] || '').trim());

  if (process.env.NODE_ENV === 'production' && missing.length) {
    throw new Error(`Faltan variables de entorno requeridas: ${missing.join(', ')}`);
  }

  return { missing };
}

export function isAllowedAdminEmail(email) {
  const cleanEmail = String(email || '').trim().toLowerCase();
  return Boolean(cleanEmail && env.adminEmails.includes(cleanEmail));
}
