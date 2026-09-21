-- Use one authoritative source for admin authorization.
-- profiles.role can remain descriptive, but it must not grant privileges by itself.

create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.admin_profiles ap
    where lower(ap.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
      and lower(ap.role) = 'admin'
  );
$$;

revoke all on function private.is_admin() from public, anon;
grant execute on function private.is_admin() to authenticated;
