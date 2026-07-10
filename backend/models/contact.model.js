import { prisma } from '../db/prisma.js';

function cleanString(value) {
  return String(value || '').replace(/<[^>]*>/g, '').trim();
}

function toApi(row) {
  return {
    ...row,
    createdAt: row.createdAt?.toISOString(),
    updatedAt: row.updatedAt?.toISOString(),
    respondidaAt: row.respondidaAt?.toISOString() || null,
  };
}

export function validateContact(payload) {
  const clean = {
    nombre: cleanString(payload.nombre),
    telefono: cleanString(payload.telefono),
    email: cleanString(payload.email),
    mensaje: cleanString(payload.mensaje),
  };

  if (clean.nombre.length < 2 || clean.nombre.length > 80) throw new Error('Nombre inválido');
  if (clean.telefono.length < 6 || clean.telefono.length > 40) throw new Error('Teléfono inválido');
  if (clean.email.length > 120) throw new Error('Email inválido');
  if (clean.mensaje.length < 8 || clean.mensaje.length > 1600) throw new Error('Mensaje inválido');

  return clean;
}

export async function createContact(payload) {
  const data = validateContact(payload);
  const row = await prisma.contacto.create({
    data: {
      ...data,
      estado: 'nuevo',
      respondida: false,
    },
  });
  return toApi(row);
}

export async function listContacts() {
  const rows = await prisma.contacto.findMany({ orderBy: { createdAt: 'desc' } });
  return rows.map(toApi);
}

export async function updateContactStatus(id, estado = 'respondido') {
  const respondida = estado === 'respondido' || estado === 'respondida';
  const row = await prisma.contacto.update({
    where: { id },
    data: {
      estado,
      respondida,
      respondidaAt: respondida ? new Date() : null,
    },
  });
  return toApi(row);
}
