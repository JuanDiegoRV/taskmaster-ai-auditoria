# TaskMaster AI — Preparación y validación de Supabase

## Alcance de esta auditoría

Esta guía prepara una instancia Supabase nueva para TaskMaster AI. No se creó ni se modificó ninguna instancia remota, no se ejecutaron migraciones remotas y no se incluyeron credenciales. La instancia de TaskMaster AI debe ser independiente de EcoTrack.

## Estado auditado

### Verificado en el repositorio

- Las migraciones están versionadas y deben aplicarse en este orden: `20261112000100_initial_schema.sql`, `20261112000200_enable_tasks_realtime.sql` y finalmente `20261112000300_protect_identity_fields.sql`.
- El esquema contiene `profiles`, `projects`, `project_members`, `tasks` y `comments`, con UUID, claves foráneas, restricciones, timestamps, índices y triggers.
- Los servicios usan las columnas reales de `tasks`: `project_id`, `title`, `description`, `status`, `priority`, `creator_id`, `assignee_id`, `created_at` y `updated_at`.
- Las consultas de proyectos y tareas dependen de RLS; los componentes no consultan tablas directamente.
- El cliente solo acepta `VITE_SUPABASE_URL` y una clave pública publishable; la clave `anon` solo es fallback legacy. Se rechaza una clave que contenga `service_role`.
- `.env.local` queda excluido por la regla `*.local` de `.gitignore`. No existe un `.env.local` en este repositorio auditado.
- Realtime está preparado localmente para `public.tasks` mediante la publicación `supabase_realtime` y `REPLICA IDENTITY FULL`.

### Auditoría RLS y funciones

- `profiles`: cada usuario puede leer/actualizar su perfil; la lectura de colaboradores requiere una membresía común.
- `projects`: solo miembros leen; solo el propietario o un administrador actualiza; el propietario elimina; la creación exige que `owner_id = auth.uid()`.
- `project_members`: los miembros leen; owner/admin gestionan membresías; un registro con rol `owner` no se elimina mediante esa política.
- `tasks`: los miembros leen; owner/admin/member crean, actualizan y eliminan; la creación exige que `creator_id = auth.uid()`.
- `comments`: los miembros leen y crean comentarios propios; autoría, owner y admin controlan actualización/eliminación según las políticas.
- `is_project_member` y `has_project_role` son `SECURITY DEFINER`, tienen `search_path = public`, califican sus tablas y fueron concedidas solo a `authenticated`; así se evita la recursión de las políticas de `project_members`.
- El trigger de alta crea el perfil y el trigger de proyecto crea la membresía owner. Su ejecución real aún no está comprobada.

### Riesgos y bloqueos encontrados

1. **Corregido localmente:** `20261112000300_protect_identity_fields.sql` añade triggers que impiden cambiar la identidad o pertenencia de tareas, comentarios, proyectos y membresías. La migración aún debe ejecutarse y probarse en una base real.
2. `projects_update_admins` ya queda cubierta por la protección de `owner_id`; una transferencia futura debe diseñarse como operación explícita.
3. La publicación Realtime, RLS y los eventos `DELETE` no han sido verificados contra PostgreSQL/Supabase real. `DELETE` puede depender de los valores anteriores y de la configuración de réplica/RLS; la aplicación debe mantener el refresco confirmado como fuente de consistencia.
4. La interfaz no crea proyectos ni asigna miembros. Para la primera demostración se requiere preparar esos datos desde el Dashboard/SQL Editor con los UUID de usuarios. Es una dependencia manual, no una funcionalidad inventada por la UI.
5. `.env.local` está excluido, pero `.env` no tiene una regla específica. No se deben guardar credenciales en `.env`; se recomienda una futura regla de hardening que mantenga únicamente `.env.example` versionado.

## Procedimiento manual para una persona sin experiencia

