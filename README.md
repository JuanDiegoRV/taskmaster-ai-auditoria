# TaskMaster AI

Plataforma colaborativa académica para gestionar proyectos y tareas con React, TypeScript estricto, Supabase PostgreSQL, RLS y Realtime.

## Estado de entrega

Aplicación funcional con autenticación Email/Password, proyectos filtrados por membresía, CRUD de tareas, `useTasks(projectId)`, sincronización `postgres_changes`, limpieza de canales y separación por capas.

La conexión con Supabase fue verificada con el proyecto configurado. Las migraciones deben aplicarse en el proyecto destino antes de usar datos nuevos.

## Ejecutar localmente

Requisitos: Node.js 20+ y npm 10+.

```bash
npm install
npm run dev
```

Validación:

```bash
npm run build
npm run lint
npm run test
```

Resultado actual: build correcto, lint correcto y 34 pruebas aprobadas en 8 archivos.

## Configuración Supabase

Copia `.env.example` como `.env.local` y completa la URL base, sin `/rest/v1/`:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
VITE_SUPABASE_ANON_KEY=
```

Nunca uses `service_role` o `sb_secret_` en el navegador. Reinicia Vite después de modificar variables.

Ejecuta las migraciones en este orden:

1. `supabase/migrations/20261112000100_initial_schema.sql`
2. `supabase/migrations/20261112000200_enable_tasks_realtime.sql`
3. `supabase/migrations/20261112000300_protect_identity_fields.sql`

Después crea dos usuarios en Auth, un proyecto y una membresía. Consulta [docs/SUPABASE_SETUP.md](docs/SUPABASE_SETUP.md) para el procedimiento completo.

## Arquitectura

```text
Componentes React
        ↓
Hooks: useAuth, useProjects, useTasks
        ↓
Servicios tipados
        ↓
Cliente Supabase
        ↓
PostgreSQL + RLS + Realtime
```

- `src/components/`: presentación e interacción.
- `src/hooks/`: estado, efectos, ciclo de vida y coordinación.
- `src/services/`: consultas y mutaciones; sin JSX.
- `src/config/`: cliente público y variables Vite.
- `src/types/`: contratos TypeScript.
- `supabase/migrations/`: esquema, Realtime e integridad.
- `supabase/tests/`: pruebas SQL preparadas para pgTAP.
- `docs/`: trazabilidad, arquitectura, guía y entrega final.

## Evidencias visuales

### Supabase: membresía del proyecto

![Membresía owner en project_members](docs/image%20%2826%29.png)

### Interfaz: proyecto y tarea

![TaskMaster AI con proyecto y tarea](docs/image%20%2827%29.png)

## Seguridad

RLS restringe proyectos, tareas y comentarios a miembros autorizados. Los helpers `SECURITY DEFINER` evitan recursión. La migración de hardening protege la identidad y pertenencia de tareas, comentarios, proyectos y membresías mediante triggers.

## Entrega académica

La respuesta al caso de estudio, el fragmento de consumo del hook y la memoria técnica están en [docs/FINAL_DELIVERY.md](docs/FINAL_DELIVERY.md).
