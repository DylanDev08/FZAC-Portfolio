import jwt from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';
import { env } from '../config/env.js';

async function findApiUrl() {
  for (const port of [4000, 4001, 4002, 4003, 4004, 4005]) {
    try {
      const response = await fetch(`http://localhost:${port}/api/public-config`);
      if (response.ok) return `http://localhost:${port}/api`;
    } catch {
      // Prueba el siguiente puerto local.
    }
  }
  throw new Error('No encontré backend local activo entre 4000 y 4005.');
}

async function request(apiUrl, path, options = {}) {
  const response = await fetch(`${apiUrl}${path}`, options);
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(`${response.status} ${payload.error || payload.message || 'request failed'}`);
  }
  return { status: response.status, payload };
}

const apiUrl = await findApiUrl();
const token = jwt.sign({ email: env.adminEmails[0] || env.adminEmail, role: 'admin' }, env.jwtSecret, { expiresIn: '10m' });
const auth = { Authorization: `Bearer ${token}` };
const png = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=',
  'base64',
);

const formData = new FormData();
formData.append('folder', 'checks');
formData.append('file', new Blob([png], { type: 'image/png' }), 'check.png');

const upload = await request(apiUrl, '/admin/uploads', {
  method: 'POST',
  headers: auth,
  body: formData,
});

const uploaded = upload.payload.data;
const slug = `http-check-${Date.now()}`;

const created = await request(apiUrl, '/admin/works', {
  method: 'POST',
  headers: { ...auth, 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'HTTP Check Obra',
    slug,
    summary: 'Prueba temporal por endpoint admin.',
    categoryName: 'Trabajos varios',
    status: 'draft',
    portada: { url: uploaded.publicUrl, path: uploaded.path },
    imagenes: [{ url: uploaded.publicUrl, path: uploaded.path }],
  }),
});

const work = created.payload.data;
const images = await request(apiUrl, `/admin/work-images?workId=${encodeURIComponent(work.id)}`, {
  headers: auth,
});

await request(apiUrl, `/admin/works/${encodeURIComponent(work.id)}`, {
  method: 'DELETE',
  headers: auth,
});

const storage = createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});
await storage.storage.from(env.supabaseStorageBucket).remove([uploaded.path]);

console.log({
  apiUrl,
  uploadStatus: upload.status,
  createStatus: created.status,
  workImages: images.payload.data.length,
  deleted: true,
});
