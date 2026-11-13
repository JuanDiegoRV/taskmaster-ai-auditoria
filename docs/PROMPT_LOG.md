# Registro cronológico de prompts

## Prompt 07 — Preparación de Supabase real

### Texto íntegro recibido

# TaskMaster AI — Prompt 07: Preparación de Supabase real

Trabaja exclusivamente en:

C:\Users\strik\OneDrive\Documentos\SWNT\taskmaster-ai

Actúa como arquitecto de software y auditor de seguridad de Supabase.

## Objetivo

Preparar la integración y validación real de TaskMaster AI con Supabase, sin ejecutar todavía cambios en ninguna base remota.

## Actividades

1. Revisa las migraciones SQL existentes y comprueba su coherencia con los servicios, hooks y componentes React.
2. Audita las políticas RLS de `profiles`, `projects`, `project_members`, `tasks` y `comments`.
3. Comprueba que los usuarios autenticados puedan realizar las operaciones necesarias sin obtener acceso a proyectos ajenos.
4. Revisa los triggers, las funciones `SECURITY DEFINER` y las posibles dependencias circulares de RLS.
5. Verifica la configuración de Supabase Realtime para `public.tasks`, incluyendo sus limitaciones con eventos DELETE y RLS.
6. Comprueba que `.env.example` tenga las variables correctas y que `.env.local` esté excluido de Git.
7. Prepara una guía paso a paso para:
   - Crear un proyecto Supabase nuevo e independiente de EcoTrack.
   - Obtener URL y clave pública.
   - Configurar Email/Password.
   - Aplicar las migraciones en orden.
   - Crear dos usuarios de prueba.
   - Crear un proyecto y asignar miembros.
   - Verificar CRUD y Realtime en dos navegadores.
8. Si falta una funcionalidad indispensable para realizar la demostración, identifícala y propón el cambio mínimo. No la implementes todavía.

## Restricciones

- No reutilices el proyecto Supabase de EcoTrack.
- No ejecutes SQL remoto.
- No solicites ni imprimas claves secretas.
- No utilices `service_role` en el navegador.
- No modifiques las migraciones originales sin justificarlo.
- No avances al Sprint 6.
- No hagas commit ni push.

## Documentación

Crea `docs/SUPABASE_SETUP.md` con las instrucciones verificadas y los pasos manuales.

Actualiza:

- `docs/PROMPT_LOG.md` con el prompt completo.
- `docs/PROGRESS.md` con el estado actual y bloqueos.
- `docs/RUBRIC_CHECKLIST.md` con lo que falta comprobar.

## Validación

Ejecuta build, lint y tests. Reporta los resultados exactos.

## Entrega

Presenta un diagnóstico de seguridad, posibles bloqueos, archivos modificados y una secuencia numerada de acciones manuales que pueda seguir una persona sin experiencia en Supabase.

Detente al finalizar esta auditoría. No conectes ni modifiques ningún proyecto remoto.

### Propósito

Auditar la preparación local para una instancia Supabase independiente y dejar documentada la secuencia manual de validación, sin cambios remotos.

### Archivos modificados o creados

- `docs/SUPABASE_SETUP.md`
- `docs/PROMPT_LOG.md`
- `docs/PROGRESS.md`
- `docs/ARCHITECTURE.md`
- `docs/PROJECT_PLAN.md`
- `docs/RUBRIC_CHECKLIST.md`

### Resultado y problemas encontrados

La auditoría estática se completó. La seguridad RLS y Realtime real siguen sin validarse porque no existe una instancia conectada. Se detectó como bloqueo de hardening que las políticas de actualización no hacen inmutables algunos campos de identidad y pertenencia; se propuso el cambio mínimo, sin implementarlo. No se conectó ni modificó ningún proyecto remoto.

## Prompt 08 — Corrección de integridad y seguridad

### Texto íntegro recibido

# TaskMaster AI — Prompt 08: Corrección de integridad y seguridad

Trabaja exclusivamente en:

C:\Users\strik\OneDrive\Documentos\SWNT\taskmaster-ai

## Objetivo

Corregir el riesgo de modificación de campos sensibles identificado durante la auditoría de Supabase, antes de aplicar las migraciones a una base real.

## Actividades

