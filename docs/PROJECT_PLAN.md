# TaskMaster AI — Plan de proyecto

## Sprint 2 — Cliente y capa de servicios

### Objetivo

Conectar de forma segura la aplicación con Supabase mediante una configuración reusable y servicios tipados, sin implementar aún hooks, Realtime ni UI de tareas.

### Estado

- [x] Cliente lazy en `src/config/supabase.ts`.
- [x] Clave publishable preferida y fallback anon legacy documentado.
- [x] Servicios tipados en `src/services/tasks.service.ts`.
- [x] Pruebas con cliente Supabase simulado.
- [x] Script `npm run test`.
- [ ] Validación contra instancia Supabase local/remota.

## Sprint 3 — Custom Hook `useTasks`

### Estado

- [x] Lectura inicial filtrada por proyecto.
- [x] Estados `data`, `loading` y `error`.
- [x] Mutaciones delegadas a servicios y refresco confirmado.
- [x] Protección contra carreras, cambios de proyecto y desmontaje.
- [x] Pruebas automatizadas del hook con servicios simulados.
- [ ] Realtime, cleanup de canales, UI definitiva y validación SQL/RLS real.

## Sprint 4 — Supabase Realtime

### Estado

- [x] Listeners `postgres_changes` para INSERT, UPDATE y DELETE.
- [x] Filtro por `project_id` y refresco confirmado desde servidor.
- [x] Coalescencia de eventos y protección contra respuestas antiguas.
- [x] Limpieza con `supabase.removeChannel(channel)`.
- [x] Manejo de `SUBSCRIBED`, `CHANNEL_ERROR` y `TIMED_OUT`.
- [x] Migración local de publicación y `REPLICA IDENTITY FULL`.
- [ ] Validación real, pruebas entre usuarios e interfaz definitiva.

## Sprint 5 — Interfaz e integración

### Estado

- [x] Inicio/cierre de sesión con Auth.
- [x] Consulta y selección de proyectos.
- [x] TaskBoard consumidor de useTasks.
- [x] Crear, editar y eliminar con estados visuales.
- [x] Responsive, accesible y sin librería visual innecesaria.
- [x] Pruebas de componentes e integración.
- [ ] Configuración Supabase real, dos sesiones, RLS real y memoria técnica.

## Objetivo

Construir una plataforma colaborativa de gestión de proyectos y tareas con React, TypeScript estricto, Supabase PostgreSQL y sincronización Realtime.

## Backlog y sprints

| Sprint | Objetivo | Entregables | Criterio de aceptación |
|---|---|---|---|
| 0 | Inicialización y arquitectura | Proyecto Vite, estructura modular, documentación | La app compila y la documentación queda registrada |
| 1 | Modelo de datos y seguridad | Tablas, relaciones y políticas RLS | El esquema cubre proyectos, tareas, usuarios y comentarios |
| 2 | Cliente y capa de datos | Cliente Supabase, servicios y tipos | Configuración pública y tipos coherentes |
| 3 | Hook y mutaciones | `useTasks(projectId)` y CRUD | Consulta filtrada y estados `data`, `loading`, `error` |
| 4 | Tiempo real | `postgres_changes` y cleanup | Cambios remotos actualizan la UI y se limpian canales |
| 5 | Interfaz y pruebas | Componentes funcionales e integración | Flujo principal usable y pruebas ejecutables |
| 6 | Auditoría y entrega | Checklist, memoria técnica y evidencias | Cada requisito tiene evidencia verificable |

## Criterios transversales

## Auditoría Prompt 07 — Preparación de Supabase real

### Criterios de aceptación

- [x] Migraciones, servicios, hooks, tipos y componentes revisados estáticamente.
- [x] RLS, helpers `SECURITY DEFINER`, triggers y Realtime documentados.
- [x] `.env.example` y exclusión de `.env.local` comprobados.
- [x] Guía manual creada en `docs/SUPABASE_SETUP.md`.
- [ ] Validación real de SQL/RLS/Realtime y prueba entre dos usuarios.
- [ ] Corrección de los bloqueos de inmutabilidad detectados, fuera del alcance de esta auditoría.

## Criterios transversales — reglas

- No usar `service_role` en el frontend.
- Separar interfaz, hooks, servicios y tipos.
- Documentar implementado, probado, pendiente y bloqueado.
- No avanzar de sprint sin autorización explícita.

## Sprint 0 — criterios de aceptación

- [x] Proyecto independiente `taskmaster-ai` creado con React, Vite y TypeScript.
- [x] Dependencias base instaladas.
- [x] Carpetas modulares y `docs/` creadas.
- [x] README y documentos académicos iniciales creados.
- [x] Prompt 01 registrado íntegramente.
- [x] Build y lint ejecutados y documentados.
- [ ] Backend, CRUD, Realtime, RLS y pruebas funcionales: reservados para otros sprints.

## Sprint 1 — Modelo de datos y seguridad

### Objetivo

Diseñar el esquema relacional local de PostgreSQL y sus políticas RLS sin ejecutar cambios remotos.

### Implementación

- [x] Migración `supabase/migrations/20261112000100_initial_schema.sql`.
- [x] Entidades `profiles`, `projects`, `project_members`, `tasks` y `comments`.
- [x] UUID, FKs, restricciones, índices, timestamps y triggers.
- [x] Funciones auxiliares RLS sin recursión.
- [x] Tipos TypeScript en `src/types/database.ts`.

### Pruebas y resultado

- [x] Build y lint ejecutados.
- [x] Inspección estática de migración y consistencia de tipos realizada.
- [ ] Migración/RLS en Supabase local: no disponible, CLI no instalada.

### Criterios de aceptación

- [x] Migración versionada y documentada.
- [x] Permisos por entidad explicados.
- [x] Contratos TypeScript coherentes con SQL.
- [ ] Prueba de ejecución real contra PostgreSQL/Supabase local.
