import { createWork, deleteWork, getWork, updateWork } from '../models/admin.model.js';
import { prisma } from '../db/prisma.js';

const slug = `codex-check-${Date.now()}`;

try {
  const created = await createWork({
    title: 'Codex Check Obra',
    slug,
    summary: 'Prueba temporal de CRUD admin.',
    categoryName: 'Trabajos varios',
    status: 'draft',
    portada: {
      url: 'https://example.com/storage/v1/object/public/crud-images/check/cover.jpg',
      path: 'check/cover.jpg',
    },
    imagenesAntes: [
      { url: 'https://example.com/storage/v1/object/public/crud-images/check/before-1.jpg', path: 'check/before-1.jpg' },
      { url: 'https://example.com/storage/v1/object/public/crud-images/check/before-2.jpg', path: 'check/before-2.jpg' },
    ],
  }, 'fortalezaconstruccionesrosario@gmail.com');

  const found = await getWork(created.id);
  const imageCount = await prisma.workImage.count({ where: { workId: created.id } });
  const before = found.workImages.filter((image) => image.section === 'before');
  const updated = await updateWork(created.id, {
    ...found,
    imagenesAntes: [before[1]],
    imagenesProceso: [before[0]],
  }, 'fortalezaconstruccionesrosario@gmail.com');
  const reordered = updated.imagenesAntes[0]?.includes('before-2.jpg')
    && updated.imagenesProceso[0]?.includes('before-1.jpg');
  console.log({ created: Boolean(created.id), found: Boolean(found?.id), imageCount, reordered });

  await deleteWork(created.id);
  const remaining = await getWork(created.id);
  console.log({ deleted: !remaining });
} finally {
  await prisma.$disconnect();
}
