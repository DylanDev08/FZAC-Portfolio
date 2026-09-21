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
      console.error(`[storage] bucket error bucket=${env.supabaseStorageBucket} message=${createError.message || 'unknown'}`);
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
    mp4: 'video/mp4',
    webm: 'video/webm',
    mov: 'video/quicktime',
    m4v: 'video/x-m4v',
  };
  return map[extension] || 'image/jpeg';
}

const PHOTO_EXTENSIONS = new Set(['jpg', 'jpeg', 'jfif', 'png', 'webp', 'gif', 'avif', 'heic', 'heif', 'bmp', 'tif', 'tiff']);
const VIDEO_EXTENSIONS = new Set(['mp4', 'webm', 'mov', 'm4v']);
const BLOCKED_MIME_TYPES = new Set(['image/svg+xml']);
const GENERIC_BINARY_MIME_TYPES = new Set(['', 'application/octet-stream']);

function startsWithBytes(buffer, bytes) {
  if (!Buffer.isBuffer(buffer) || buffer.length < bytes.length) return false;
  return bytes.every((value, index) => buffer[index] === value);
}

function ascii(buffer, start, end) {
  return buffer.subarray(start, end).toString('ascii');
}

function isoBmffBrands(buffer) {
  if (!Buffer.isBuffer(buffer) || buffer.length < 12 || ascii(buffer, 4, 8) !== 'ftyp') return [];
  const brands = [ascii(buffer, 8, 12)];
  const max = Math.min(buffer.length, 64);
  for (let offset = 16; offset + 4 <= max; offset += 4) {
    brands.push(ascii(buffer, offset, offset + 4));
  }
  return brands;
}

