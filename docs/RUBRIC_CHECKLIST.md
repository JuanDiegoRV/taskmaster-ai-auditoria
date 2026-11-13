# Checklist de rúbrica

## Actualización Sprint 2

- Cliente Supabase reusable: implementado en `src/config/supabase.ts`.
- Servicios CRUD de tareas: implementados en `src/services/tasks.service.ts`.
- Configuración ausente/service_role: errores controlados y probados.
- Cliente simulado y pruebas de lectura, inserción, actualización, eliminación, filtrado y errores: implementados en `src/test/`.
- SQL/RLS real: continúa pendiente por ausencia de instancia local; no se afirma conexión.

## Actualización Sprint 3

- `useTasks(projectId)`: implementado en `src/hooks/useTasks.ts`.
- Estados `data`, `loading`, `error`: implementados y probados.
- CRUD del hook: delegado a servicios existentes y probado con refresco confirmado.
- Carreras, cambio de `projectId`, desmontaje y recuperación de errores: cubiertos por `src/test/useTasks.test.tsx`.
- Realtime y cleanup de canales: pendientes para Sprint 4.

## Actualización Sprint 4

- `postgres_changes`: implementado en `src/hooks/useTasks.ts` para INSERT, UPDATE y DELETE.
- Sincronización: refresco confirmado, coalescencia y protección contra carreras implementados.
- Limpieza: `supabase.removeChannel(channel)` en cleanup de `useEffect`.
- Conexión: estados `SUBSCRIBED`, `CHANNEL_ERROR` y `TIMED_OUT` gestionados.
- Publicación: migración local `supabase/migrations/20261112000200_enable_tasks_realtime.sql`.
- Evidencia: 7 pruebas Realtime simuladas; sincronización entre usuarios y Supabase real pendientes.

## Actualización Sprint 5

- Autenticación: AuthForm, useAuth y auth.service.ts implementados.
- Proyectos: ProjectPicker, useProjects y projects.service.ts implementados.
- Consumidor de useTasks: TaskBoard implementado sin consultas directas.
- Crear/editar/eliminar tareas: controles visibles con confirmación de eliminación.
- Estados de UI: carga, error, vacío y configuración faltante cubiertos.
- Aislamiento de sesión/proyecto: probado con desmontaje visual y cambio de usuario simulado.
- Responsive/accesibilidad: estilos responsive, labels, roles y aria-live.
- Validación real Supabase/SQL/RLS y colaboración multiusuario: pendientes.

| Requisito | Evidencia prevista | Estado Sprint 0 |

## Auditoría Prompt 07 — preparación de Supabase real

## Prompt 08 — corrección de integridad y seguridad

- Migración adicional: implementada en `supabase/migrations/20261112000300_protect_identity_fields.sql`.
- Tareas: `id`, `project_id`, `creator_id` y `created_at` son inmutables mediante trigger.
- Comentarios: `id`, `task_id`, `project_id`, `author_id` y `created_at` son inmutables mediante trigger.
- Proyectos y membresías: propietario e identificadores de pertenencia son inmutables; el rol continúa sujeto a RLS.
- Operaciones legítimas: cambios de contenido, estado, prioridad, asignación y `updated_at` permanecen permitidos.
- Pruebas SQL: preparadas en `supabase/tests/20261112000300_security_integrity.sql`; no ejecutadas por ausencia de instancia local.
- RLS existente: no se debilitó ni se modificaron migraciones anteriores.
- Validación real: pendiente para SQL, RLS, Realtime y dos usuarios.

- Esquema y dependencias: revisados en `supabase/migrations/20261112000100_initial_schema.sql` y `20261112000200_enable_tasks_realtime.sql`.
- Coherencia con frontend: revisada; servicios y hooks usan `project_id` y los campos reales de `tasks`.
- RLS por entidad: documentada en `docs/SUPABASE_SETUP.md`; ejecución real pendiente.
- Recursión RLS: mitigada con helpers `SECURITY DEFINER`, `search_path` fijo y acceso restringido; validación PostgreSQL pendiente.
- Realtime: publicación local y `REPLICA IDENTITY FULL` preparados; publicación, RLS, DELETE y colaboración multiusuario pendientes de instancia real.
- Variables: `.env.example` contiene URL y clave pública; `.env.local` está excluido por `*.local`; no se validaron credenciales reales.
- Hallazgo de seguridad: falta inmutabilidad de `tasks.project_id/creator_id` y de identidad/pertenencia de comentarios frente a clientes directos. Requiere migración de hardening antes de declarar seguridad completa.
- Demostración: requiere crear manualmente un proyecto y asignar un miembro porque esa pantalla aún no existe.
|---|---|---|
| React + TypeScript | `package.json`, `src/`, `tsconfig*.json` | Implementado y probado con build |
| Supabase PostgreSQL | `@supabase/supabase-js` y arquitectura | Dependencia instalada; conexión pendiente |
| Proyectos, tareas, usuarios, comentarios | Tipos y migración del Sprint 1 | Pendiente |
| `useTasks(projectId)` | `src/hooks/useTasks.ts` en Sprint 3 | Pendiente |
| CRUD de tareas | `src/services/taskService.ts` en Sprint 3 | Pendiente |
| `data`, `loading`, `error` | Contrato del hook en Sprint 3 | Pendiente |
| Realtime / `postgres_changes` | Hook y cleanup en Sprint 4 | Pendiente |
| Políticas RLS | Migraciones y pruebas del Sprint 1 | Pendiente |
| Separación por capas | Carpetas `components`, `hooks`, `services`, `types`, `config` | Implementado como estructura |
| Componente consumidor | `TaskList` en Sprint 5 | Pendiente |
| Memoria técnica ~300 palabras | Documento final en Sprint 6 | Pendiente |

`Implementado` significa que existe en el repositorio. `Probado` requiere un comando ejecutado y resultado observable. `Pendiente` está planificado pero no desarrollado. `Bloqueado` requiere una dependencia o decisión externa.

## Actualización Sprint 1

- Modelo relacional: implementado en `supabase/migrations/20261112000100_initial_schema.sql`.
- Tipos TypeScript: implementados en `src/types/database.ts`.
- RLS y funciones auxiliares: implementadas y documentadas; ejecución real pendiente.
- Pruebas SQL automatizadas: bloqueadas hasta disponer de Supabase local.