1. Inspecciona las migraciones SQL existentes y verifica exactamente qué campos pueden modificarse mediante las políticas actuales.
2. Diseña una migración SQL adicional que impida modificar campos de identidad y pertenencia que deban permanecer inmutables, especialmente `project_id` y `creator_id` en tareas, y los campos equivalentes en comentarios.
3. Utiliza restricciones o triggers apropiados sin romper las operaciones legítimas de creación, actualización y eliminación.
4. Revisa que los permisos RLS existentes continúen respetando los roles de cada proyecto.
5. Añade pruebas SQL de seguridad que comprueben:
   - Actualización legítima de una tarea.
   - Intento de cambiar su `project_id`.
   - Intento de cambiar su `creator_id`.
   - Intentos equivalentes sobre comentarios.
   - Ausencia de acceso a proyectos ajenos.
6. No debilites las políticas RLS para facilitar las pruebas.
7. No modifiques migraciones anteriores salvo que exista una justificación técnica indispensable.

## Restricciones

- No ejecutes SQL remoto.
- No utilices claves `service_role` en frontend.
- No modifiques otros repositorios.
- No hagas commit ni push.
- No avances al Sprint 6.

## Validación

Ejecuta build, lint y pruebas disponibles. Distingue las pruebas SQL preparadas de las realmente ejecutadas.

## Documentación

Actualiza `docs/PROMPT_LOG.md`, `docs/PROGRESS.md`, `docs/ARCHITECTURE.md`, `docs/RUBRIC_CHECKLIST.md` y `docs/SUPABASE_SETUP.md`.

Registra este prompt íntegramente y añade la nueva migración al orden de ejecución.

## Entrega

Informa los campos protegidos, archivos creados, pruebas ejecutadas y pasos pendientes.

Detente al finalizar.

### Propósito

Cerrar el riesgo de integridad de identidad y pertenencia con una migración adicional y pruebas SQL preparadas, sin ejecutar cambios remotos.

### Archivos creados o modificados

- `supabase/migrations/20261112000300_protect_identity_fields.sql`
- `supabase/tests/20261112000300_security_integrity.sql`
- `docs/PROMPT_LOG.md`
- `docs/PROGRESS.md`
- `docs/ARCHITECTURE.md`
- `docs/RUBRIC_CHECKLIST.md`
- `docs/SUPABASE_SETUP.md`

### Resultado y problemas encontrados

Se implementaron triggers de inmutabilidad para identidad y pertenencia. Las pruebas SQL quedaron preparadas para pgTAP, pero no se ejecutaron porque no hay una instancia Supabase local y no se permite ejecutar SQL remoto. La validación real de la migración, RLS y Realtime sigue pendiente.

## Prompt 01 — Sprint 0

### Texto íntegro recibido

