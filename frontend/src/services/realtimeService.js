import { ensureSupabaseReady } from '../supabase/config.js';

const ADMIN_REALTIME_TABLES = [
  'works',
  'work_images',
  'categories',
  'site_texts',
  'trabajos',
  'eventos',
];

export function subscribeAdminCrud(onChange) {
  let active = true;
  let channel = null;
  let timeout = null;

  const scheduleChange = () => {
    if (!active || typeof onChange !== 'function') return;
    window.clearTimeout(timeout);
    timeout = window.setTimeout(() => {
      if (active) onChange();
    }, 350);
  };

  ensureSupabaseReady()
    .then((client) => {
      if (!active) return;

      channel = client.channel('fzac-admin-crud-realtime');
      ADMIN_REALTIME_TABLES.forEach((table) => {
        channel.on(
          'postgres_changes',
          { event: '*', schema: 'public', table },
          scheduleChange,
        );
      });

      channel.subscribe();
    })
    .catch((error) => {
      console.warn('[FZAC] Realtime no disponible para el CRUD:', error?.message || error);
    });

  return () => {
    active = false;
    window.clearTimeout(timeout);
    if (channel) {
      ensureSupabaseReady()
        .then((client) => client.removeChannel(channel))
        .catch(() => {});
    }
  };
}
