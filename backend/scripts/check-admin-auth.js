import jwt from 'jsonwebtoken';
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
  throw new Error('No se encontro un backend local activo.');
}

const apiUrl = process.env.CHECK_API_URL || await findApiUrl();
const token = jwt.sign({ email: env.adminEmails[0], role: 'admin' }, env.jwtSecret, { expiresIn: '2m' });
const response = await fetch(`${apiUrl}/admin/works`, {
  headers: { Authorization: `Bearer ${token}` },
});
const payload = await response.json().catch(() => ({}));
const invalidResponse = await fetch(`${apiUrl}/admin/works`, {
  method: 'POST',
  headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({ title: 'Control de validación', slug: 'Slug Inválido', status: 'incorrecto' }),
});
const invalidPayload = await invalidResponse.json().catch(() => ({}));

console.log({
  apiUrl,
  status: response.status,
  authorized: response.ok,
  works: Array.isArray(payload.data) ? payload.data.length : 0,
  error: payload.error || '',
  validationStatus: invalidResponse.status,
  validationRejected: invalidResponse.status === 400 && Boolean(invalidPayload.error),
});

if (!response.ok || invalidResponse.status !== 400) process.exitCode = 1;
