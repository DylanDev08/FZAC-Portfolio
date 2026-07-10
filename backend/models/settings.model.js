import { prisma } from '../db/prisma.js';

export async function getSiteSettings(id = 'main') {
  const row = await prisma.siteSetting.findUnique({ where: { id } });
  return row?.data || null;
}

export async function saveSiteSettings(id = 'main', data = {}) {
  const row = await prisma.siteSetting.upsert({
    where: { id },
    create: { id, data },
    update: { data },
  });
  return row.data;
}
