import { eventosFallback } from '../data/events.js';
import { trabajosVariosItems } from '../data/projects.js';
import { apiRequest, unwrapData } from './httpService.js';
import { normalizeDate, slugify } from './utils.js';

const COLLECTIONS = {
  trabajos: 'trabajos',
  eventos: 'eventos',
};

export function normalizeContentItem(item = {}) {
  const slug = item.slug || item.id || slugify(item.nombre || item.titulo || 'contenido');
  return {
    ...item,
    id: item.id || slug,
    slug,
    nombre: item.nombre || item.titulo || 'Contenido',
    titulo: item.titulo || item.nombre || 'Contenido',
    tipo: item.tipo || item.categoria || 'Referencia',
    categoria: item.categoria || item.tipo || 'Referencia',
    direccion: item.direccion || '',
    ubicacion: item.ubicacion || '',
    anio: item.anio || item.año || '',
    descripcion: item.descripcion || '',
    portada: item.portada || item.imagenPortada || item.imagenes?.[0] || '',
    imagenes: Array.isArray(item.imagenes) ? item.imagenes.filter(Boolean) : [],
    imagenesAntes: Array.isArray(item.imagenesAntes) ? item.imagenesAntes.filter(Boolean) : [],
    imagenesProceso: Array.isArray(item.imagenesProceso) ? item.imagenesProceso.filter(Boolean) : [],
    imagenesFinal: Array.isArray(item.imagenesFinal) ? item.imagenesFinal.filter(Boolean) : [],
    video: item.video || '',
    videos: Array.isArray(item.videos) ? item.videos.filter(Boolean) : [],
    galeriaVideo: Array.isArray(item.galeriaVideo) ? item.galeriaVideo.filter(Boolean) : [],
    puntos: Array.isArray(item.puntos) ? item.puntos.filter(Boolean) : [],
    secciones: Array.isArray(item.secciones) ? item.secciones.filter(Boolean) : [],
    stages: Array.isArray(item.stages) ? item.stages.filter(Boolean) : [],
    destacado: Boolean(item.destacado),
    order: Number(item.order || 0),
    createdAt: normalizeDate(item.createdAt),
    updatedAt: normalizeDate(item.updatedAt),
  };
}

export function normalizeContentPayload(item = {}) {
  const slug = slugify(item.slug || item.nombre || item.titulo || 'contenido');
  return {
    slug,
    nombre: String(item.nombre || item.titulo || '').trim(),
    titulo: String(item.titulo || item.nombre || '').trim(),
    tipo: String(item.tipo || '').trim(),
    categoria: String(item.categoria || item.tipo || '').trim(),
    direccion: String(item.direccion || '').trim(),
    ubicacion: String(item.ubicacion || '').trim(),
    anio: String(item.anio || '').trim(),
    descripcion: String(item.descripcion || '').trim(),
    portada: String(item.portada || '').trim(),
    imagenes: Array.isArray(item.imagenes) ? item.imagenes.filter(Boolean) : [],
    imagenesAntes: Array.isArray(item.imagenesAntes) ? item.imagenesAntes.filter(Boolean) : [],
    imagenesProceso: Array.isArray(item.imagenesProceso) ? item.imagenesProceso.filter(Boolean) : [],
    imagenesFinal: Array.isArray(item.imagenesFinal) ? item.imagenesFinal.filter(Boolean) : [],
    video: String(item.video || '').trim(),
    videos: Array.isArray(item.videos) ? item.videos.filter(Boolean) : [],
    galeriaVideo: Array.isArray(item.galeriaVideo) ? item.galeriaVideo.filter(Boolean) : [],
    puntos: Array.isArray(item.puntos) ? item.puntos.filter(Boolean) : [],
    secciones: Array.isArray(item.secciones) ? item.secciones.filter(Boolean) : [],
    stages: Array.isArray(item.stages) ? item.stages.filter(Boolean) : [],
    destacado: Boolean(item.destacado),
    order: Number(item.order || 0),
  };
}

function orderItems(items) {
  return [...items].sort((a, b) => {
    if ((b.destacado ? 1 : 0) !== (a.destacado ? 1 : 0)) return (b.destacado ? 1 : 0) - (a.destacado ? 1 : 0);
    if (Number(a.order || 0) !== Number(b.order || 0)) return Number(a.order || 0) - Number(b.order || 0);
    return String(a.nombre || a.titulo).localeCompare(String(b.nombre || b.titulo));
  });
}

async function getItems(collectionName, fallback) {
  try {
    const payload = await apiRequest(`/fzac/${collectionName}`);
    const items = unwrapData(payload).map(normalizeContentItem);
    return items.length ? orderItems(items) : orderItems(fallback.map(normalizeContentItem));
  } catch (error) {
    console.warn(`[FZAC] No se pudo leer ${collectionName}. Usando fallback local.`, error.message);
    return orderItems(fallback.map(normalizeContentItem));
  }
}

async function getManagedItems(collectionName) {
  const payload = await apiRequest(`/fzac/${collectionName}`, { auth: true });
  return orderItems(unwrapData(payload).map(normalizeContentItem));
}

export async function getTrabajos() {
  return getItems(COLLECTIONS.trabajos, trabajosVariosItems);
}

export async function getEventos() {
  return getItems(COLLECTIONS.eventos, eventosFallback);
}

export async function getAdminTrabajos() {
  return getManagedItems(COLLECTIONS.trabajos);
}

export async function getAdminEventos() {
  return getManagedItems(COLLECTIONS.eventos);
}

export async function saveContentItem(collectionName, item) {
  const payload = normalizeContentPayload(item);
  if (!payload.slug) throw new Error('El contenido necesita un slug válido.');
  if (!payload.nombre) throw new Error('El contenido necesita un nombre.');

  const id = item.id || payload.slug;
  const method = item.id ? 'PUT' : 'POST';
  const path = item.id ? `/fzac/${collectionName}/${encodeURIComponent(id)}` : `/fzac/${collectionName}`;
  const response = await apiRequest(path, { method, body: { ...payload, id }, auth: true });
  return {
    ok: true,
    status: response.status,
    item: normalizeContentItem(unwrapData(response)),
  };
}

export async function deleteContentItem(collectionName, id) {
  await apiRequest(`/fzac/${collectionName}/${encodeURIComponent(id)}`, { method: 'DELETE', auth: true });
  return { ok: true };
}

export { COLLECTIONS };
