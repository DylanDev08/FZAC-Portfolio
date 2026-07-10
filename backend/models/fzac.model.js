import { prisma } from '../db/prisma.js';

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

function validateObra(payload) {
  if (!payload || typeof payload !== 'object') {
    throw new Error('Payload inválido');
  }

  const nombre = sanitizeInput(payload.nombre);
  if (!nombre) {
    throw new Error('El nombre de la obra es obligatorio');
  }

  const slug = sanitizeInput(payload.slug) || nombre.toLowerCase().replace(/\s+/g, '-');

  return {
    id: sanitizeInput(payload.id) || slug,
    nombre,
    titulo: sanitizeInput(payload.titulo) || nombre,
    slug,
    tipo: sanitizeInput(payload.tipo) || 'Local gastronómico',
    categoria: sanitizeInput(payload.categoria) || 'Obras',
    direccion: sanitizeInput(payload.direccion) || '',
    ubicacion: sanitizeInput(payload.ubicacion) || '',
    anio: sanitizeInput(payload.anio) || '',
    estado: sanitizeInput(payload.estado) || 'finalizada',
    avance: Math.max(0, Math.min(100, Number(payload.avance || 100))),
    descripcion: sanitizeInput(payload.descripcion) || '',
    proceso: sanitizeInput(payload.proceso) || '',
    finalizacion: sanitizeInput(payload.finalizacion) || '',
    portada: sanitizeInput(payload.portada) || '',
    imagenes: toArray(payload.imagenes),
    imagenesAntes: toArray(payload.imagenesAntes),
    imagenesProceso: toArray(payload.imagenesProceso),
    imagenesFinal: toArray(payload.imagenesFinal),
    video: sanitizeInput(payload.video) || '',
    videos: toArray(payload.videos),
    galeriaVideo: toArray(payload.galeriaVideo),
    sucursales: toArray(payload.sucursales),
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

async function findObra(id) {
  return prisma.obra.findFirst({
    where: {
      OR: [
        { id },
        { slug: id },
      ],
    },
  });
}

export async function getAllObras() {
  const rows = await prisma.obra.findMany({
    orderBy: [
      { destacado: 'desc' },
      { displayOrder: 'asc' },
      { nombre: 'asc' },
    ],
  });
  return rows.map(toApi);
}

export async function getObraById(id) {
  const row = await findObra(id);
  return toApi(row);
}

export async function createObra(payload) {
  const data = validateObra(payload);
  const row = await prisma.obra.upsert({
    where: { slug: data.slug },
    update: data,
    create: data,
  });
  return toApi(row);
}

export async function updateObra(id, payload) {
  const existing = await findObra(id);
  const data = validateObra({ ...payload, id: existing?.id || payload.id || id });

  if (!existing) {
    const created = await prisma.obra.create({ data });
    return toApi(created);
  }

  const row = await prisma.obra.update({
    where: { id: existing.id },
    data,
  });
  return toApi(row);
}

export async function deleteObra(id) {
  const existing = await findObra(id);
  if (!existing) throw new Error('Obra no encontrada');
  await prisma.obra.delete({ where: { id: existing.id } });
  return { ok: true };
}
