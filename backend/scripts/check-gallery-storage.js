import { createClient } from '@supabase/supabase-js';
import { env } from '../config/env.js';

const client = createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});
const bucket = client.storage.from(env.supabaseStorageBucket);
const matches = [];

async function walk(prefix = '', depth = 0) {
  if (depth > 8) return;
  const { data, error } = await bucket.list(prefix, { limit: 1000, sortBy: { column: 'name', order: 'asc' } });
  if (error) throw error;

  for (const item of data || []) {
    const path = prefix ? `${prefix}/${item.name}` : item.name;
    if (item.id) {
      if (/rondeau|rosas|juan.?manuel/i.test(path)) {
        matches.push({ path, bytes: Number(item.metadata?.size || 0), mime: item.metadata?.mimetype || '' });
      }
    } else {
      await walk(path, depth + 1);
    }
  }
}

await walk();
console.table(matches);
if (!matches.length) console.log('[storage] No hay originales alternativos para Rondeau o Rosas.');
