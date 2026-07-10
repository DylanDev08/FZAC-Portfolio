import { env } from '../config/env.js';

function parseContentDisposition(value = '') {
  const result = {};
  const parts = value.split(';').map((part) => part.trim());
  for (const part of parts) {
    const [key, raw] = part.split('=');
    if (!raw) continue;
    result[key] = raw.replace(/^"|"$/g, '');
  }
  return result;
}

function splitBuffer(buffer, separator) {
  const parts = [];
  let start = 0;
  let index = buffer.indexOf(separator, start);

  while (index !== -1) {
    parts.push(buffer.slice(start, index));
    start = index + separator.length;
    index = buffer.indexOf(separator, start);
  }

  parts.push(buffer.slice(start));
  return parts;
}

async function readBody(req) {
  const chunks = [];
  let size = 0;
  const maxBytes = env.maxUploadSizeMb * 1024 * 1024 + 1024 * 256;

  for await (const chunk of req) {
    size += chunk.length;
    if (size > maxBytes) {
      const error = new Error(`El request supera el máximo permitido de ${env.maxUploadSizeMb}MB.`);
      error.status = 400;
      throw error;
    }
    chunks.push(chunk);
  }

  return Buffer.concat(chunks);
}

export async function parseMultipartForm(req) {
  const contentType = req.headers['content-type'] || '';
  const boundaryMatch = contentType.match(/boundary=(?:"([^"]+)"|([^;]+))/i);

  if (!boundaryMatch) {
    const error = new Error('El request debe ser multipart/form-data.');
    error.status = 400;
    throw error;
  }

  const boundary = Buffer.from(`--${boundaryMatch[1] || boundaryMatch[2]}`);
  const body = await readBody(req);
  const rawParts = splitBuffer(body, boundary);
  const fields = {};
  const files = [];

  for (let part of rawParts) {
    if (!part.length) continue;
    if (part.subarray(0, 2).toString() === '--') continue;
    if (part.subarray(0, 2).toString() === '\r\n') part = part.subarray(2);
    if (part.subarray(part.length - 2).toString() === '\r\n') part = part.subarray(0, part.length - 2);

    const headerEnd = part.indexOf(Buffer.from('\r\n\r\n'));
    if (headerEnd === -1) continue;

    const headersText = part.subarray(0, headerEnd).toString('utf8');
    const content = part.subarray(headerEnd + 4);
    const headers = Object.fromEntries(headersText.split('\r\n').map((line) => {
      const index = line.indexOf(':');
      if (index === -1) return ['', ''];
      return [line.slice(0, index).trim().toLowerCase(), line.slice(index + 1).trim()];
    }).filter(([key]) => key));

    const disposition = parseContentDisposition(headers['content-disposition'] || '');
    if (!disposition.name) continue;

    if (disposition.filename) {
      files.push({
        fieldname: disposition.name,
        filename: disposition.filename,
        contentType: headers['content-type'] || 'application/octet-stream',
        buffer: content,
      });
      continue;
    }

    fields[disposition.name] = content.toString('utf8');
  }

  return { fields, files };
}