```text
# Prompt 01 — TaskMaster AI | Sprint 0

Actúa como arquitecto de software senior especializado en React, TypeScript, Supabase y desarrollo ágil asistido por IA.

Vamos a desarrollar desde cero **TaskMaster AI**, una plataforma colaborativa de gestión de proyectos y tareas. Este es un proyecto académico independiente. No reutilices ni modifiques otros proyectos existentes.

## Objetivo general

Construir una aplicación que cumpla los siguientes requisitos:

- React y TypeScript.
- Supabase como backend PostgreSQL.
- Entidades principales: proyectos, tareas, usuarios y comentarios.
- Custom Hook `useTasks(projectId)` para consultar tareas filtradas por proyecto.
- Operaciones CRUD: crear, consultar, actualizar y eliminar tareas.
- Estados `data`, `loading` y `error`.
- Sincronización mediante Supabase Realtime y `postgres_changes`.
- Limpieza de suscripciones con `useEffect`.
- Seguridad mediante políticas RLS.
- Separación entre interfaz, hooks, servicios y tipos.
- Ejemplo funcional de un componente React que consuma `useTasks`.
- Memoria técnica final de aproximadamente 300 palabras.

## Metodología de trabajo

Trabajaremos por sprints cortos y verificables:

**Sprint 0:** Inicialización, arquitectura y documentación.

**Sprint 1:** Modelo de datos, relaciones y políticas RLS.

**Sprint 2:** Cliente Supabase, servicios y tipos TypeScript.

**Sprint 3:** Implementación de `useTasks`, fetching y mutaciones.

**Sprint 4:** Supabase Realtime, sincronización y limpieza de canales.

**Sprint 5:** Interfaz funcional, integración y pruebas.

**Sprint 6:** Auditoría de la rúbrica, memoria técnica y entrega final.

No avances automáticamente al siguiente sprint.

## Trabajo autorizado en este primer prompt

1. Verifica el directorio de trabajo para evitar modificar proyectos existentes.
2. Inicializa un proyecto independiente llamado `taskmaster-ai` con React, Vite y TypeScript estricto, si todavía no existe.
3. Instala únicamente las dependencias necesarias para la base del proyecto.
4. Crea una arquitectura modular preparada para componentes, hooks, servicios, tipos, configuración de Supabase y pruebas.
5. Prepara un `README.md` con el propósito, requisitos y comandos de ejecución.
6. Crea una carpeta `docs/` para conservar el proceso académico.
7. Crea estos documentos:
   - `docs/PROJECT_PLAN.md`: backlog, sprints y criterios de aceptación.
   - `docs/PROMPT_LOG.md`: registro cronológico de todos los prompts.
   - `docs/PROGRESS.md`: avances, pendientes, bloqueos y decisiones.
   - `docs/ARCHITECTURE.md`: estructura propuesta y responsabilidades.
   - `docs/RUBRIC_CHECKLIST.md`: correspondencia entre cada requisito y su evidencia.
8. Registra este prompt inicial íntegramente como Prompt 01.
9. Ejecuta las comprobaciones disponibles de compilación y calidad.

## Reglas obligatorias

- No inventes resultados de pruebas.
- No afirmes que Supabase está conectado sin verificarlo.
- No inventes credenciales ni esquemas remotos.
- No utilices claves `service_role` en el frontend.
- No implementes todavía el CRUD, Realtime ni migraciones remotas.
- No modifiques archivos fuera del proyecto nuevo.
- Cada sprint debe tener un objetivo, criterios de aceptación, implementación, pruebas y resultado documentado.
- Registra cada prompt posterior con su texto completo, propósito, archivos modificados, resultado y problemas encontrados.
- Distingue claramente entre implementado, probado, pendiente y bloqueado.
- Mantén el código sencillo, modular y alineado literalmente con la rúbrica académica.

## Resultado esperado de este sprint

Al finalizar, entrega:

1. Árbol de archivos creado.
2. Dependencias instaladas.
3. Comandos ejecutados y resultados de pruebas.
4. Resumen de decisiones arquitectónicas.
5. Estado del Sprint 0.
6. Pendientes para el Sprint 1.
7. Confirmación de que el historial de prompts y progreso quedó registrado.

**Detente al finalizar Sprint 0. No continúes sin mi autorización.**
```

### Propósito

Inicializar un proyecto académico aislado y dejar trazabilidad verificable del Sprint 0.

### Archivos modificados o creados

Proyecto Vite base, `README.md`, `.env.example`, `src/App.tsx`, `src/App.css`, `src/index.css`, marcadores de las carpetas modulares y todos los documentos de `docs/`.

### Resultado y problemas encontrados

## Prompt 06 — Sprint 5 — Interfaz e integración

### Texto íntegro recibido

# TaskMaster AI — Prompt 06: Sprint 5 — Interfaz e integración

Continúa exclusivamente en C:\Users\strik\OneDrive\Documentos\SWNT\taskmaster-ai.

Actúa como desarrollador senior de React, TypeScript y Supabase. Implementa una interfaz funcional, sencilla y profesional que permita demostrar el Custom Hook useTasks y sus operaciones.

## Objetivo

Integrar en la interfaz los servicios, el hook y la sincronización Realtime desarrollados en los sprints anteriores, cumpliendo literalmente el ejercicio académico.

## Actividades

1. Inspecciona primero los archivos existentes, las migraciones, los tipos, las pruebas y la rúbrica. Reutiliza el código ya implementado; no reconstruyas el proyecto.
2. Implementa una interfaz React para iniciar y cerrar sesión con Supabase Auth, consultar y seleccionar proyectos del usuario autenticado, visualizar tareas mediante useTasks(projectId), crear, editar y eliminar tareas con confirmación, mostrar carga/error/lista vacía e identificar el proyecto seleccionado.
3. Separa estrictamente componentes, hooks, servicios y tipos. Ningún componente debe ejecutar consultas a tablas.
4. Usa las entidades y campos reales de las migraciones y crea servicios modulares mínimos para proyectos si hacen falta.
5. Mantén Realtime en useTasks y no dupliques suscripciones en componentes.
6. Al cambiar de proyecto o cerrar sesión no deben permanecer visibles datos anteriores, suscripciones ni resultados de solicitudes antiguas.
7. Diseña una interfaz responsive, clara y accesible sin librerías visuales innecesarias.
8. Prepara un flujo de dos sesiones, pero no afirmes sincronización real hasta probar Supabase.

