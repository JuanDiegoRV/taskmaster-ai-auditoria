# Fragmento refactorizado: política RLS de membresías

## Archivo de origen

`supabase/migrations/20261113000100_security_hardening.sql`

La migración histórica no se reescribió. El fragmento posterior reemplaza las políticas mediante `DROP POLICY`/`CREATE POLICY`.

## Código anterior

Fuente: `supabase/migrations/20261112000100_initial_schema.sql:230-237`.

```sql
create policy project_members_insert_admins
on public.project_members for insert to authenticated
with check (public.has_project_role(project_id, array['owner', 'admin']::public.project_role[]));

create policy project_members_update_admins
on public.project_members for update to authenticated
using (public.has_project_role(project_id, array['owner', 'admin']::public.project_role[]))
with check (public.has_project_role(project_id, array['owner', 'admin']::public.project_role[]));
```

## Código posterior

Fuente: `supabase/migrations/20261113000100_security_hardening.sql:14-37`.

```sql
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
```

## Explicación técnica

La condición original comprobaba que el actor fuera `owner` o `admin`, pero no comprobaba el rol que se estaba asignando. La versión posterior conserva la administración normal de membresías para ambos roles y añade una segunda condición cuando el nuevo valor es `owner`: el actor debe ser un `owner` existente.

La corrección es mínima, conserva operaciones legítimas y no debilita RLS. La identidad de la membresía continúa protegida por el trigger de `20261112000300_protect_identity_fields.sql`.

## Riesgo resuelto

Reduce la escalada potencial de privilegios por la que un administrador podía convertir otra membresía en `owner`. No se clasificó como vulnerabilidad crítica porque no se ejecutó contra una base real y la intención de gobierno de roles debe confirmarse en Supabase.

## Validación disponible

`supabase/tests/20261113000100_security_hardening.sql` prepara:

- intento de inserción `owner` por un administrador;
- intento de promoción de un miembro por un administrador;
- promoción legítima realizada por el propietario.

La prueba SQL no fue ejecutada porque no hay instancia PostgreSQL/Supabase local. Por tanto, el fragmento está validado por inspección estática y prueba preparada, no por RLS dinámico.
