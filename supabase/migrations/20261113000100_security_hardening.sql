-- TaskMaster AI - Auditoría IA Prompt 03
-- Hardening posterior a las migraciones históricas. No ejecutar remotamente
-- desde este laboratorio sin autorización explícita.

-- Estas funciones solo son invocadas por triggers. Los helpers
-- is_project_member/has_project_role se mantienen ejecutables por
-- authenticated porque las políticas RLS dependen de ellos.
revoke all on function public.set_updated_at() from public, anon, authenticated;
revoke all on function public.handle_new_user() from public, anon, authenticated;
revoke all on function public.add_project_owner_member() from public, anon, authenticated;

-- Un administrador puede administrar miembros, pero la concesión de
-- propiedad queda reservada a un propietario existente.
drop policy if exists project_members_insert_admins on public.project_members;
create policy project_members_insert_admins
on public.project_members for insert to authenticated
with check (
  public.has_project_role(project_id, array['owner', 'admin']::public.project_role[])
  and (
    role <> 'owner'
    or public.has_project_role(project_id, array['owner']::public.project_role[])
  )
);

drop policy if exists project_members_update_admins on public.project_members;
create policy project_members_update_admins
on public.project_members for update to authenticated
using (
  public.has_project_role(project_id, array['owner', 'admin']::public.project_role[])
)
with check (
  public.has_project_role(project_id, array['owner', 'admin']::public.project_role[])
  and (
    role <> 'owner'
    or public.has_project_role(project_id, array['owner']::public.project_role[])
  )
);
