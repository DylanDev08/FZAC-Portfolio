import { uploadFormRequest, unwrapData } from './httpService.js';

const MAX_UPLOAD_SIZE = 25 * 1024 * 1024;
const BLOCKED_IMAGE_TYPES = ['image/svg+xml'];
const PHOTO_EXTENSIONS = ['jpg', 'jpeg', 'jfif', 'png', 'webp', 'gif', 'avif', 'heic', 'heif', 'bmp', 'tif', 'tiff'];
const VIDEO_EXTENSIONS = ['mp4', 'webm', 'mov', 'm4v'];

export const isStorageUploadReady = true;

function uploadError(message, status = 400) {
  const error = new Error(message || 'No se pudo subir la imagen.');
  error.status = status;
  error.ok = false;
  return error;
}

function validateFile(file) {
  if (!file) throw uploadError('No se seleccionó ningún archivo.');

  const mimeType = String(file.type || '').toLowerCase();
  const extension = String(file.name || '').split('.').pop()?.toLowerCase() || '';
  const looksLikePhoto = mimeType.startsWith('image/') || PHOTO_EXTENSIONS.includes(extension);
  const looksLikeVideo = mimeType.startsWith('video/') || VIDEO_EXTENSIONS.includes(extension);

  if ((!looksLikePhoto && !looksLikeVideo) || BLOCKED_IMAGE_TYPES.includes(mimeType)) {
    throw uploadError('Formato no permitido. Subí una imagen o un video MP4/WebM/MOV/M4V válido; SVG no se admite por seguridad.');
  }

  if (file.size > MAX_UPLOAD_SIZE) {
    throw uploadError('El archivo es demasiado pesado. Usá un archivo menor a 25MB.');
  }
}

export async function uploadAsset(file, folder = 'uploads') {
  validateFile(file);

  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', folder || 'uploads');

  const response = await uploadFormRequest('/admin/uploads', formData, { auth: true });
  const data = unwrapData(response);

  return {
    ok: true,
    status: response.status || 201,
    url: data.publicUrl,
    publicUrl: data.publicUrl,
    path: data.path,
    image_url: data.publicUrl,
    image_path: data.path,
    mimeType: data.mimeType || file.type,
    sizeBytes: data.sizeBytes || file.size,
  };
}

export async function uploadManyAssets(files, folder = 'uploads') {
  const list = Array.from(files || []);
  const uploaded = [];
  for (const file of list) {
    uploaded.push(await uploadAsset(file, folder));
  }

  return {
    ok: true,
    status: 201,
    items: uploaded,
    urls: uploaded.map((item) => item.url).filter(Boolean),
    paths: uploaded.map((item) => item.path).filter(Boolean),
  };
}


export async function deleteAsset(asset) {
  const path = typeof asset === 'string'
    ? asset
    : (asset?.path || asset?.image_path || asset?.imagePath || '');
  const url = typeof asset === 'string'
    ? asset
    : (asset?.url || asset?.publicUrl || asset?.image_url || asset?.imageUrl || '');

  // Local /assets files are part of the deploy and cannot be removed from Supabase.
  // They still disappear from the website when removed from the saved project payload.
  if ((!path || path.startsWith('/assets/')) && (!url || url.startsWith('/assets/'))) {
    return { ok: true, skipped: true, reason: 'local-asset' };
  }

  const response = await import('./httpService.js').then(({ apiRequest }) =>
    apiRequest('/admin/uploads', {
      method: 'DELETE',
      body: { path: path || undefined, url: url || undefined },
      auth: true,
    })
  );
  return { ok: true, status: response.status || 200, ...unwrapData(response) };
}
