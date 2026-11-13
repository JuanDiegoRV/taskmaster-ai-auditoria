# Progreso del proyecto

## Prompt 08 — Corrección de integridad y seguridad

### Implementado

- Se inspeccionaron las políticas `UPDATE` y los campos sensibles de las tablas relacionadas.
- Se creó `supabase/migrations/20261112000300_protect_identity_fields.sql`.
- Se protegieron con triggers los campos de identidad y pertenencia de `tasks`, `comments`, `projects` y `project_members`.
- Se añadieron pruebas SQL pgTAP en `supabase/tests/20261112000300_security_integrity.sql` para actualización legítima, intentos de reasignación y aislamiento cross-project.
- Se actualizó el orden de migraciones y la guía manual de Supabase.

### Probado

- `npm run build`: OK; Vite compiló 71 módulos.
- `npm run lint`: OK; `oxlint` sin errores.
- `npm run test`: OK; 8 archivos y 34 pruebas pasaron.
- Pruebas SQL: preparadas, pero no ejecutadas; no hay instancia Supabase local disponible y no se ejecutó SQL remoto.

### Pendiente/bloqueado

- Ejecutar la migración 003 en Supabase local o remoto autorizado.
- Ejecutar las pruebas pgTAP con PostgreSQL/Supabase disponible.
- Verificar RLS, Realtime y colaboración entre usuarios en una instancia real.
- La corrección queda detenida aquí; no se inicia Sprint 6.

## Auditoría de preparación Supabase — Prompt 07

### Implementado/documentado

- Se revisaron las dos migraciones SQL, tipos, cliente, servicios, hooks y componentes sin modificar las migraciones originales.
- Se creó `docs/SUPABASE_SETUP.md` con diagnóstico, pasos manuales, SQL con marcadores, preflight y referencias oficiales.
- Se documentaron permisos por entidad, funciones `SECURITY DEFINER`, triggers, publicación Realtime, limitaciones de DELETE y aislamiento por proyecto.
- Se confirmó que `.env.local` está cubierto por `*.local` y que no existen credenciales locales en el repositorio auditado.

### Hallazgos/bloqueos

- No se conectó Supabase ni se ejecutaron SQL o migraciones remotas.
- La política de actualización de tareas no impide modificar directamente `project_id`/`creator_id`; comentarios tienen una exposición equivalente para identidad/pertenencia. Se propone trigger de inmutabilidad o restricción por columna, sin implementarlo en este prompt.
- La UI requiere preparación manual de un proyecto y miembros para la primera demo.
- La validación entre usuarios y Realtime DELETE sigue pendiente.

### Comandos y resultados de esta auditoría

- Inspección estática de migraciones, documentación y variables: realizada; no equivale a ejecutar PostgreSQL.
- `npm run build`, `npm run lint` y `npm run test`: se ejecutan al cerrar este prompt y se registran en el resultado final.

### Estado

Auditoría local completada dentro de alcance. Se detiene el trabajo y no se inicia Sprint 6.

## Sprint 5 — Interfaz e integración

### Implementado

- Se creó flujo de autenticación con correo/contraseña y cierre de sesión.
- Se crearon auth.service.ts, projects.service.ts, useAuth.ts y useProjects.ts.
- Se crearon AuthForm, ProjectPicker y TaskBoard.
- La interfaz permite consultar proyectos autorizados, seleccionar proyecto, crear, editar y eliminar tareas con confirmación.
- Se muestran estados de carga, error, vacío y configuración pendiente.
- Se mantiene useTasks como único consumidor de Realtime.
- La interfaz es responsive y usa controles accesibles sin librería visual adicional.
- Se añadieron pruebas de componentes para tareas, proyectos, autenticación e integración de App.

### Probado

- npm run build: OK.
- npm run lint: OK, sin advertencias.
- npm run test: OK; 8 archivos y 34 pruebas pasaron.
- Se verificaron renderizado, selección, formularios, eliminación, estados, aislamiento visual y consumo de useTasks.

### Pendiente

- Configurar .env.local con un proyecto Supabase real.
- Ejecutar migraciones y validar RLS en una base real.
- Probar sincronización entre dos sesiones de navegador autenticadas.
- Verificar comportamiento Realtime entre usuarios y DELETE bajo réplica real.
- Memoria técnica final del Sprint 6.

