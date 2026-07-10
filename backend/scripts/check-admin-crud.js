import { createWork, deleteWork, getWork } from '../models/admin.model.js';
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
    imagenes: [{
      url: 'https://example.com/storage/v1/object/public/crud-images/check/gallery.jpg',
      path: 'check/gallery.jpg',
    }],
  }, 'fortalezaconstruccionesrosario@gmail.com');

  const found = await getWork(created.id);
  const imageCount = await prisma.workImage.count({ where: { workId: created.id } });
  console.log({ created: Boolean(created.id), found: Boolean(found?.id), imageCount });

  await deleteWork(created.id);
  const remaining = await getWork(created.id);
  console.log({ deleted: !remaining });
} finally {
  await prisma.$disconnect();
}
