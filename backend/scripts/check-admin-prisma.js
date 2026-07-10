import { prisma } from '../db/prisma.js';

const [categories, siteTexts, works, workImages] = await Promise.all([
  prisma.category.count(),
  prisma.siteText.count(),
  prisma.work.count(),
  prisma.workImage.count(),
]);

console.log({ categories, siteTexts, works, workImages });
await prisma.$disconnect();