## Configuración

Usa las variables definidas, no incluyas credenciales, no uses service_role, no ejecutes migraciones remotas, no modifiques RLS sin autorización y muestra configuración pendiente sin datos ficticios persistidos.

## Pruebas

Añade pruebas de renderizado de tareas, selección/cambio de proyecto, formularios, eliminación, carga/error/vacío, aislamiento de sesión y consumo de useTasks. Ejecuta npm run build, npm run lint y npm run test e informa resultados reales.

## Documentación obligatoria

Actualiza docs/PROMPT_LOG.md, docs/PROGRESS.md, docs/ARCHITECTURE.md, docs/RUBRIC_CHECKLIST.md, docs/PROJECT_PLAN.md y README.md. Mantén pendientes la memoria técnica y validación real.

## Entrega

Informa archivos, funcionalidades, pruebas, instrucciones locales, configuración manual y riesgos. No modifiques otros repositorios ni hagas commit/push.

Detente al finalizar Sprint 5. No avances al Sprint 6.

### Propósito

Integrar autenticación, proyectos y tablero de tareas sobre los servicios y hooks existentes sin ejecutar consultas desde componentes.

### Archivos modificados o creados

- src/App.tsx, src/App.css y src/index.css
- src/components/AuthForm.tsx, ProjectPicker.tsx y TaskBoard.tsx
- src/hooks/useAuth.ts y useProjects.ts
- src/services/auth.service.ts y projects.service.ts
- Pruebas de App, formularios, selector y tablero
- README y documentación del Sprint 5

### Resultado y problemas encontrados

Resultado: interfaz funcional implementada; build, lint y 34 pruebas pasan. Se corrigió el aislamiento DOM entre pruebas y el rol accesible del selector de proyectos. No se probó persistencia, autenticación ni colaboración real contra Supabase.

Resultado: proyecto creado y documentación inicial registrada. Problemas: ninguno bloqueante. La conexión Supabase permanece sin configurar y no se inventaron credenciales ni resultados remotos.

## Prompt 02 — Modelo de datos y seguridad

### Texto íntegro recibido

```text
# TaskMaster AI — Prompt 02: Modelo de datos y seguridad

Continúa trabajando exclusivamente en el proyecto `taskmaster-ai` creado durante Sprint 0.

Actúa como arquitecto de bases de datos PostgreSQL y especialista en Supabase.

## Objetivo

Diseñar e implementar localmente el modelo de datos de TaskMaster AI, sus relaciones, migraciones SQL y políticas Row Level Security (RLS), sin ejecutar cambios en ninguna base de datos remota.

## Requisitos

1. Inspecciona primero `docs/PROJECT_PLAN.md`, `docs/ARCHITECTURE.md`, `docs/PROGRESS.md` y `docs/RUBRIC_CHECKLIST.md`.
2. Diseña estas entidades:
   - `profiles`: usuarios vinculados a Supabase Auth.
   - `projects`: proyectos colaborativos.
   - `project_members`: pertenencia y roles de los usuarios en cada proyecto.
   - `tasks`: tareas asociadas a proyectos.
   - `comments`: comentarios asociados a tareas y autores.
3. Define claves primarias UUID, claves foráneas, restricciones, fechas de creación y actualización e índices justificados.
4. Incluye en `tasks` los campos necesarios para título, descripción, estado, prioridad, proyecto, creador y usuario asignado.
5. Define políticas RLS que permitan:
   - Consultar proyectos y tareas únicamente a miembros autorizados.
   - Crear, actualizar y eliminar tareas según permisos explícitos.
   - Consultar y gestionar comentarios según pertenencia al proyecto y autoría.
   - Impedir acceso entre proyectos sin membresía.
6. Evita recursión entre políticas RLS y documenta cualquier función auxiliar de seguridad.
7. Prepara migraciones SQL versionadas dentro de `supabase/migrations/`.
8. Define los tipos TypeScript correspondientes, manteniendo consistencia con las columnas SQL.
9. Añade pruebas automatizadas de seguridad y restricciones cuando exista un entorno local disponible.

## Restricciones

- No conectes todavía Supabase remoto.
- No ejecutes migraciones remotas.
- No inventes credenciales ni resultados.
- No utilices `service_role` en el frontend.
- No implementes todavía `useTasks`, CRUD frontend ni Realtime.
- No modifiques EcoTrack ni otros repositorios.
- No instales dependencias innecesarias.

## Documentación obligatoria

Actualiza:

- `docs/PROMPT_LOG.md`: registra íntegramente este Prompt 02.
- `docs/PROGRESS.md`: archivos modificados, comandos, resultados y pendientes.
- `docs/ARCHITECTURE.md`: modelo de datos y relaciones.
- `docs/RUBRIC_CHECKLIST.md`: evidencia de cumplimiento y criterios pendientes.
- `docs/PROJECT_PLAN.md`: estado del Sprint 1.

## Criterios de aceptación

El Sprint 1 estará terminado cuando existan migraciones SQL y tipos TypeScript coherentes, políticas RLS documentadas y una explicación de los permisos de cada entidad.

Ejecuta compilación, lint y las pruebas disponibles. Diferencia claramente las verificaciones realizadas de las que requieran una instancia Supabase.

Al finalizar, entrega un resumen del esquema, archivos creados, políticas de seguridad, resultados de validación y bloqueos.

**Detente al finalizar Sprint 1. No avances al Sprint 2 sin autorización.**
```

