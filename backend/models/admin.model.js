import { Prisma } from '@prisma/client';
import { prisma } from '../db/prisma.js';
import { env } from '../config/env.js';

function clean(value) {
  return String(value || '').replace(/<[^>]*>/g, '').trim();
}

function slugify(value = '') {
  return clean(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function toInt(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function toBool(value) {
  return value === true || value === 'true' || value === 1 || value === '1';
}

function cleanUuid(value) {
  const uuid = clean(value);
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(uuid) ? uuid : null;
}

function toArray(value) {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (!value) return [];
  return [value].filter(Boolean);
}

function extractStoragePath(value = '') {
  const raw = clean(value);
  if (!raw) return '';

  const bucket = env.supabaseStorageBucket;
  const marker = `/storage/v1/object/public/${bucket}/`;
  const markerIndex = raw.indexOf(marker);
  if (markerIndex >= 0) {
    return decodeURIComponent(raw.slice(markerIndex + marker.length));
  }

  const signedMarker = `/storage/v1/object/sign/${bucket}/`;
  const signedIndex = raw.indexOf(signedMarker);
  if (signedIndex >= 0) {
    return decodeURIComponent(raw.slice(signedIndex + signedMarker.length).split('?')[0]);
  }

  return raw;
}

function imageInputToData(input, section, sortOrder = 0) {
  const imageUrl = typeof input === 'string'
    ? clean(input)
    : clean(input?.image_url || input?.imageUrl || input?.publicUrl || input?.url);

  const imagePath = typeof input === 'string'
    ? extractStoragePath(input)
    : clean(input?.image_path || input?.imagePath || input?.path) || extractStoragePath(imageUrl);

  if (!imageUrl || !imagePath) return null;

  return {
    imageUrl,
    imagePath,
    alt: typeof input === 'string' ? '' : clean(input?.alt),
    section,
    sortOrder,
  };
}

function collectWorkImages(payload = {}) {
  const cover = toArray(payload.coverImage || payload.cover || payload.portada);
  const gallery = toArray(payload.images || payload.imagenes);
  const before = toArray(payload.beforeImages || payload.imagenesAntes);
  const process = toArray(payload.processImages || payload.imagenesProceso);
  const final = toArray(payload.finalImages || payload.imagenesFinal);
  const classifiedUrls = new Set([...cover, ...before, ...process, ...final]
    .map((item) => imageInputToData(item, 'gallery')?.imageUrl)
    .filter(Boolean));
  const unclassifiedGallery = gallery.filter((item) => {
    const url = imageInputToData(item, 'gallery')?.imageUrl;
    return url && !classifiedUrls.has(url);
  });
  const groups = [
    ['cover', cover],
    ['gallery', unclassifiedGallery],
    ['before', before],
    ['process', process],
    ['final', final],
  ];

  const images = [];
  for (const [section, items] of groups) {
    items.forEach((item, index) => {
      const data = imageInputToData(item, section, index);
      if (data) images.push(data);
    });
  }
  return images;
}

function imagesBySection(images = [], section) {
  return images
    .filter((image) => image.section === section)
    .sort((a, b) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0));
}

function imageToApi(image) {
  return {
    id: image.id,
    workId: image.workId,
    image_url: image.imageUrl,
    image_path: image.imagePath,
    imageUrl: image.imageUrl,
    imagePath: image.imagePath,
    url: image.imageUrl,
    path: image.imagePath,
    alt: image.alt || '',
    section: image.section,
    sortOrder: image.sortOrder || 0,
    mimeType: image.mimeType || '',
    sizeBytes: image.sizeBytes || 0,
    createdAt: image.createdAt?.toISOString?.() || image.createdAt,
  };
}

export function workToApi(work) {
  if (!work) return null;
  const images = Array.isArray(work.images) ? work.images : [];
  const cover = imagesBySection(images, 'cover')[0] || images[0];
  const gallery = imagesBySection(images, 'gallery');
  const before = imagesBySection(images, 'before');
  const process = imagesBySection(images, 'process');
  const final = imagesBySection(images, 'final');

  return {
    id: work.id,
    slug: work.slug,
    title: work.title,
    titulo: work.title,
    nombre: work.title,
    summary: work.summary || '',
    descripcion: work.summary || work.body || '',
    body: work.body || '',
    client: work.client || '',
    tipo: work.client || work.category?.name || 'Obra',
    categoryId: work.categoryId || '',
    categorySlug: work.category?.slug || '',
    categoria: work.category?.name || '',
    category: work.category ? categoryToApi(work.category) : null,
    location: work.location || '',
    ubicacion: work.location || '',
    address: work.address || '',
    direccion: work.address || '',
    year: work.year || '',
    anio: work.year || '',
    status: work.status || 'draft',
    estado: work.status || 'draft',
    progress: Number(work.progress || 0),
    avance: Number(work.progress || 0),
    proceso: work.processText || '',
    finalizacion: work.completionText || '',
    video: work.video || '',
    galeriaVideo: toArray(work.videoGallery),
    sucursales: toArray(work.branches),
    stages: toArray(work.stages),
    puntos: toArray(work.points),
    order: work.displayOrder || 0,
    destacado: Boolean(work.isFeatured),
    portada: cover?.imageUrl || work.coverImageUrl || '',
    portadaPath: cover?.imagePath || work.coverImagePath || '',
    imagenes: gallery.map((image) => image.imageUrl),
    imagenesAntes: before.map((image) => image.imageUrl),
    imagenesProceso: process.map((image) => image.imageUrl),
    imagenesFinal: final.map((image) => image.imageUrl),
    workImages: images.map(imageToApi),
    images: images.map(imageToApi),
    createdAt: work.createdAt?.toISOString?.() || work.createdAt,
    updatedAt: work.updatedAt?.toISOString?.() || work.updatedAt,
  };
}

export function categoryToApi(category) {
  if (!category) return null;
  return {
    id: category.id,
    slug: category.slug,
    name: category.name,
    nombre: category.name,
    description: category.description || '',
    displayOrder: category.displayOrder || 0,
    order: category.displayOrder || 0,
    isActive: Boolean(category.isActive),
    createdAt: category.createdAt?.toISOString?.() || category.createdAt,
    updatedAt: category.updatedAt?.toISOString?.() || category.updatedAt,
  };
}

export function siteTextToApi(text) {
  if (!text) return null;
  return {
    id: text.id,
    key: text.key,
    title: text.title || '',
    titulo: text.title || '',
    value: text.value || '',
    contenido: text.value || '',
    section: text.section || 'general',
    description: text.description || '',
    createdAt: text.createdAt?.toISOString?.() || text.createdAt,
    updatedAt: text.updatedAt?.toISOString?.() || text.updatedAt,
  };
}

async function resolveCategory(payload = {}) {
  const id = clean(payload.categoryId || payload.category_id);
  if (id) {
    const category = await prisma.category.findUnique({ where: { id } });
    if (category) return category;
    throw new Error('La categoría seleccionada no existe. Actualizá el panel e intentá nuevamente.');
  }

  const rawName = clean(payload.categoryName || payload.category || payload.categoria || payload.tipo);
  if (!rawName) return null;

  const slug = slugify(payload.categorySlug || rawName);
  return prisma.category.upsert({
    where: { slug },
    update: { name: rawName },
    create: { slug, name: rawName, description: '' },
  });
}

async function resolveAuthor(email) {
  const cleanEmail = clean(email).toLowerCase();
  if (!cleanEmail) return null;

  return prisma.profile.upsert({
    where: { email: cleanEmail },
    update: { role: 'admin' },
    create: { email: cleanEmail, role: 'admin', name: 'Fortaleza Construcciones' },
  });
}

function workData(payload = {}, category, authorId = null) {
  const title = clean(payload.title || payload.titulo || payload.nombre);
  if (!title) throw new Error('La obra necesita un título.');

  const slug = slugify(payload.slug || title);
  if (!slug) throw new Error('La obra necesita un slug válido.');

  const status = clean(payload.status || payload.estado) || 'draft';
  const cover = imageInputToData(payload.coverImage || payload.cover || payload.portada, 'cover');

  return {
    slug,
    title,
    summary: clean(payload.summary || payload.descripcion),
    body: clean(payload.body || [payload.proceso, payload.finalizacion].filter(Boolean).join('\n\n')),
    client: clean(payload.client || payload.tipo),
    location: clean(payload.location || payload.ubicacion),
    address: clean(payload.address || payload.direccion),
    year: clean(payload.year || payload.anio),
    status,
    progress: Math.max(0, Math.min(100, toInt(payload.progress ?? payload.avance, 0))),
    processText: clean(payload.processText || payload.proceso),
    completionText: clean(payload.completionText || payload.finalizacion),
    video: clean(payload.video) || null,
    videoGallery: toArray(payload.videoGallery || payload.galeriaVideo),
    branches: toArray(payload.branches || payload.sucursales),
    stages: toArray(payload.stages || payload.etapas),
    points: toArray(payload.points || payload.puntos),
    coverImageUrl: cover?.imageUrl || null,
    coverImagePath: cover?.imagePath || null,
    displayOrder: toInt(payload.displayOrder || payload.order, 0),
    isFeatured: toBool(payload.isFeatured ?? payload.destacado),
    categoryId: category?.id || null,
    authorId: cleanUuid(authorId),
  };
}

async function replaceWorkImages(tx, workId, payload) {
  const images = collectWorkImages(payload);
  await tx.workImage.deleteMany({ where: { workId } });
  if (!images.length) return;

  await tx.workImage.createMany({
    data: images.map((image) => ({ ...image, workId })),
  });
}

const workInclude = {
  category: true,
  images: { orderBy: [{ section: 'asc' }, { sortOrder: 'asc' }, { createdAt: 'asc' }] },
};

export async function listWorks() {
  const rows = await prisma.work.findMany({
    include: workInclude,
    orderBy: [{ isFeatured: 'desc' }, { displayOrder: 'asc' }, { title: 'asc' }],
  });
  return rows.map(workToApi);
}

export async function getWork(id) {
  const row = await prisma.work.findFirst({
    where: { OR: [{ id }, { slug: id }] },
    include: workInclude,
  });
  return workToApi(row);
}

export async function createWork(payload, userEmail, userId) {
  const category = await resolveCategory(payload);
  await resolveAuthor(userEmail);
  const data = workData(payload, category, userId);

  try {
    const row = await prisma.$transaction(async (tx) => {
      const created = await tx.work.create({ data });
      await replaceWorkImages(tx, created.id, payload);
      return tx.work.findUnique({ where: { id: created.id }, include: workInclude });
    });
    return workToApi(row);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw new Error('Ya existe una obra con ese slug.');
    }
    throw error;
  }
}

export async function updateWork(id, payload, userEmail, userId) {
  const existing = await prisma.work.findFirst({ where: { OR: [{ id }, { slug: id }] } });
  if (!existing) throw new Error('Obra no encontrada.');

  const category = await resolveCategory(payload);
  await resolveAuthor(userEmail);
  const data = workData({ ...payload, slug: payload.slug || existing.slug }, category, userId || existing.authorId);

  const row = await prisma.$transaction(async (tx) => {
    await tx.work.update({ where: { id: existing.id }, data });
    await replaceWorkImages(tx, existing.id, payload);
    return tx.work.findUnique({ where: { id: existing.id }, include: workInclude });
  });

  return workToApi(row);
}

export async function deleteWork(id) {
  const existing = await prisma.work.findFirst({ where: { OR: [{ id }, { slug: id }] } });
  if (!existing) throw new Error('Obra no encontrada.');
  await prisma.work.delete({ where: { id: existing.id } });
  return { id: existing.id };
}

export async function syncPortfolioCatalog(catalog = [], userEmail = '') {
  const items = Array.isArray(catalog) ? catalog : [];
  const existingRows = await prisma.work.findMany({ select: { slug: true } });
  const existingSlugs = new Set(existingRows.map((item) => item.slug));
  const created = [];

  for (const item of items) {
    const slug = slugify(item?.slug || item?.nombre);
    if (!slug || existingSlugs.has(slug)) continue;
    const work = await createWork({ ...item, slug }, userEmail, null);
    existingSlugs.add(slug);
    created.push(work);
  }

  return {
    created: created.length,
    total: existingSlugs.size,
    items: created,
  };
}

export async function listCategories() {
  const rows = await prisma.category.findMany({
    orderBy: [{ displayOrder: 'asc' }, { name: 'asc' }],
  });
  return rows.map(categoryToApi);
}

export async function createCategory(payload) {
  const name = clean(payload.name || payload.nombre);
  if (!name) throw new Error('La categoría necesita un nombre.');
  const slug = slugify(payload.slug || name);

  const row = await prisma.category.create({
    data: {
      slug,
      name,
      description: clean(payload.description || payload.descripcion),
      displayOrder: toInt(payload.displayOrder || payload.order, 0),
      isActive: payload.isActive === undefined ? true : toBool(payload.isActive),
    },
  });
  return categoryToApi(row);
}

export async function updateCategory(id, payload) {
  const existing = await prisma.category.findFirst({ where: { OR: [{ id }, { slug: id }] } });
  if (!existing) throw new Error('Categoría no encontrada.');

  const name = clean(payload.name || payload.nombre || existing.name);
  const row = await prisma.category.update({
    where: { id: existing.id },
    data: {
      slug: slugify(payload.slug || existing.slug || name),
      name,
      description: clean(payload.description || payload.descripcion),
      displayOrder: toInt(payload.displayOrder || payload.order, existing.displayOrder),
      isActive: payload.isActive === undefined ? existing.isActive : toBool(payload.isActive),
    },
  });
  return categoryToApi(row);
}

export async function deleteCategory(id) {
  const existing = await prisma.category.findFirst({ where: { OR: [{ id }, { slug: id }] } });
  if (!existing) throw new Error('Categoría no encontrada.');
  await prisma.category.delete({ where: { id: existing.id } });
  return { id: existing.id };
}

export async function listSiteTexts() {
  const rows = await prisma.siteText.findMany({
    orderBy: [{ section: 'asc' }, { key: 'asc' }],
  });
  return rows.map(siteTextToApi);
}

export async function createSiteText(payload) {
  const key = clean(payload.key);
  if (!key) throw new Error('El texto necesita una clave.');
  const value = clean(payload.value || payload.contenido);
  if (!value) throw new Error('El texto necesita contenido.');

  const row = await prisma.siteText.create({
    data: {
      key,
      title: clean(payload.title || payload.titulo) || null,
      value,
      section: clean(payload.section || payload.seccion) || 'general',
      description: clean(payload.description || payload.descripcion),
    },
  });
  return siteTextToApi(row);
}

export async function updateSiteText(id, payload) {
  const existing = await prisma.siteText.findFirst({ where: { OR: [{ id }, { key: id }] } });
  if (!existing) throw new Error('Texto no encontrado.');
  const value = clean(payload.value ?? payload.contenido ?? existing.value);
  if (!value) throw new Error('El texto necesita contenido.');

  const row = await prisma.siteText.update({
    where: { id: existing.id },
    data: {
      key: clean(payload.key || existing.key),
      title: clean(payload.title || payload.titulo) || null,
      value,
      section: clean(payload.section || payload.seccion) || existing.section,
      description: clean(payload.description || payload.descripcion),
    },
  });
  return siteTextToApi(row);
}

export async function deleteSiteText(id) {
  const existing = await prisma.siteText.findFirst({ where: { OR: [{ id }, { key: id }] } });
  if (!existing) throw new Error('Texto no encontrado.');
  await prisma.siteText.delete({ where: { id: existing.id } });
  return { id: existing.id };
}

export async function listWorkImages(workId) {
  const rows = await prisma.workImage.findMany({
    where: workId ? { workId } : undefined,
    orderBy: [{ section: 'asc' }, { sortOrder: 'asc' }, { createdAt: 'asc' }],
  });
  return rows.map(imageToApi);
}

export async function createWorkImage(payload) {
  const workId = clean(payload.workId || payload.work_id);
  if (!workId) throw new Error('La imagen necesita una obra asociada.');

  const data = imageInputToData(payload, clean(payload.section) || 'gallery', toInt(payload.sortOrder ?? payload.order, 0));
  if (!data) throw new Error('La imagen necesita image_url e image_path.');

  const row = await prisma.workImage.create({ data: { ...data, workId } });
  return imageToApi(row);
}

export async function updateWorkImage(id, payload) {
  const existing = await prisma.workImage.findUnique({ where: { id } });
  if (!existing) throw new Error('Imagen no encontrada.');

  const data = imageInputToData(
    { ...payload, imageUrl: payload.imageUrl || payload.image_url || existing.imageUrl, imagePath: payload.imagePath || payload.image_path || existing.imagePath },
    clean(payload.section || existing.section),
    toInt(payload.sortOrder ?? payload.order, existing.sortOrder),
  );
  if (!data) throw new Error('La imagen necesita image_url e image_path.');

  const row = await prisma.workImage.update({ where: { id }, data });
  return imageToApi(row);
}

export async function deleteWorkImage(id) {
  const existing = await prisma.workImage.findUnique({ where: { id } });
  if (!existing) throw new Error('Imagen no encontrada.');
  await prisma.workImage.delete({ where: { id } });
  return { id };
}
