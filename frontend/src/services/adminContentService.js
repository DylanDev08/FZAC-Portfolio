import { apiRequest, unwrapData } from './httpService.js';
import { slugify } from './utils.js';

export async function getCategories() {
  const payload = await apiRequest('/admin/categories', { auth: true });
  return unwrapData(payload);
}

export async function saveCategory(category = {}) {
  const name = String(category.name || category.nombre || '').trim();
  if (!name) throw new Error('La categoría necesita un nombre.');

  const body = {
    slug: slugify(category.slug || name),
    name,
    description: String(category.description || category.descripcion || '').trim(),
    displayOrder: Number(category.displayOrder || category.order || 0),
    isActive: category.isActive !== false,
  };

  const path = category.id ? `/admin/categories/${encodeURIComponent(category.id)}` : '/admin/categories';
  const method = category.id ? 'PUT' : 'POST';
  const response = await apiRequest(path, { method, body, auth: true });
  return { status: response.status, item: unwrapData(response) };
}

export async function deleteCategory(id) {
  const response = await apiRequest(`/admin/categories/${encodeURIComponent(id)}`, { method: 'DELETE', auth: true });
  return { status: response.status, item: unwrapData(response) };
}

export async function getSiteTexts() {
  const payload = await apiRequest('/admin/site-texts', { auth: true });
  return unwrapData(payload);
}

export async function saveSiteText(text = {}) {
  const key = String(text.key || '').trim();
  if (!key) throw new Error('El texto necesita una clave.');

  const body = {
    key,
    title: String(text.title || text.titulo || '').trim(),
    value: String(text.value || text.contenido || '').trim(),
    section: String(text.section || text.seccion || 'general').trim(),
    description: String(text.description || text.descripcion || '').trim(),
  };

  const path = text.id ? `/admin/site-texts/${encodeURIComponent(text.id)}` : '/admin/site-texts';
  const method = text.id ? 'PUT' : 'POST';
  const response = await apiRequest(path, { method, body, auth: true });
  return { status: response.status, item: unwrapData(response) };
}

export async function deleteSiteText(id) {
  const response = await apiRequest(`/admin/site-texts/${encodeURIComponent(id)}`, { method: 'DELETE', auth: true });
  return { status: response.status, item: unwrapData(response) };
}
