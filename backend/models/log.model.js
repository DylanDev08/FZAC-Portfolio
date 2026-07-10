import { prisma } from '../db/prisma.js';

export async function createLoginLog(payload) {
  const row = await prisma.loginLog.create({
    data: {
      email: String(payload.email || '').toLowerCase().slice(0, 180),
      success: Boolean(payload.success),
      reason: String(payload.reason || '').slice(0, 180),
      userAgent: String(payload.userAgent || '').slice(0, 500),
    },
  });
  return {
    ...row,
    createdAt: row.createdAt?.toISOString(),
  };
}

export async function listLoginLogs() {
  const rows = await prisma.loginLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 200,
  });
  return rows.map((row) => ({
    ...row,
    createdAt: row.createdAt?.toISOString(),
  }));
}
