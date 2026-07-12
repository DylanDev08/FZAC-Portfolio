import { createClient } from '@supabase/supabase-js';
import { env } from '../config/env.js';

const client = createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data, error } = await client.auth.admin.listUsers({ page: 1, perPage: 100 });
if (error) throw error;

console.table(env.adminEmails.map((email) => {
  const user = data.users.find((item) => item.email?.toLowerCase() === email);
  return {
    email,
    registrado: Boolean(user),
    confirmado: Boolean(user?.email_confirmed_at),
    bloqueado: Boolean(user?.banned_until && new Date(user.banned_until) > new Date()),
  };
}));
