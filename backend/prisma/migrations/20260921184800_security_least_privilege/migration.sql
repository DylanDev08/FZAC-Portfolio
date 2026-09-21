-- Least privilege hardening mirrored from the production Supabase audit.
-- Safe to re-run: ALTER/REVOKE/DROP POLICY IF EXISTS are idempotent for this state.

alter function private.is_admin() set search_path = '';
alter function public.handle_new_user() set search_path = '';

revoke truncate, references, trigger on all tables in schema public from anon, authenticated;
revoke insert, update, delete on all tables in schema public from anon;

drop policy if exists "Anyone can create contact requests" on public.contactos;
drop policy if exists "Anyone can create login logs" on public.login_logs;
