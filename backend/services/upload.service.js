import { randomUUID } from 'crypto';
import { createClient } from '@supabase/supabase-js';
import { env } from '../config/env.js';

let serviceClient = null;
let bucketReadyPromise = null;

function getServiceClient() {
  if (!env.supabaseUrl || !env.supabaseServiceRoleKey) {
    throw new Error('Supabase Storage no está configurado en el backend.');
  }

  if (!serviceClient) {
    serviceClient = createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  return serviceClient;
}

async function ensureBucket(client) {
  if (bucketReadyPromise) return bucketReadyPromise;

  bucketReadyPromise = (async () => {
    const { error } = await client.storage.getBucket(env.supabaseStorageBucket);
    if (!error) {
      await client.storage.updateBucket(env.supabaseStorageBucket, {
        public: true,
        allowedMimeTypes: env.allowedUploadMimeTypes,
        fileSizeLimit: `${env.maxUploadSizeMb}MB`,
      }).catch(() => {});
      return;
    }

    const { error: createError } = await client.storage.createBucket(env.supabaseStorageBucket, {
      public: true,
      allowedMimeTypes: env.allowedUploadMimeTypes,
      fileSizeLimit: `${env.maxUploadSizeMb}MB`,
    });

    if (createError && !/already exists/i.test(createError.message || '')) {
      throw new Error(createError.message || `No se pudo crear el bucket ${env.supabaseStorageBucket}.`);
    }
  })();

  return bucketReadyPromise;
}

function sanitizeSegment(value = '') {
  return String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9._/-]+/g, '-')
    .replace(/\.\.+/g, '.')
    .replace(/^\/+|\/+$/g, '')
    .replace(/\/{2,}/g, '/');
}

function extensionFromName(filename = '') {
  const match = String(filename).match(/\.([a-z0-9]+)$/i);
  return match ? match[1].toLowerCase() : 'jpg';
}

function mimeFromExtension(extension = '') {
  const map = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    jfif: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
    gif: 'image/gif',
    avif: 'image/avif',
    heic: 'image/heic',
    heif: 'image/heif',
    bmp: 'image/bmp',
    tif: 'image/tiff',
    tiff: 'image/tiff',
  };
  return map[extension] || 'image/jpeg';
}

const PHOTO_EXTENSIONS = new Set(['jpg', 'jpeg', 'jfif', 'png', 'webp', 'gif', 'avif', 'heic', 'heif', 'bmp', 'tif', 'tiff']);
const BLOCKED_MIME_TYPES = new Set(['image/svg+xml']);
const GENERIC_BINARY_MIME_TYPES = new Set(['', 'application/octet-stream']);

function isAllowedPhoto(file) {
  const contentType = String(file.contentType || '').toLowerCase();
  const extension = extensionFromName(file.filename || '');
  if (BLOCKED_MIME_TYPES.has(contentType)) return false;
  if (env.allowedUploadMimeTypes.includes(contentType)) return true;
  if (GENERIC_BINARY_MIME_TYPES.has(contentType) && PHOTO_EXTENSIONS.has(extension)) return true;
  return contentType.startsWith('image/') && PHOTO_EXTENSIONS.has(extension);
}

export function validateUploadFile(file) {
  if (!file?.buffer?.length) {
    const error = new Error('No se recibió ningún archivo.');
    error.status = 400;
    throw error;
  }

  if (!isAllowedPhoto(file)) {
    const error = new Error(`Tipo de archivo no permitido: ${file.contentType || 'desconocido'}. Subí una foto raster válida; SVG no se admite por seguridad.`);
    error.status = 400;
    throw error;
  }

  const maxBytes = env.maxUploadSizeMb * 1024 * 1024;
  if (file.buffer.length > maxBytes) {
    const error = new Error(`La imagen supera el máximo permitido de ${env.maxUploadSizeMb}MB.`);
    error.status = 400;
    throw error;
  }
}

export async function uploadImageToStorage(file, folder = 'uploads') {
  validateUploadFile(file);

  const client = getServiceClient();
  await ensureBucket(client);
  const cleanFolder = sanitizeSegment(folder) || 'uploads';
  const originalName = sanitizeSegment(file.filename || 'imagen');
  const ext = extensionFromName(originalName);
  const baseName = originalName.replace(new RegExp(`\\.${ext}$`, 'i'), '') || 'imagen';
  const path = `${cleanFolder}/${Date.now()}-${randomUUID()}-${baseName}.${ext}`;
  const contentType = GENERIC_BINARY_MIME_TYPES.has(String(file.contentType || '').toLowerCase())
    ? mimeFromExtension(ext)
    : file.contentType;

  const { data, error } = await client.storage
    .from(env.supabaseStorageBucket)
    .upload(path, file.buffer, {
      cacheControl: '31536000',
      contentType,
      upsert: false,
    });

  if (error) {
    const uploadError = new Error(error.message || 'No se pudo subir la imagen a Supabase Storage.');
    uploadError.status = 400;
    throw uploadError;
  }

  const { data: publicData } = client.storage.from(env.supabaseStorageBucket).getPublicUrl(data.path);

  return {
    publicUrl: publicData.publicUrl,
    path: data.path,
    bucket: env.supabaseStorageBucket,
    mimeType: contentType,
    sizeBytes: file.buffer.length,
  };
}
