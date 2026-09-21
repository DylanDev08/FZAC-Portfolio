
drop policy if exists "Profiles can be inserted by owner" on public.profiles;
create policy "Profiles can be inserted by owner"
on public.profiles
for insert
to authenticated
with check (
  id = (select auth.uid())
  and role = 'user'
  and lower(email) = lower(coalesce((select auth.jwt() ->> 'email'), ''))
);

drop policy if exists "Profiles can be updated by owner or admin" on public.profiles;
drop policy if exists "Profiles can be updated by owner" on public.profiles;
drop policy if exists "Admins can update profiles" on public.profiles;

create policy "Profiles can be updated by owner"
on public.profiles
for update
to authenticated
using (
  id = (select auth.uid())
  and role = 'user'
)
with check (
  id = (select auth.uid())
  and role = 'user'
  and lower(email) = lower(coalesce((select auth.jwt() ->> 'email'), ''))
);

create policy "Admins can update profiles"
on public.profiles
for update
to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));
