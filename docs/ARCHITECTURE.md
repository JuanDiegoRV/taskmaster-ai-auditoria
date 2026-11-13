# Arquitectura propuesta

## Auditoría de preparación Supabase — Prompt 07

- La coherencia estática entre migraciones, tipos, servicios, hooks y componentes fue revisada; las columnas de `tasks` coinciden con los contratos consumidos.
- La seguridad efectiva depende de ejecutar las migraciones en una instancia real. No se inventa conexión ni resultado RLS.
- Los helpers `SECURITY DEFINER` reducen la recursión RLS, pero se recomienda restringir también las funciones de trigger a ejecución interna en una migración de hardening futura.
- Bloqueo de seguridad: la política de actualización de `tasks` no hace inmutables `project_id` y `creator_id`; comentarios tienen un riesgo equivalente para `author_id` y pertenencia. La UI/servicio lo evita, pero la base debe defenderse por sí misma.
- La migración Realtime prepara `public.tasks`; la publicación, RLS, eventos DELETE y reconexión requieren prueba en Supabase real.

## Integridad de identidad — Prompt 08

La migración `20261112000300_protect_identity_fields.sql` añade triggers `BEFORE UPDATE` que rechazan con SQLSTATE `42501` cambios en:

- `tasks`: `id`, `project_id`, `creator_id` y `created_at`.
- `comments`: `id`, `task_id`, `project_id`, `author_id` y `created_at`.
- `projects`: `id`, `owner_id` y `created_at`.
- `project_members`: `project_id`, `user_id` y `created_at`; el `role` sigue siendo editable por las políticas existentes.

Los cambios legítimos de título, descripción, estado, prioridad, asignación, cuerpo y timestamps `updated_at` continúan permitidos. La protección no sustituye RLS: primero se verifica membresía/rol y después el trigger protege la integridad de la fila.

## Interfaz e integración — Sprint 5

Flujo: App → useAuth → auth.service → Supabase Auth.
Flujo: App → useProjects → projects.service → projects + RLS.
Flujo: ProjectPicker + TaskBoard → useTasks(projectId) → tasks.service → tasks + Realtime.

- App coordina sesión, aislamiento de usuario y proyecto seleccionado.
- AuthForm solo presenta credenciales y delega el inicio de sesión.
- ProjectPicker presenta proyectos autorizados por RLS y emite selección.
- TaskBoard consume useTasks; no consulta tablas ni crea canales Realtime.
- useAuth limpia el listener de Auth al desmontar.
- useProjects evita mostrar datos de un usuario anterior mediante propietario de datos y contador de solicitudes.
- Al cerrar sesión, el tablero se desmonta y useTasks elimina su canal Realtime.
- La configuración ausente se muestra como error controlado; no se muestran datos ficticios como persistidos.

## Realtime — Sprint 4

`useTasks(projectId)` crea un canal único `tasks:<projectId>` dentro de un `useEffect`. El canal registra tres listeners `postgres_changes` para `INSERT`, `UPDATE` y `DELETE` sobre `public.tasks`, cada uno con `filter: project_id=eq.<projectId>`.

El callback no inserta directamente el payload en memoria: solicita un refresco confirmado mediante `getTasksByProject`. Las solicitudes Realtime se serializan; si llegan eventos durante un refresco, se marca una sincronización pendiente y se ejecuta una nueva al finalizar. El contador de solicitudes existente evita que respuestas antiguas sobrescriban datos actuales.

La limpieza marca el efecto como dispuesto y ejecuta `supabase.removeChannel(channel)`. Esto elimina el canal anterior al cambiar de proyecto, al desmontar y durante los ciclos de React Strict Mode.

El estado público continúa siendo `data`, `loading` y `error`. Los estados `SUBSCRIBED`, `CHANNEL_ERROR` y `TIMED_OUT` se mantienen internamente; los dos últimos se exponen como error y una reconexión confirmada dispara un nuevo refresco.

La migración `20261112000200_enable_tasks_realtime.sql` prepara la publicación `supabase_realtime` y `REPLICA IDENTITY FULL` de forma local. DELETE puede tener limitaciones de filtros porque depende de la réplica y de los valores anteriores; RLS y la disponibilidad de la publicación deben validarse en Supabase real.

## Hook `useTasks` — Sprint 3

`src/hooks/useTasks.ts` coordina el estado de tareas sin conocer detalles de Supabase. Expone `data`, `loading`, `error`, `createTask`, `updateTask`, `deleteTask` y `refreshTasks`.