### Propósito

Diseñar localmente el modelo PostgreSQL, las políticas RLS y sus contratos TypeScript, sin tocar ninguna base remota.

### Archivos modificados o creados

- `supabase/migrations/20261112000100_initial_schema.sql`
- `src/types/database.ts`
- `src/types/index.ts`
- `docs/ARCHITECTURE.md`
- `docs/PROJECT_PLAN.md`
- `docs/PROGRESS.md`
- `docs/RUBRIC_CHECKLIST.md`
- `docs/PROMPT_LOG.md`

## Prompt 03 — Sprint 2

### Texto íntegro recibido

```text
# TaskMaster AI — Prompt 03: Sprint 2

Continúa exclusivamente en el proyecto `C:\Users\strik\OneDrive\Documentos\SWNT\taskmaster-ai`.

Actúa como desarrollador senior especializado en React, TypeScript y Supabase. Mantén la metodología ágil, la documentación y la trazabilidad establecidas en los sprints anteriores.

## Objetivo

Implementar la infraestructura de comunicación entre React y Supabase y una capa de servicios reutilizable para tareas, sin mezclar consultas con componentes visuales.

## Actividades

1. Inspecciona la migración `20261112000100_initial_schema.sql`, los tipos existentes y la documentación antes de modificar archivos.
2. Configura un cliente Supabase reutilizable en `src/config/`, utilizando variables de entorno de Vite:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
   Admite una clave pública legacy `anon` únicamente si es necesario y está documentado. Nunca uses `service_role` ni claves secretas en el navegador.
3. Implementa `src/services/tasks.service.ts`, con operaciones tipadas:
   - `getTasksByProject(projectId)`
   - `createTask(input)`
   - `updateTask(taskId, changes)`
   - `deleteTask(taskId)`
4. Asegura que:
   - Las consultas de lectura filtren por `project_id`.
   - Las mutaciones utilicen los campos reales del esquema SQL.
   - Los errores de Supabase se propaguen de manera controlada.
   - No se silencien errores de permisos RLS.
   - La capa de servicios no contenga JSX ni estados de React.
   - No se confíe en un `user_id` arbitrario enviado por la interfaz para conceder permisos.
5. Define tipos de entrada y salida para las operaciones, compatibles con `src/types/database.ts`.
6. Incorpora pruebas automatizadas con un cliente Supabase simulado, incluyendo lectura, inserción, actualización, eliminación, errores y filtrado por proyecto.
7. Añade el script `npm run test` si aún no existe.

## Restricciones

- No implementes todavía `useTasks`.
- No implementes Realtime ni componentes visuales.
- No ejecutes migraciones remotas.
- No inventes credenciales.
- No alteres la migración existente sin identificar y justificar un defecto.
- No modifiques otros repositorios.
- Si faltan variables de entorno, la aplicación debe comunicarlo de forma controlada y no fingir una conexión exitosa.

## Validación

Ejecuta:

- `npm run build`
- `npm run lint`
- `npm run test`

Reporta los resultados reales. Si alguna prueba falla, explica la causa y corrige únicamente los problemas dentro del alcance del sprint.

## Bitácora obligatoria

Actualiza:

- `docs/PROMPT_LOG.md` con el texto completo de este Prompt 03.

## Prompt 04 — Sprint 3 — Custom Hook useTasks

### Texto íntegro recibido

```text
# TaskMaster AI — Prompt 04: Sprint 3 — Custom Hook useTasks