function detectMediaMime(file) {
  const buffer = file?.buffer;
  const extension = extensionFromName(file?.filename || '');
  if (!Buffer.isBuffer(buffer) || !buffer.length) return '';

  if (startsWithBytes(buffer, [0xff, 0xd8, 0xff])) return 'image/jpeg';
  if (startsWithBytes(buffer, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return 'image/png';
  if (ascii(buffer, 0, 6) === 'GIF87a' || ascii(buffer, 0, 6) === 'GIF89a') return 'image/gif';
  if (buffer.length >= 12 && ascii(buffer, 0, 4) === 'RIFF' && ascii(buffer, 8, 12) === 'WEBP') return 'image/webp';
  if (startsWithBytes(buffer, [0x42, 0x4d])) return 'image/bmp';
  if (
    startsWithBytes(buffer, [0x49, 0x49, 0x2a, 0x00]) ||
    startsWithBytes(buffer, [0x4d, 0x4d, 0x00, 0x2a])
  ) return 'image/tiff';
  if (startsWithBytes(buffer, [0x1a, 0x45, 0xdf, 0xa3])) return 'video/webm';

  const brands = isoBmffBrands(buffer);
  if (brands.length) {
    const brandSet = new Set(brands);
    const avifBrands = ['avif', 'avis'];
    const heifBrands = ['heic', 'heix', 'hevc', 'hevx', 'heim', 'heis', 'mif1', 'msf1'];
    const videoBrands = ['isom', 'iso2', 'iso3', 'iso4', 'iso5', 'iso6', 'mp41', 'mp42', 'avc1', 'dash', 'M4V ', 'M4VH', 'qt  '];

    if (avifBrands.some((brand) => brandSet.has(brand)) && extension === 'avif') return 'image/avif';
    if (heifBrands.some((brand) => brandSet.has(brand)) && ['heic', 'heif'].includes(extension)) {
      return extension === 'heic' ? 'image/heic' : 'image/heif';
    }
    if (videoBrands.some((brand) => brandSet.has(brand)) && ['mp4', 'mov', 'm4v'].includes(extension)) {
      if (extension === 'mov') return 'video/quicktime';
      if (extension === 'm4v') return 'video/x-m4v';
      return 'video/mp4';
    }
  }

  return '';
}

function isAllowedMedia(file) {
  const contentType = String(file.contentType || '').toLowerCase();
  const extension = extensionFromName(file.filename || '');
  if (BLOCKED_MIME_TYPES.has(contentType)) return false;
  if (env.allowedUploadMimeTypes.includes(contentType)) return true;
  if (GENERIC_BINARY_MIME_TYPES.has(contentType) && (PHOTO_EXTENSIONS.has(extension) || VIDEO_EXTENSIONS.has(extension))) return true;
  if (contentType.startsWith('image/')) return PHOTO_EXTENSIONS.has(extension);
  if (contentType.startsWith('video/')) return VIDEO_EXTENSIONS.has(extension);
  return false;
}

export function validateUploadFile(file) {
  if (!file?.buffer?.length) {
    const error = new Error('No se recibió ningún archivo.');
    error.status = 400;
    throw error;
  }

  if (!isAllowedMedia(file)) {
    const error = new Error(`Tipo de archivo no permitido: ${file.contentType || 'desconocido'}. Subí una imagen raster o video MP4/WebM/MOV/M4V válido; SVG no se admite por seguridad.`);
    error.status = 400;
    throw error;
  }

  const detectedMime = detectMediaMime(file);
  if (!detectedMime || !env.allowedUploadMimeTypes.includes(detectedMime)) {
    const error = new Error('El contenido real del archivo no coincide con un formato multimedia permitido.');
    error.status = 400;
    throw error;
  }

  const extension = extensionFromName(file.filename || '');
  const expectedKind = VIDEO_EXTENSIONS.has(extension) ? 'video/' : PHOTO_EXTENSIONS.has(extension) ? 'image/' : '';
  if (!expectedKind || !detectedMime.startsWith(expectedKind)) {
    const error = new Error('La extensión del archivo no coincide con su contenido real.');
    error.status = 400;
    throw error;
  }

  const maxBytes = env.maxUploadSizeMb * 1024 * 1024;
  if (file.buffer.length > maxBytes) {
    const error = new Error(`El archivo supera el máximo permitido de ${env.maxUploadSizeMb}MB.`);
    error.status = 400;
    throw error;
  }

  return detectedMime;
}

export async function uploadImageToStorage(file, folder = 'uploads') {
  const detectedMime = validateUploadFile(file);

  const client = getServiceClient();
  await ensureBucket(client);
  const cleanFolder = sanitizeSegment(folder) || 'uploads';
  const originalName = sanitizeSegment(file.filename || 'imagen');
  const ext = extensionFromName(originalName);
  const baseName = originalName.replace(new RegExp(`\\.${ext}$`, 'i'), '') || 'imagen';
  const path = `${cleanFolder}/${Date.now()}-${randomUUID()}-${baseName}.${ext}`;
  const contentType = detectedMime || mimeFromExtension(ext);

  console.info(`[storage] uploading bucket=${env.supabaseStorageBucket} folder=${cleanFolder} path=${path} type=${contentType} bytes=${file.buffer.length}`);

  const { data, error } = await client.storage
    .from(env.supabaseStorageBucket)
    .upload(path, file.buffer, {
      cacheControl: '31536000',
      contentType,
      upsert: false,
    });

  if (error) {
    console.error(`[storage] upload failed bucket=${env.supabaseStorageBucket} path=${path} message=${error.message || 'unknown'}`);
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


export function storagePathFromUrl(value = '') {
  const raw = String(value || '').trim();
  if (!raw) return '';
  const bucket = env.supabaseStorageBucket;
  const publicMarker = `/storage/v1/object/public/${bucket}/`;
  const signedMarker = `/storage/v1/object/sign/${bucket}/`;
  const publicIndex = raw.indexOf(publicMarker);
  if (publicIndex >= 0) return decodeURIComponent(raw.slice(publicIndex + publicMarker.length).split('?')[0]);
  const signedIndex = raw.indexOf(signedMarker);
  if (signedIndex >= 0) return decodeURIComponent(raw.slice(signedIndex + signedMarker.length).split('?')[0]);
  // Only accept raw paths for our managed upload folders. Never delete arbitrary URLs.
  if (!/^https?:\/\//i.test(raw) && !raw.startsWith('/assets/')) return sanitizeSegment(raw);
  return '';
}

export async function deleteImageFromStorage(value = '') {
  const path = storagePathFromUrl(value);
  if (!path) return { deleted: false, skipped: true, reason: 'not-managed-storage' };

  const client = getServiceClient();
  await ensureBucket(client);
  const { error } = await client.storage.from(env.supabaseStorageBucket).remove([path]);
  if (error) {
    console.error(`[storage] delete failed bucket=${env.supabaseStorageBucket} path=${path} message=${error.message || 'unknown'}`);
    const deleteError = new Error(error.message || 'No se pudo eliminar la imagen de Supabase Storage.');
    deleteError.status = 400;
    throw deleteError;
  }
  console.info(`[storage] deleted bucket=${env.supabaseStorageBucket} path=${path}`);
  return { deleted: true, skipped: false, path, bucket: env.supabaseStorageBucket };
}


export function collectManagedStoragePaths(value) {
  const paths = new Set();
  const visit = (item) => {
    if (!item) return;
    if (typeof item === 'string') {
      const path = storagePathFromUrl(item);
      if (path) paths.add(path);
      return;
    }
    if (Array.isArray(item)) {
      item.forEach(visit);
      return;
    }
    if (typeof item === 'object') {
      const candidates = [
        item.path, item.imagePath, item.image_path,
        item.url, item.publicUrl, item.imageUrl, item.image_url,
        item.portada,
      ];
      candidates.forEach((candidate) => {
        const path = storagePathFromUrl(candidate);
        if (path) paths.add(path);
      });
      Object.entries(item).forEach(([key, nested]) => {
        if (['path','imagePath','image_path','url','publicUrl','imageUrl','image_url','portada'].includes(key)) return;
        if (Array.isArray(nested) || (nested && typeof nested === 'object')) visit(nested);
      });
    }
  };
  visit(value);
  return paths;
}

export async function deleteStoragePaths(paths = []) {
  const unique = [...new Set([...paths].filter(Boolean))];
  if (!unique.length) return { deleted: 0, paths: [] };
  const client = getServiceClient();
  await ensureBucket(client);
  const { error } = await client.storage.from(env.supabaseStorageBucket).remove(unique);
  if (error) {
    console.error(`[storage] batch delete failed bucket=${env.supabaseStorageBucket} count=${unique.length} message=${error.message || 'unknown'}`);
    throw new Error(error.message || 'No se pudieron eliminar archivos antiguos de Supabase Storage.');
  }
  return { deleted: unique.length, paths: unique };
}

export async function deleteStoragePathsBestEffort(paths = []) {
  try {
    return await deleteStoragePaths(paths);
  } catch (error) {
    console.warn(`[storage] cleanup deferred: ${error.message || error}`);
    return { deleted: 0, paths: [], error: error.message || String(error) };
  }
}