- La carga inicial y las recargas delegan en `tasks.service.ts`.
- `createTask` añade el `project_id` del hook; la identidad del creador continúa siendo responsabilidad del servicio/Auth.
- Después de cada mutación se ejecuta un refresco confirmado desde el servidor.
- Un contador de solicitudes descarta respuestas antiguas cuando cambia `projectId` o se solapan recargas.
- Un ref de montaje evita actualizar estado después de desmontar.
- La limpieza de canales Realtime queda reservada para Sprint 4.

## Servicios — Sprint 2

`src/config/supabase.ts` centraliza `VITE_SUPABASE_URL` y `VITE_SUPABASE_PUBLISHABLE_KEY`, con fallback documentado a `VITE_SUPABASE_ANON_KEY`. La creación del cliente es lazy: si faltan variables o se detecta `service_role`, se lanza `SupabaseConfigurationError` y no se finge una conexión.

`src/services/tasks.service.ts` no contiene JSX ni estado React. Expone `getTasksByProject(projectId)`, `createTask(input)`, `updateTask(taskId, changes)` y `deleteTask(taskId)`. Las lecturas filtran por `project_id`; `createTask` obtiene `creator_id` desde `auth.getUser()`; y los cambios no incluyen campos de identidad o pertenencia.

Los errores de Supabase se envuelven en `TaskServiceError`, conservando `cause` y `operation`, incluidos errores RLS.

```text
Componentes React
        ↓
Hooks de caso de uso (useTasks)
        ↓
Servicios de dominio/datos
        ↓
Cliente y configuración Supabase
        ↓
PostgreSQL + RLS + Realtime
```

## Responsabilidades

- `src/components/`: renderizado, eventos y composición; sin consultas ni credenciales.
- `src/hooks/`: estado `data`, `loading`, `error`, ciclo de vida y coordinación con servicios.
- `src/services/`: consultas y mutaciones encapsuladas; única capa que conocerá detalles de Supabase.
- `src/types/`: contratos TypeScript para proyectos, tareas, usuarios, comentarios y respuestas.
- `src/config/`: lectura validada de variables `VITE_*` y creación del cliente público en Sprint 2.
- `src/test/`: pruebas unitarias, de hooks e integración desde Sprint 5.
- `docs/`: trazabilidad académica y decisiones.

## Flujo previsto de tareas

`TaskList` → `useTasks(projectId)` → `taskService` → `supabase.from('tasks')`.

El hook cargará datos y, en Sprint 4, se suscribirá a `postgres_changes`; el cleanup vivirá en el retorno de `useEffect`. La política RLS será la frontera de seguridad real, no la UI.

## Decisiones de Sprint 0

1. Vite + React + TypeScript estricto para feedback rápido y tipado estático.
2. Supabase se incorpora como dependencia, pero no se inicializa sin URL/anon key verificadas.
3. No se añaden librerías de estado, routing o testing hasta que un sprint las justifique.
4. Se mantienen capas separadas para poder probar el hook con servicios mockeados.

## Modelo de datos — Sprint 1

```text
auth.users 1──1 profiles
profiles 1──N projects (owner_id)
projects N──N profiles (project_members.role)
projects 1──N tasks
profiles 1──N tasks (creator_id / assignee_id)
tasks 1──N comments
profiles 1──N comments (author_id)
```

- `profiles` extiende la identidad de `auth.users` mediante FK y trigger de alta.
- `projects` representa el espacio colaborativo; su creador recibe automáticamente rol `owner`.
- `project_members` resuelve la relación N:M y limita roles a `owner`, `admin`, `member` y `viewer`.
- `tasks` conserva proyecto, creador y asignado, con estados y prioridades definidos por enums SQL.
- `comments` guarda `project_id` además de `task_id`; una FK compuesta garantiza que ambos pertenezcan al mismo proyecto.

## Seguridad RLS

Todas las tablas habilitan RLS. `is_project_member(project_id)` y `has_project_role(project_id, roles)` son funciones `SECURITY DEFINER`, con `search_path` fijo y objetos calificados. Consultan `project_members` sin volver a evaluar sus propias políticas, evitando recursión.

- Miembros: lectura de proyectos, miembros, tareas y comentarios de su proyecto.
- Owners/admins: gestión de proyectos y membresías; el owner es el único que elimina el proyecto.
- Owners/admins/members: crear, actualizar y eliminar tareas; viewers solo consultan.
- Autores: crean y gestionan sus comentarios; owners/admins también pueden moderarlos.
- Las políticas no conceden acceso cross-project sin membresía.