Continúa exclusivamente en el repositorio:

`C:\Users\strik\OneDrive\Documentos\SWNT\taskmaster-ai`

Actúa como desarrollador senior especializado en React, TypeScript, Custom Hooks y pruebas automatizadas.

## Objetivo

Implementar el Custom Hook principal `useTasks(projectId)` utilizando los servicios desarrollados durante Sprint 2.

Este hook constituye uno de los entregables obligatorios de la rúbrica académica.

## Actividades

1. Inspecciona primero:
   - `src/services/tasks.service.ts`
   - `src/types/database.ts`
   - `src/config/supabase.ts`
   - Los documentos de arquitectura, progreso y rúbrica.
2. Implementa `src/hooks/useTasks.ts` con:
   - Lectura inicial de tareas filtradas por `projectId`.
   - Estado `data` con las tareas.
   - Estado `loading`.
   - Estado `error`.
   - Función `createTask`.
   - Función `updateTask`.
   - Función `deleteTask`.
   - Función `refreshTasks` para actualizar la lista manualmente.
3. Utiliza `useEffect` para cargar las tareas al montar el componente y cuando cambie `projectId`.
4. Evita condiciones de carrera:
   - No permitas que respuestas antiguas sobrescriban datos de otro proyecto.
   - Evita actualizaciones de estado después de desmontar el componente.
   - Controla correctamente los errores de las operaciones asíncronas.
5. Implementa una estrategia coherente de actualización del estado después de crear, editar o eliminar tareas. Prioriza el refresco confirmado desde el servidor para reducir complejidad.
6. Mantén la separación arquitectónica:
   - Los componentes no deben ejecutar consultas Supabase.
   - El hook debe utilizar los servicios existentes.
   - No dupliques la lógica CRUD.
   - Conserva los tipos estrictos de TypeScript.
7. Crea pruebas automatizadas del hook para verificar:
   - Carga inicial.
   - Lista vacía.
   - Errores de consulta.
   - Creación, actualización y eliminación.
   - Cambio de `projectId`.
   - Respuestas asíncronas fuera de orden.
   - Desmontaje durante una consulta.
   - Recuperación después de un error.
8. Utiliza herramientas apropiadas para probar hooks React. Las pruebas deben comprobar comportamientos reales con servicios simulados controlables, no afirmaciones ficticias.

## Restricciones

- No implementes todavía Supabase Realtime.
- No crees todavía la interfaz definitiva.
- No ejecutes migraciones remotas.
- No modifiques las políticas RLS.
- No introduzcas credenciales.
- No modifiques otros repositorios.

## Validación

Ejecuta:

- `npm run build`
- `npm run lint`
- `npm run test`

Informa el número exacto de pruebas ejecutadas, aprobadas y fallidas.

## Documentación

Actualiza obligatoriamente:

- `docs/PROMPT_LOG.md` con este prompt completo.
- `docs/PROGRESS.md` con archivos, decisiones, comandos y resultados.
- `docs/ARCHITECTURE.md` con las responsabilidades del hook.
- `docs/RUBRIC_CHECKLIST.md` con evidencias y pendientes.
- `docs/PROJECT_PLAN.md` con el estado del Sprint 3.

Mantén como pendientes explícitos:

- Integración de Supabase Realtime.
- Limpieza de canales Realtime.
- Validación SQL/RLS en una base real.
- Pruebas de colaboración entre usuarios.

## Entrega

Al finalizar, presenta las funciones públicas de `useTasks`, los archivos creados, las pruebas realizadas y los problemas pendientes.

