import { uploadFormRequest, unwrapData } from './httpService.js';

const MAX_IMAGE_SIZE = 25 * 1024 * 1024;
const BLOCKED_IMAGE_TYPES = ['image/svg+xml'];
const PHOTO_EXTENSIONS = ['jpg', 'jpeg', 'jfif', 'png', 'webp', 'gif', 'avif', 'heic', 'heif', 'bmp', 'tif', 'tiff'];

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

  if (!looksLikePhoto || BLOCKED_IMAGE_TYPES.includes(mimeType)) {
    throw uploadError('Formato no permitido. Subí una foto válida; SVG y archivos no fotográficos no se admiten por seguridad.');
  }

  if (file.size > MAX_IMAGE_SIZE) {
    throw uploadError('La imagen es demasiado pesada. Usá una imagen menor a 25MB.');
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
