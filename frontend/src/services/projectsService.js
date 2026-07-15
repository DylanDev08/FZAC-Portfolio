import { fallbackProjects } from '../data/projects.js';
import { apiRequest, unwrapData } from './httpService.js';
import { normalizeDate, slugify } from './utils.js';

const REMOVED_PUBLIC_IMAGES = new Set([
  '/assets/img/obras/armstrong/01.jpg',
  '/assets/img/obras/marvel-funes/04.jpg',
]);

const PRODUCTION_COPY_CUTOFF = Date.parse('2026-07-15T00:00:00.000Z');

function normalizeBrandName(value = '') {
  return String(value).replace(/Sliders Hamburger(?!s)/g, 'Sliders Hamburgers');
}

function cleanPublicImages(source = {}) {
  const cleanList = (items) => Array.isArray(items) ? items.filter((item) => !REMOVED_PUBLIC_IMAGES.has(item)) : [];
  return {
    ...source,
    imagenes: cleanList(source.imagenes),
    imagenesAntes: cleanList(source.imagenesAntes),
    imagenesProceso: cleanList(source.imagenesProceso),
    imagenesFinal: cleanList(source.imagenesFinal),
  };
}

function applyProductionContent(project) {
  const curated = fallbackProjects.find((item) => item.slug === project.slug);
  const cleaned = cleanPublicImages(project);
  if (!curated) return cleaned;

  const useCuratedCopy = !cleaned.updatedAt || Date.parse(cleaned.updatedAt) < PRODUCTION_COPY_CUTOFF;

  const curatedBranches = Array.isArray(curated.sucursales) ? curated.sucursales : [];
  const branches = (cleaned.sucursales || []).map((branch, index) => {
    const curatedBranch = curatedBranches.find((item) => item.direccion === branch.direccion) || curatedBranches[index];
    const nextBranch = cleanPublicImages(branch);
    return curatedBranch
      ? { ...nextBranch, descripcion: useCuratedCopy ? curatedBranch.descripcion : (nextBranch.descripcion || curatedBranch.descripcion) }
      : nextBranch;
  });

  return {
    ...cleaned,
    descripcion: useCuratedCopy ? curated.descripcion : (cleaned.descripcion || curated.descripcion),
    proceso: useCuratedCopy ? curated.proceso : (cleaned.proceso || curated.proceso),
    finalizacion: useCuratedCopy ? curated.finalizacion : (cleaned.finalizacion || curated.finalizacion),
    sucursales: branches,
  };
}

export async function getProjects() {
  try {
    const payload = await apiRequest('/fzac/works');
    const remoteProjects = unwrapData(payload).map((item) => applyProductionContent(normalizeProject(item)));
    return remoteProjects.length ? orderProjects(remoteProjects) : orderProjects(fallbackProjects.map((item) => applyProductionContent(normalizeProject(item))));
  } catch (error) {
    console.warn('[FZAC] Backend/Supabase no disponible. Usando obras locales.', error.message);
    return orderProjects(fallbackProjects.map((item) => applyProductionContent(normalizeProject(item))));
  }
}

export async function getAdminProjects() {
  const payload = await apiRequest('/admin/works', { auth: true });
  return unwrapData(payload).map((item) => cleanPublicImages(normalizeProject(item)));
}

export async function syncProjectCatalog() {
  const response = await apiRequest('/admin/works/sync-catalog', { method: 'POST', auth: true });
  return { status: response.status, ...unwrapData(response) };
}

export async function saveProject(project) {
  const payload = normalizeProjectPayload(project);
  const currentId = project.id || payload.slug;
  if (!currentId) throw new Error('La obra necesita un slug válido.');

  const method = project.id ? 'PUT' : 'POST';
  const path = project.id ? `/admin/works/${encodeURIComponent(currentId)}` : '/admin/works';
  const response = await apiRequest(path, { method, body: { ...payload, id: currentId }, auth: true });
  return {
    ok: true,
    status: response.status,
    item: normalizeProject(unwrapData(response)),
  };
}

export async function updateProjectStatus(id, estado) {
  if (!id) throw new Error('No se pudo identificar la obra.');
  const response = await apiRequest(`/admin/works/${encodeURIComponent(id)}/status`, {
    method: 'PATCH',
    body: { status: estado },
    auth: true,
  });

  return {
    ok: true,
    status: response.status,
    item: normalizeProject(unwrapData(response)),
  };
}

export async function deleteProject(id) {
  await apiRequest(`/admin/works/${encodeURIComponent(id)}`, { method: 'DELETE', auth: true });
  return { ok: true };
}