**Detente al terminar Sprint 3. No avances automáticamente al Sprint 4.**
```

### Propósito

Implementar el hook principal de tareas con estados, mutaciones delegadas, refresco confirmado y protección frente a carreras y desmontaje.

### Archivos modificados o creados

- `src/hooks/useTasks.ts`
- `src/test/useTasks.test.tsx`
- `package.json` y `package-lock.json` (`@testing-library/react`, `jsdom`)
- Documentación de arquitectura, plan, progreso, rúbrica y esta bitácora.

### Resultado y problemas encontrados

Resultado: build, lint y 17 pruebas pasan. Oxlint inicialmente advirtió sobre un `setState` sincrónico en un efecto; se eliminó la limpieza inmediata de datos al cambiar de proyecto, conservando la protección de solicitudes y evitando la advertencia. Realtime, SQL/RLS real y colaboración multiusuario siguen pendientes.
- `docs/PROGRESS.md` con cambios, comandos, resultados y pendientes.

## Prompt 05 — Sprint 4 — Supabase Realtime

### Texto íntegro recibido

```text
# TaskMaster AI — Prompt 05: Sprint 4 — Supabase Realtime

Continúa trabajando exclusivamente en:

`C:\Users\strik\OneDrive\Documentos\SWNT\taskmaster-ai`

Actúa como desarrollador senior especializado en React, TypeScript, Supabase Realtime y gestión del ciclo de vida de componentes.

## Objetivo

Integrar Supabase Realtime con el Custom Hook `useTasks(projectId)` para que las tareas de un proyecto se actualicen automáticamente cuando otro usuario las cree, modifique o elimine.

Debemos cumplir literalmente los requisitos de la rúbrica académica relacionados con `postgres_changes`, `useEffect`, sincronización y limpieza de suscripciones.

## Actividades

1. Inspecciona el código existente antes de modificarlo:
   - `src/hooks/useTasks.ts`
   - `src/services/tasks.service.ts`
   - `src/config/supabase.ts`
   - Las pruebas actuales.
   - La migración SQL y documentación del proyecto.
2. Integra Supabase Realtime mediante:

   `.channel(...).on('postgres_changes', ...).subscribe()`
3. Configura la suscripción para escuchar los eventos `INSERT`, `UPDATE` y `DELETE` de la tabla `public.tasks`, filtrados por el `project_id` correspondiente cuando sea compatible con el evento.
4. Conserva la API pública actual del hook:
   - `data`
   - `loading`
   - `error`
   - `createTask`
   - `updateTask`
   - `deleteTask`
   - `refreshTasks`
5. Implementa una estrategia coherente de sincronización:
   - Prioriza el refresco confirmado desde el servidor cuando llegue un evento Realtime.
   - Evita duplicados si el mismo cambio ya fue incorporado después de una mutación local.
   - Controla eventos rápidos o consecutivos.
   - Evita que respuestas antiguas sobrescriban datos recientes.
   - Mantén la protección frente a cambios de proyecto y desmontaje.
   - Documenta las limitaciones de los eventos DELETE y de los filtros de Realtime bajo RLS.
6. Implementa correctamente la limpieza del ciclo de vida:
   - Usa `useEffect` para crear la suscripción.
   - Elimina el canal mediante `supabase.removeChannel(channel)` en la función de limpieza.
   - Evita canales duplicados.
   - Cierra la suscripción al desmontar el componente.
   - Cierra la suscripción anterior cuando cambia `projectId`.
   - Considera el comportamiento de React Strict Mode.
7. Gestiona los estados de conexión:
   - No presentes una suscripción como activa antes de recibir confirmación.
   - Maneja errores de conexión y estados como `CHANNEL_ERROR` y `TIMED_OUT`.
   - Documenta qué ocurre si se pierde temporalmente la conexión.
   - Permite recuperar consistencia mediante una nueva consulta cuando corresponda.
8. Revisa la migración SQL para determinar si la tabla `tasks` está preparada para publicar cambios mediante Supabase Realtime.
   - Si falta configuración, crea una migración local adicional, claramente documentada.
   - No modifiques migraciones ya existentes innecesariamente.
   - No ejecutes cambios en Supabase remoto.
   - No debilites las políticas RLS.

## Pruebas obligatorias

Añade pruebas automatizadas para comprobar:

- Recepción de un evento INSERT.
- Recepción de un evento UPDATE.
- Recepción de un evento DELETE.
- Refresco coherente después de eventos.
- Eventos consecutivos.
- Ausencia de duplicados.
- Cambio de `projectId`.
- Limpieza al desmontar.
- Eliminación del canal anterior.
- Ausencia de suscripciones duplicadas.
- Manejo de errores de suscripción.
- Comportamiento bajo React Strict Mode.