1. Entra en el Dashboard de Supabase y crea un proyecto nuevo llamado, por ejemplo, `taskmaster-ai-demo`. Usa una cuenta, proyecto y base de datos distintos de EcoTrack. Guarda la contraseña de base de datos fuera del repositorio.
2. Abre **Project Settings → API**. Copia únicamente el **Project URL** y la clave pública **Publishable key**. Si la interfaz del proyecto solo ofrece la clave legacy `anon`, puede usarse como fallback. Nunca copies `service_role` al frontend.
3. Abre **Authentication → Providers** y habilita Email. Para una demo académica desechable puedes deshabilitar temporalmente la confirmación de email; en otro caso crea usuarios con correos que puedas verificar. No documentes contraseñas reales.
4. En la raíz del proyecto copia `.env.example` como `.env.local` y completa las variables públicas. Si usas la clave legacy, deja vacía la publishable y completa `VITE_SUPABASE_ANON_KEY`. Reinicia `npm run dev` después de cambiar variables.
5. Aplica las migraciones en orden. La opción sencilla es abrir **SQL Editor**, ejecutar `20261112000100_initial_schema.sql`, luego `20261112000200_enable_tasks_realtime.sql` y finalmente `20261112000300_protect_identity_fields.sql`. Verifica dos veces que el Dashboard corresponde al proyecto nuevo. Alternativamente, con Supabase CLI vinculada explícitamente al proyecto nuevo, usa `supabase link --project-ref <ref-del-proyecto>` y `supabase db push`; nunca uses el ref de EcoTrack.
6. En **Authentication → Users**, crea dos usuarios de prueba, por ejemplo usuario A y usuario B. Conserva sus UUID; no los pegues en Git ni en esta guía.
7. Como todavía no existe una pantalla para crear proyectos y asignar miembros, usa SQL Editor con los UUID obtenidos:

   ```sql
   insert into public.projects (name, description, owner_id)
   values ('TaskMaster Demo', 'Proyecto de validación', '<UUID_USUARIO_A>')
   returning id;

   insert into public.project_members (project_id, user_id, role)
   values ('<UUID_PROYECTO_DEVUELTO>', '<UUID_USUARIO_B>', 'member');
   ```

   El trigger crea automáticamente la membresía `owner` de A; no insertes una segunda fila owner.
8. Arranca la app con `npm install` y `npm run dev`. Abre dos perfiles de navegador o una ventana normal y otra privada. Inicia sesión como A y B, selecciona el proyecto y comprueba que ambos ven únicamente el proyecto compartido.
9. Prueba el flujo: A crea una tarea, B observa el cambio sin recargar, B edita una tarea, A comprueba el cambio y A elimina una tarea con confirmación. Observa la consola y la interfaz si el canal pasa a `CHANNEL_ERROR` o `TIMED_OUT`; usa el refresco manual para recuperar consistencia.
10. Prueba aislamiento: crea otro proyecto solo para A, comprueba que B no lo ve y confirma que B no puede leer ni mutar tareas de un proyecto sin membresía. Repite con un usuario `viewer` para verificar que las mutaciones son rechazadas por RLS.
11. Elimina los usuarios y datos de demostración desde el Dashboard cuando finalice la práctica. No reutilices esta instancia para EcoTrack.

## Preflight antes de declarar la demo válida

- [ ] URL y clave pública pertenecen al proyecto TaskMaster AI, no a EcoTrack.
- [ ] Las dos migraciones se ejecutaron sin errores y en orden.
- [ ] Los triggers crearon perfil y membresía owner.
- [ ] Las pruebas negativas cross-project fueron rechazadas.
- [ ] CRUD autenticado funcionó con roles esperados.
- [ ] Dos sesiones observaron INSERT, UPDATE y DELETE sin recarga.
- [ ] El comportamiento de DELETE, RLS y reconexión fue observado en la instancia real.
- [ ] Se corrigieron los bloqueos de inmutabilidad antes de una evaluación de seguridad.
- [ ] La migración `20261112000300_protect_identity_fields.sql` se ejecutó sin errores.

## Referencias oficiales consultadas

- [API keys](https://supabase.com/docs/guides/getting-started/api-keys)
- [Password-based Auth](https://supabase.com/docs/guides/auth/passwords)
- [Postgres Changes](https://supabase.com/docs/guides/realtime/postgres-changes)
- [Database migrations](https://supabase.com/docs/guides/deployment/database-migrations)

## Resultado

La preparación local está documentada, pero la conexión, las migraciones, RLS, Realtime y la colaboración entre usuarios siguen sin validación real. No se ejecutó ninguna operación remota.
