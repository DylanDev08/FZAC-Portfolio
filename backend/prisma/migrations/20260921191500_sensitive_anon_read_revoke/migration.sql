-- Defense in depth: these tables are not public content.
-- RLS remains enabled, but anon also loses table-level SELECT privileges.

revoke select on table
  public.admin_profiles,
  public.profiles,
  public.contactos,
  public.login_logs
from anon;
