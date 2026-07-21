const WORK_STATUSES = new Set(['draft', 'published', 'archived', 'finalizada', 'construyendo', 'por-comenzar']);
const IMAGE_SECTIONS = new Set(['cover', 'gallery', 'before', 'process', 'final']);
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function fail(res, message) {
  return res.status(400).json({ ok: false, status: 400, error: message });
}

function isObject(value) {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}

function text(value) {
  return String(value ?? '').trim();
}

function isNumeric(value) {
  return value === undefined || value === null || value === '' || Number.isFinite(Number(value));
}

function validImageInput(image) {
  if (typeof image === 'string') return Boolean(text(image));
  if (!isObject(image)) return false;
  const url = text(image.imageUrl || image.image_url || image.publicUrl || image.url);
  const path = text(image.imagePath || image.image_path || image.path);
  return Boolean(url && path);
}

function validateImageArrays(body) {
  const fields = ['imagenes', 'images', 'imagenesAntes', 'beforeImages', 'imagenesProceso', 'processImages', 'imagenesFinal', 'finalImages'];
  for (const field of fields) {
    if (body[field] === undefined) continue;
    if (!Array.isArray(body[field])) return `${field} debe ser una lista.`;
    if (!body[field].every(validImageInput)) return `${field} contiene una imagen sin URL o path válido.`;
  }
  return '';
}

function validateBranches(value) {
  if (value === undefined) return '';
  if (!Array.isArray(value)) return 'Las sucursales deben ser una lista.';

  for (const [index, branch] of value.entries()) {
    if (!isObject(branch)) return `La sucursal ${index + 1} debe ser un objeto válido.`;
    const name = text(branch.nombre || branch.name);
    if (!name || name.length > 140) return `La sucursal ${index + 1} necesita un nombre de hasta 140 caracteres.`;
    if (branch.portada && !validImageInput(branch.portada)) return `La portada de ${name} no es válida.`;

    const imageError = validateImageArrays(branch);
    if (imageError) return `${name}: ${imageError}`;
  }

  return '';
}

export function validateWorkPayload(req, res, next) {
  const body = req.body;
  if (!isObject(body)) return fail(res, 'El cuerpo debe ser un objeto válido.');

  const title = text(body.title || body.titulo || body.nombre);
  const slug = text(body.slug);
  const status = text(body.status || body.estado || 'draft');
  const categoryId = text(body.categoryId || body.category_id);
  const order = body.displayOrder ?? body.order;
  const progress = body.progress ?? body.avance;

  if (!title || title.length > 140) return fail(res, 'El título es obligatorio y admite hasta 140 caracteres.');
  if (!slug || !SLUG_PATTERN.test(slug)) return fail(res, 'El slug es obligatorio y solo admite letras minúsculas, números y guiones.');
  if (!WORK_STATUSES.has(status)) return fail(res, `Estado inválido: ${status}.`);
  if (categoryId && !UUID_PATTERN.test(categoryId)) return fail(res, 'categoryId debe ser un UUID válido.');
  if (!isNumeric(order)) return fail(res, 'El orden debe ser numérico.');
  if (!isNumeric(progress) || Number(progress) < 0 || Number(progress) > 100) return fail(res, 'El avance debe ser un número entre 0 y 100.');
  const branchError = validateBranches(body.sucursales ?? body.branches);
  if (branchError) return fail(res, branchError);

  const imageError = validateImageArrays(body);
  if (imageError) return fail(res, imageError);
  next();
}

export function validateCategoryPayload(req, res, next) {
  const body = req.body;
  if (!isObject(body)) return fail(res, 'El cuerpo debe ser un objeto válido.');
  const name = text(body.name || body.nombre);
  const slug = text(body.slug);
  if (!name || name.length > 80) return fail(res, 'La categoría necesita un nombre de hasta 80 caracteres.');
  if (!slug || !SLUG_PATTERN.test(slug)) return fail(res, 'La categoría necesita un slug válido.');
  if (!isNumeric(body.displayOrder ?? body.order)) return fail(res, 'El orden de categoría debe ser numérico.');
  next();
}

export function validateSiteTextPayload(req, res, next) {
  const body = req.body;
  if (!isObject(body)) return fail(res, 'El cuerpo debe ser un objeto válido.');
  const key = text(body.key);
  const value = text(body.value ?? body.contenido);
  if (!key || !/^[a-z0-9]+(?:[._-][a-z0-9]+)*$/i.test(key)) return fail(res, 'La clave del texto no es válida.');
  if (!value || value.length > 5000) return fail(res, 'El contenido es obligatorio y admite hasta 5000 caracteres.');
  next();
}

export function validateWorkImagePayload(req, res, next) {
  const body = req.body;
  if (!isObject(body)) return fail(res, 'El cuerpo debe ser un objeto válido.');
  const workId = text(body.workId || body.work_id);
  const section = text(body.section || body.stage || 'gallery');
  if (req.method === 'POST' && !UUID_PATTERN.test(workId)) return fail(res, 'La imagen necesita un workId válido.');
  if (!IMAGE_SECTIONS.has(section)) return fail(res, `Etapa de imagen inválida: ${section}.`);
  if (!isNumeric(body.sortOrder ?? body.order)) return fail(res, 'El orden de la imagen debe ser numérico.');
  if (!validImageInput(body)) return fail(res, 'La imagen necesita image_url e image_path.');
  next();
}

export { IMAGE_SECTIONS, WORK_STATUSES };
