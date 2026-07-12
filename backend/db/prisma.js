import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis;

function runtimeDatabaseUrl(value = '') {
  const url = String(value || '').trim();
  if (!url || /[?&]connection_limit=/i.test(url)) return url;
  return `${url}${url.includes('?') ? '&' : '?'}connection_limit=1`;
}

const databaseUrl = runtimeDatabaseUrl(process.env.DATABASE_URL);

export const prisma = globalForPrisma.__fzacPrisma || new PrismaClient({
  ...(databaseUrl ? { datasources: { db: { url: databaseUrl } } } : {}),
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.__fzacPrisma = prisma;
}
