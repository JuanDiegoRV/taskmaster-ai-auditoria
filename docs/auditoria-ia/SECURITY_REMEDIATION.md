# Remediación de seguridad — Prompt 03

Fecha: 2026-11-13

## Alcance y límites

La remediación se realizó únicamente en `taskmaster-ai-auditoria`. No se ejecutó SQL remoto, no se conectó Supabase real y no se reescribieron migraciones históricas. El Prompt 03 recibido termina de forma incompleta en “Evidencia que lo”; este documento cubre las correcciones explícitamente definidas hasta ese punto.

## SEC-01 — Funciones `SECURITY DEFINER` de triggers

### Antes

`20261112000100_initial_schema.sql` define como `SECURITY DEFINER` las funciones `set_updated_at`, `handle_new_user`, `is_project_member`, `has_project_role` y `add_project_owner_member`. Solo `is_project_member` y `has_project_role` tenían revocación explícita y concesión a `authenticated`.

### Riesgo e impacto

Las funciones de trigger no necesitan ser llamadas por usuarios. Mantener permisos de ejecución más amplios aumenta la superficie de funciones privilegiadas. No se confirmó una explotación real sin una instancia PostgreSQL.

### Corrección aplicada

La nueva migración `supabase/migrations/20261113000100_security_hardening.sql` revoca `EXECUTE` para `public`, `anon` y `authenticated` en:

- `public.set_updated_at()`
- `public.handle_new_user()`
- `public.add_project_owner_member()`

No se revocan los helpers `is_project_member` y `has_project_role`, porque las políticas RLS existentes dependen de que `authenticated` pueda invocarlos.

### Verificación

La prueba preparada `supabase/tests/20261113000100_security_hardening.sql` usa `has_function_privilege` para comprobar que `anon` y `authenticated` no tengan `EXECUTE`. No fue ejecutada por ausencia de PostgreSQL/Supabase local.

Estado: corregido en código SQL local; efectividad pendiente de ejecución real.

## SEC-02 — Escalada de rol `owner`

### Antes

Las políticas históricas `project_members_insert_admins` y `project_members_update_admins` permitían al actor `owner` o `admin` gestionar membresías, pero no distinguían quién podía asignar `role = 'owner'`.

### Riesgo e impacto

Un administrador podía potencialmente crear o promover otra membresía a `owner`, elevando privilegios dentro del proyecto. La severidad es media si la propiedad debe quedar reservada a propietarios actuales.

### Corrección aplicada

La migración nueva recrea ambas políticas. `owner` sigue siendo válido para un actor `owner`, mientras que un `admin` conserva la gestión de roles no propietarios. La condición adicional exige `has_project_role(..., ['owner'])` cuando el nuevo rol es `owner`.

### Verificación

La prueba preparada intenta, bajo `request.jwt.claim.sub` de un administrador:

1. insertar una membresía con `role = 'owner'`;
2. promover una membresía existente a `owner`.

Ambas operaciones esperan SQLSTATE `42501`. Después cambia al propietario y verifica que la promoción legítima sí persiste. No fue ejecutada contra PostgreSQL real.

Estado: corregido en política SQL local; RLS efectivo pendiente de ejecución real.

## SEC-03 — Archivos de entorno

### Antes

`.gitignore` ignoraba `*.local`, pero no excluía de forma explícita `.env` y `.env.*`.

### Corrección aplicada

Se añadieron:

```gitignore
.env
.env.*
!.env.example
```

`.env.example` se conserva. La copia no contiene `.env.local` ni claves reales. `src/config/supabase.ts` continúa rechazando valores que contienen `service_role` antes de crear el cliente.

Estado: corregido y verificado estáticamente.

## SEC-04 — Autenticación, formularios y XSS

La inspección no justificó una corrección de código React:

- no existe `dangerouslySetInnerHTML` ni `innerHTML`;
- los datos de usuario se muestran mediante JSX y quedan sujetos al escape automático de React;
- las mutaciones de tareas obtienen `creator_id` desde `auth.getUser()`;
- el listener de Auth se desuscribe al desmontar;
- la sesión no se gestiona con almacenamiento manual de tokens.

El mensaje de error de autenticación puede incluir el `message` de Supabase. Se mantiene como hallazgo potencial/deferred porque no hay respuesta real del proveedor disponible; React lo renderiza como texto, no como HTML.

## Otros controles revisados

- Todas las tablas principales tienen RLS habilitado en la migración inicial.
- Las lecturas y mutaciones se acotan por `project_id` y membresía mediante políticas.
- La migración 003 protege campos de identidad y pertenencia con triggers.
- No se ejecutaron migraciones ni pruebas SQL remotas, por lo que no se afirma que el aislamiento haya sido validado en PostgreSQL real.

## Resultado antes/después

| Control | Antes | Después |
|---|---|---|
| Funciones trigger `SECURITY DEFINER` | Sin revocación explícita para usuarios | Revocadas para `public`, `anon`, `authenticated` |
| Helpers RLS | Invocables por `authenticated` | Se mantienen así por dependencia de políticas |
| Admin asignando `owner` | No restringido explícitamente | Requiere actor con rol `owner` |
| `.env` accidental en Git | Regla genérica incompleta | `.env` y `.env.*` excluidos, `.env.example` conservado |
| XSS | Sin sink peligroso encontrado | Sin cambio; no había corrección sustentada |