### Bloqueos y riesgos

- No hay credenciales ni instancia Supabase configuradas; no se afirma persistencia real.
- La interfaz no puede demostrar colaboración multiusuario hasta conectar Supabase y aplicar migraciones.

### Resultado

Sprint 5 implementado y validado con mocks. No se inicia Sprint 6 automáticamente.

## Sprint 4 — Supabase Realtime

### Implementado

- `useTasks` crea un canal `tasks:<projectId>` mediante `useEffect`.
- Se registran listeners `postgres_changes` separados para `INSERT`, `UPDATE` y `DELETE` en `public.tasks`.
- Cada listener usa filtro `project_id=eq.<projectId>`.
- Los eventos disparan refrescos confirmados desde el servidor, no mutaciones directas del payload.
- Se serializan refrescos Realtime y se conserva una sincronización pendiente para eventos consecutivos.
- Se manejan `SUBSCRIBED`, `CHANNEL_ERROR` y `TIMED_OUT` sin presentar actividad antes de confirmación.
- El cleanup ejecuta `supabase.removeChannel(channel)` y evita canales duplicados al cambiar de proyecto, desmontar o usar Strict Mode.
- Se creó `supabase/migrations/20261112000200_enable_tasks_realtime.sql` para publicación local y `REPLICA IDENTITY FULL`.
- Se añadieron 7 pruebas Realtime simuladas y se conservaron las pruebas anteriores.

### Probado

- `npm run build`: OK.
- `npm run lint`: OK.
- `npm run test`: OK; 4 archivos y 24 pruebas pasaron.
- Pruebas aisladas Realtime: OK; 1 archivo y 7 pruebas pasaron.

### Pendiente

- Validar publicación y RLS en Supabase real.
- Confirmar sincronización entre usuarios.
- Confirmar comportamiento DELETE bajo réplica/RLS real.
- Interfaz definitiva.

### Bloqueos

- No hay variables `.env.local`, instancia Supabase ni migraciones remotas ejecutadas.
- La sincronización real entre usuarios no puede afirmarse con mocks.

### Resultado

Sprint 4 implementado a nivel local y listo para validación final del repositorio. No se inicia Sprint 5 automáticamente.

## Sprint 3 — Custom Hook `useTasks`

### Implementado

- Se creó `src/hooks/useTasks.ts` con `data`, `loading`, `error`, `createTask`, `updateTask`, `deleteTask` y `refreshTasks`.
- La carga inicial depende de `projectId` y delega en `getTasksByProject`.
- Las mutaciones usan los servicios de Sprint 2 y refrescan desde el servidor después de confirmar la operación.
- `createTask` recibe campos sin `project_id` y usa el proyecto del hook.
- Se agregó contador de solicitudes para descartar respuestas fuera de orden.
- Se agregó control de montaje para evitar actualizaciones después de desmontar.
- Se crearon pruebas de hook con `@testing-library/react`, `jsdom` y Vitest.

### Probado

- `npm run build`: OK.
- `npm run lint`: OK, sin advertencias.
- `npm run test`: OK; 3 archivos y 17 pruebas pasaron.
- Se verificaron carga inicial, lista vacía, errores, CRUD, cambio de proyecto, respuestas fuera de orden, desmontaje y recuperación.

### Pendiente

- Integración Supabase Realtime y cleanup de canales.
- Interfaz definitiva y componente consumidor.
- Validación SQL/RLS en una base real.
- Pruebas de colaboración entre usuarios.

### Resultado

Sprint 3 completado dentro de su alcance. No se inicia Sprint 4 automáticamente.

## Sprint 2 — Cliente y servicios

### Implementado

- Se creó `src/config/supabase.ts` con cliente lazy, variables Vite y `SupabaseConfigurationError`.
- Se prioriza `VITE_SUPABASE_PUBLISHABLE_KEY` y se admite `VITE_SUPABASE_ANON_KEY` como fallback legacy documentado.
- Se rechaza explícitamente cualquier valor que contenga `service_role`.
- Se creó `src/services/tasks.service.ts` con `getTasksByProject`, `createTask`, `updateTask` y `deleteTask`.
- `createTask` deriva `creator_id` desde `auth.getUser()`, no desde un `user_id` arbitrario.
- Se añadió `TaskServiceError`, conservando causa y operación para no silenciar RLS.
- Se añadieron 9 pruebas Vitest con cliente Supabase simulado.
- Se añadió el script `npm run test` y la dependencia de desarrollo `vitest`.