Las pruebas deben verificar comportamientos reales del hook mediante simulaciones controladas del cliente Realtime.

No afirmes que existe sincronización real entre usuarios si todavía no se ha probado con una instancia Supabase.

## Restricciones

- No implementes todavía la interfaz definitiva.
- No ejecutes migraciones remotas.
- No inventes credenciales.
- No uses `service_role`.
- No elimines las pruebas anteriores.
- No modifiques otros repositorios.
- No introduzcas cambios arquitectónicos innecesarios.

## Validación

Ejecuta:

- `npm run build`
- `npm run lint`
- `npm run test`

Reporta el número exacto de pruebas ejecutadas, aprobadas y fallidas.

## Documentación y trazabilidad

Actualiza:

- `docs/PROMPT_LOG.md`: registra íntegramente este Prompt 05.
- `docs/PROGRESS.md`: cambios, comandos, resultados y pendientes.
- `docs/ARCHITECTURE.md`: explica el flujo de eventos Realtime.
- `docs/RUBRIC_CHECKLIST.md`: identifica las evidencias para la rúbrica.
- `docs/PROJECT_PLAN.md`: actualiza el estado del Sprint 4.

Mantén como pendientes explícitos la validación real de SQL/RLS, la conexión a Supabase, las pruebas entre usuarios y la interfaz definitiva.

## Entrega

Al finalizar, informa:

1. Archivos modificados.
2. Estrategia de sincronización implementada.
3. Cómo se limpian las suscripciones.
4. Pruebas realizadas y resultados.
5. Limitaciones pendientes de validación real.

**Detente al finalizar Sprint 4. No avances al Sprint 5 sin autorización.**
```

### Propósito

Integrar la suscripción Realtime en `useTasks` con sincronización confirmada, gestión de estados de conexión y cleanup completo del ciclo de vida.

### Archivos modificados o creados

- `src/hooks/useTasks.ts`
- `src/test/useTasks.test.tsx`
- `src/test/useTasks.realtime.test.tsx`
- `supabase/migrations/20261112000200_enable_tasks_realtime.sql`
- Documentación de arquitectura, plan, progreso, rúbrica y esta bitácora.

### Resultado y problemas encontrados

Resultado: las pruebas Realtime aisladas pasan 7/7. El primer mock usaba incorrectamente `entry.event` en vez de `entry.config.event`; se corrigió. También se limpió una advertencia de Strict Mode/ref y se añadió recuperación del error al recibir `SUBSCRIBED`. No se ha probado sincronización real entre usuarios ni se han ejecutado migraciones remotas.
- `docs/ARCHITECTURE.md` con la nueva capa de servicios.
- `docs/RUBRIC_CHECKLIST.md` con las evidencias disponibles.

Mantén explícitamente pendiente la validación real de SQL y RLS, ya que Sprint 1 no contó con una instancia Supabase local.

## Entrega

Presenta los archivos creados o modificados, las firmas de los servicios, los resultados de las pruebas y cualquier bloqueo.

**Detente al finalizar Sprint 2. No avances al Sprint 3 sin autorización.**
```

### Propósito

Implementar el cliente público de Supabase y la capa de servicios tipada para tareas con pruebas simuladas, sin hooks, Realtime ni UI.

### Archivos modificados o creados

- `src/config/supabase.ts`
- `src/services/tasks.service.ts`
- `src/test/tasks.service.test.ts`
- `src/test/supabase.config.test.ts`
- `.env.example`, `README.md`, `package.json` y `package-lock.json`
- Documentación de arquitectura, plan, progreso, rúbrica y esta bitácora.

### Resultado y problemas encontrados

Resultado: build, lint y 9 pruebas pasan. El build inicialmente detectó una incompatibilidad entre las sobrecargas genéricas de `SupabaseClient` y el contrato de tipos local; se corrigió con una interfaz estrecha tipada para el servicio, sin cambiar el esquema SQL. No existe instancia Supabase local, no se ejecutaron migraciones remotas y la validación real de SQL/RLS continúa pendiente.

### Resultado y problemas encontrados

Resultado: esquema, relaciones, RLS y tipos locales implementados. `supabase` CLI no está instalada y no existe una instancia local; por eso no se ejecutaron migraciones ni pruebas SQL. No se conectó Supabase remoto ni se instalaron dependencias adicionales.
