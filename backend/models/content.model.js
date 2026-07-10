import { prisma } from '../db/prisma.js';

const delegates = {
  trabajos: prisma.trabajo,
  eventos: prisma.evento,
};

function sanitizeInput(value) {
  if (typeof value !== 'string') return '';
  return value.replace(/<[^>]*>/g, '').trim();
}

function toArray(value) {
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

function dateToIso(value) {
  return value instanceof Date ? value.toISOString() : value;
}

function getDelegate(kind) {
  const delegate = delegates[kind];
  if (!delegate) throw new Error('Tipo de contenido inválido');
  return delegate;
}

function validateContent(payload, kind) {
  if (!payload || typeof payload !== 'object') {
    throw new Error('Payload inválido');
  }

  const nombre = sanitizeInput(payload.nombre || payload.titulo);
  if (!nombre) throw new Error('El contenido necesita un nombre');

  const slug = sanitizeInput(payload.slug) || nombre.toLowerCase().replace(/\s+/g, '-');

  return {
    id: sanitizeInput(payload.id) || slug,
    slug,
    nombre,
    titulo: sanitizeInput(payload.titulo) || nombre,
    tipo: sanitizeInput(payload.tipo) || 'Referencia',
    categoria: sanitizeInput(payload.categoria) || (kind === 'eventos' ? 'Eventos' : 'Trabajos varios'),
    direccion: sanitizeInput(payload.direccion) || '',
    ubicacion: sanitizeInput(payload.ubicacion) || '',
    anio: sanitizeInput(payload.anio) || '',
    descripcion: sanitizeInput(payload.descripcion) || '',
    portada: sanitizeInput(payload.portada) || '',
    imagenes: toArray(payload.imagenes),
    imagenesAntes: toArray(payload.imagenesAntes),
    imagenesProceso: toArray(payload.imagenesProceso),
    imagenesFinal: toArray(payload.imagenesFinal),
    video: sanitizeInput(payload.video) || '',
    videos: toArray(payload.videos),
    galeriaVideo: toArray(payload.galeriaVideo),
    secciones: toArray(payload.secciones),
    stages: toArray(payload.stages),
    puntos: toArray(payload.puntos),
    destacado: Boolean(payload.destacado),
    displayOrder: Number(payload.order || payload.displayOrder || 0),
  };
}

function toApi(row) {
  if (!row) return null;
  return {
    ...row,
    order: row.displayOrder || 0,
    createdAt: dateToIso(row.createdAt),
    updatedAt: dateToIso(row.updatedAt),
  };
}

async function findContent(kind, id) {
  const delegate = getDelegate(kind);
  return delegate.findFirst({
    where: {
      OR: [
        { id },
        { slug: id },
      ],
    },
  });
}

export async function getAllContent(kind) {
  const delegate = getDelegate(kind);
  const rows = await delegate.findMany({
    orderBy: [
      { destacado: 'desc' },
      { displayOrder: 'asc' },
      { nombre: 'asc' },
    ],
  });
  return rows.map(toApi);
}

export async function createContent(kind, payload) {
  const delegate = getDelegate(kind);
  const data = validateContent(payload, kind);
  const row = await delegate.upsert({
    where: { slug: data.slug },
    update: data,
    create: data,
  });
  return toApi(row);
}

export async function updateContent(kind, id, payload) {
  const delegate = getDelegate(kind);
  const existing = await findContent(kind, id);
  const data = validateContent({ ...payload, id: existing?.id || payload.id || id }, kind);

  if (!existing) {
    const created = await delegate.create({ data });
    return toApi(created);
  }

  const row = await delegate.update({
    where: { id: existing.id },
    data,
  });
  return toApi(row);
}

export async function deleteContent(kind, id) {
  const delegate = getDelegate(kind);
  const existing = await findContent(kind, id);
  if (!existing) throw new Error('Contenido no encontrado');
  await delegate.delete({ where: { id: existing.id } });
  return { ok: true };
}
