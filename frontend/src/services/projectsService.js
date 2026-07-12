import { fallbackProjects } from '../data/projects.js';
import { apiRequest, unwrapData } from './httpService.js';
import { normalizeDate, slugify } from './utils.js';

export async function getProjects() {
  try {
    const payload = await apiRequest('/fzac/works');
    const remoteProjects = unwrapData(payload).map((item) => normalizeProject(item));
    return remoteProjects.length ? orderProjects(remoteProjects) : orderProjects(fallbackProjects.map(normalizeProject));
  } catch (error) {
    console.warn('[FZAC] Backend/Supabase no disponible. Usando obras locales.', error.message);
    return fallbackProjects;
  }
}

export async function getAdminProjects() {
  const payload = await apiRequest('/admin/works', { auth: true });
  return unwrapData(payload).map((item) => normalizeProject(item));
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