export function normalizeProject(project) {
  const estado = project.estado === 'en_proceso'
    ? 'construyendo'
    : project.estado === 'por-arrancar'
      ? 'por-comenzar'
      : (project.estado || 'finalizada');

  const rawSlug = project.slug || project.id;
  const safeSlug = ['slider', 'sliders', 'sliders-jujuy', 'sliders-rosas', 'sliders-funes'].includes(rawSlug) ? 'sliders-hamburger' : rawSlug === 'amstrong' ? 'armstrong' : rawSlug;

  return {
    ...project,
    id: project.id || safeSlug,
    slug: safeSlug,
    nombre: normalizeBrandName(project.nombre || project.titulo || ''),
    titulo: normalizeBrandName(project.titulo || ''),
    anio: project.anio || project.año || '',
    portada: project.portada || project.imagenPortada || project.imagenes?.[0] || '',
    imagenes: Array.isArray(project.imagenes) ? project.imagenes.filter(Boolean) : [],
    imagenesAntes: Array.isArray(project.imagenesAntes) ? project.imagenesAntes.filter(Boolean) : [],
    imagenesProceso: Array.isArray(project.imagenesProceso) ? project.imagenesProceso.filter(Boolean) : [],
    imagenesFinal: Array.isArray(project.imagenesFinal) ? project.imagenesFinal.filter(Boolean) : [],
    galeriaVideo: Array.isArray(project.galeriaVideo) ? project.galeriaVideo.filter(Boolean) : [],
    sucursales: Array.isArray(project.sucursales)
      ? project.sucursales.filter(Boolean).map((branch) => ({
          ...branch,
          nombre: normalizeBrandName(branch.nombre || ''),
          portada: branch.portada || branch.imagenes?.[0] || '',
          imagenes: Array.isArray(branch.imagenes) ? branch.imagenes.filter(Boolean) : [],
          imagenesAntes: Array.isArray(branch.imagenesAntes) ? branch.imagenesAntes.filter(Boolean) : [],
          imagenesProceso: Array.isArray(branch.imagenesProceso) ? branch.imagenesProceso.filter(Boolean) : [],
          imagenesFinal: Array.isArray(branch.imagenesFinal) ? branch.imagenesFinal.filter(Boolean) : [],
        }))
      : [],
    stages: Array.isArray(project.stages)
      ? project.stages.filter(Boolean)
      : Array.isArray(project.etapas)
        ? project.etapas.map((etapa) => typeof etapa === 'string' ? etapa : `${etapa.titulo}: ${etapa.descripcion}`)
        : [],
    estado,
    createdAt: normalizeDate(project.createdAt),
    updatedAt: normalizeDate(project.updatedAt),
  };
}

export function normalizeProjectPayload(project) {
  const slug = slugify(project.slug || project.nombre || 'obra');
  const estado = project.estado === 'por-arrancar' ? 'por-comenzar' : (project.estado || 'finalizada');

  return {
    slug,
    nombre: String(project.nombre || '').trim(),
    tipo: String(project.tipo || '').trim(),
    direccion: String(project.direccion || '').trim(),
    ubicacion: String(project.ubicacion || '').trim(),
    categoryId: String(project.categoryId || '').trim() || undefined,
    categorySlug: String(project.categorySlug || '').trim() || undefined,
    categoryName: String(project.categoria || project.categoryName || project.tipo || '').trim(),
    anio: String(project.anio || '').trim(),
    estado,
    avance: Math.max(0, Math.min(100, Number(project.avance || 0))),
    descripcion: String(project.descripcion || '').trim(),
    proceso: String(project.proceso || '').trim(),
    finalizacion: String(project.finalizacion || '').trim(),
    portada: String(project.portada || '').trim(),
    imagenes: Array.isArray(project.imagenes) ? project.imagenes.filter(Boolean) : [],
    imagenesAntes: Array.isArray(project.imagenesAntes) ? project.imagenesAntes.filter(Boolean) : [],
    imagenesProceso: Array.isArray(project.imagenesProceso) ? project.imagenesProceso.filter(Boolean) : [],
    imagenesFinal: Array.isArray(project.imagenesFinal) ? project.imagenesFinal.filter(Boolean) : [],
    video: String(project.video || '').trim(),
    galeriaVideo: Array.isArray(project.galeriaVideo) ? project.galeriaVideo.filter(Boolean) : [],
    sucursales: Array.isArray(project.sucursales) ? project.sucursales.filter(Boolean) : [],
    stages: Array.isArray(project.stages) ? project.stages.filter(Boolean) : [],
    destacado: Boolean(project.destacado),
    order: Number(project.order || 0),
  };
}

export function orderProjects(projects) {
  const defaultOrder = ['sliders-hamburger', 'marvel', 'burger-house', 'armstrong', 'fichines', 'flama', 'roldan'];
  return [...projects].sort((a, b) => {
    if ((b.destacado ? 1 : 0) !== (a.destacado ? 1 : 0)) return (b.destacado ? 1 : 0) - (a.destacado ? 1 : 0);
    if (Number(a.order || 0) !== Number(b.order || 0)) return Number(a.order || 0) - Number(b.order || 0);
    const ai = defaultOrder.indexOf(a.slug);
    const bi = defaultOrder.indexOf(b.slug);
    if (ai === -1 && bi === -1) return String(a.nombre).localeCompare(String(b.nombre));
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });
}