### Probado

- `npm run build`: OK; TypeScript y Vite generaron `dist/` correctamente.
- `npm run lint`: OK; `oxlint` terminó sin errores.
- `npm run test`: OK; 2 archivos y 9 pruebas pasaron.
- Se verificó filtrado por `project_id`, inserción, actualización, eliminación, errores, ausencia de sesión y configuración insegura.

### Pendiente

- `useTasks`, CRUD visual y Realtime.
- Validación real del cliente contra Supabase.
- Ejecución de migraciones y pruebas RLS contra instancia local.

### Bloqueos

- No hay variables `.env.local` configuradas.
- No existe Supabase CLI/instancia local; no se ejecutaron migraciones remotas ni se inventaron credenciales.

### Resultado

Sprint 2 completado dentro de su alcance. No se inicia Sprint 3 automáticamente.

## Sprint 0 — Inicialización, arquitectura y documentación

### Implementado

- Se verificó que `SWNT/taskmaster-ai` no existía y se creó como proyecto independiente.
- Se generó Vite + React + TypeScript y se instaló `@supabase/supabase-js`.
- Se creó la estructura modular y `docs/`.
- Se documentaron plan, arquitectura, rúbrica y bitácora.
- Se dejó un shell visual mínimo, sin lógica de backend.

### Probado

- `npm run build`: OK; TypeScript y Vite generaron `dist/` correctamente.
- `npm run lint`: OK; `oxlint` terminó sin errores.

### Pendiente

- Modelo de datos, relaciones y RLS.
- Cliente Supabase con variables verificadas.
- Servicios, tipos, `useTasks`, CRUD y Realtime.
- Pruebas automatizadas y memoria técnica.

### Bloqueos

- Ninguno para Sprint 0.
- La conexión Supabase no está configurada ni verificada; se requiere un proyecto y credenciales públicas para Sprint 2.

### Decisiones

- Mantener dependencia mínima: no se añaden estado global, routing o testing todavía.
- Usar `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`; excluir `service_role` del frontend.

## Resultado

Sprint 0 listo para revisión y autorización. No se inicia Sprint 1 automáticamente.

## Sprint 1 — Modelo de datos y seguridad

### Implementado

- Se creó `supabase/migrations/20261112000100_initial_schema.sql` sin ejecutarlo.
- Se modelaron `profiles`, `projects`, `project_members`, `tasks` y `comments`.
- Se añadieron enums, UUID, FK, restricciones de longitud/valores, timestamps, índices y triggers de actualización.
- Se añadió trigger de perfil para usuarios nuevos de Auth y trigger de membresía owner.
- Se añadieron funciones RLS `SECURITY DEFINER` con `search_path` fijo para evitar recursión.
- Se añadieron políticas RLS para membresía, roles, tareas y comentarios.
- Se crearon contratos TypeScript en `src/types/database.ts` y exportación desde `src/types/index.ts`.

### Probado

- `npm run build`: OK; TypeScript y Vite generaron `dist/` correctamente.
- `npm run lint`: OK; `oxlint` terminó sin errores.
- Pruebas automatizadas: no hay script `test` configurado y no existe Supabase local para pruebas SQL.
- Inspección estática de la migración: realizada; no equivale a ejecutar PostgreSQL.

### Pendiente

- Ejecutar la migración en una instancia Supabase local.
- Añadir pruebas automatizadas de RLS/restricciones cuando exista Supabase CLI/entorno local.
- Cliente Supabase, servicios, `useTasks`, CRUD frontend y Realtime.

### Bloqueos

- `supabase` CLI no está instalada y no existe una instancia local disponible.
- No se ejecutaron migraciones remotas ni se verificaron credenciales.

### Resultado

Sprint 1 implementado a nivel de artefactos locales y documentación. La validación de ejecución queda bloqueada por la ausencia de entorno Supabase local. No se inicia Sprint 2 automáticamente.
