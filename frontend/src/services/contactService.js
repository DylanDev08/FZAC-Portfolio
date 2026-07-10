import { apiRequest, unwrapData } from './httpService.js';
import { normalizeDate } from './utils.js';

function cleanPayload(payload) {
  return {
    nombre: String(payload.nombre || '').trim(),
    telefono: String(payload.telefono || '').trim(),
    email: String(payload.email || '').trim(),
    mensaje: String(payload.mensaje || '').trim(),
  };
}

function validateContact(clean) {
  if (!clean.nombre || !clean.telefono || !clean.mensaje) {
    throw new Error('Completá nombre, teléfono y mensaje.');
  }
}

function normalizeContact(item) {
  return {
    id: item.id,
    ...item,
    createdAt: normalizeDate(item.createdAt),
    updatedAt: normalizeDate(item.updatedAt),
    respondidaAt: normalizeDate(item.respondidaAt),
  };
}

export async function submitContact(payload) {
  const clean = cleanPayload(payload);
  validateContact(clean);
  return apiRequest('/contactos', { method: 'POST', body: clean });
}

export async function getContacts() {
  const payload = await apiRequest('/contactos', { auth: true });
  return unwrapData(payload).map(normalizeContact);
}

export async function markContactStatus(id, estado = 'respondido') {
  return apiRequest(`/contactos/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    auth: true,
    body: { estado },
  });
}
