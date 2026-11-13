# Informe de validación y evidencias — Prompt 05

Fecha: 2026-11-13 (America/Bogota)

## Alcance

La validación se ejecutó exclusivamente en `C:\Users\strik\OneDrive\Documentos\SWNT\taskmaster-ai-auditoria`. No se modificó el repositorio original, no se ejecutaron migraciones, no se conectó Supabase remoto y no se redacta aquí el informe final.

## Resultados ejecutables

| Comando | Resultado |
|---|---|
| `npm run build` | **Demostrado** — Vite 8.3.8, 73 módulos transformados, 4 chunks JS |
| `npm run lint` | **Demostrado** — `oxlint` sin errores |
| `npm run test -- --reporter=verbose` | **Demostrado** — 9 archivos, 35 pruebas aprobadas, duración 3.99 s |

## Criterios de la rúbrica

| Criterio | Evidencia concreta | Estado |
|---|---|---|
| React + TypeScript + Vite | `package.json`, `src/`, `vite.config.ts`, build exitoso | Demostrado |
| Cliente Supabase reusable | `src/config/supabase.ts`, `getSupabaseClient()` lazy y pruebas de configuración | Demostrado estáticamente y por pruebas unitarias |
| Autenticación | `src/hooks/useAuth.ts`, `src/services/auth.service.ts`, `AuthForm.test.tsx`, `App.test.tsx` | Demostrado localmente; proveedor real pendiente |
| Proyectos y cambio de proyecto | `useProjects.ts`, `ProjectPicker.tsx`, `projectPicker.test.tsx`, `Dashboard.tsx` | Demostrado localmente |
| CRUD de tareas | `tasks.service.ts`, `TaskBoard.tsx`, `tasks.service.test.ts`, `taskBoard.test.tsx` | Demostrado con mocks; base real pendiente |
| Estados `data`, `loading`, `error` | `useTasks.ts`, `useTasks.test.tsx`, `TaskBoard.test.tsx` | Demostrado localmente |
| Realtime y cleanup | `useTasks.ts`, `useTasks.realtime.test.tsx`; pruebas de INSERT/UPDATE/DELETE, coalescencia y `removeChannel` | Parcialmente demostrado; Supabase Realtime real pendiente |
| RLS y aislamiento cross-project | Migraciones `20261112000100...sql` y `20261113000100_security_hardening.sql`; pruebas SQL preparadas | Parcialmente demostrado estáticamente; validación dinámica pendiente |
| Protección de identidad | `20261112000300_protect_identity_fields.sql`; triggers para tareas, comentarios, proyectos y membresías | Parcialmente demostrado; requiere PostgreSQL real |
| Restricción del rol `owner` | `20261113000100_security_hardening.sql:15-37`; prueba de admin y owner en `supabase/tests/20261113000100_security_hardening.sql` | Parcialmente demostrado estáticamente; SQL no ejecutado |
| Permisos `SECURITY DEFINER` | Revocaciones de funciones de trigger en migración 20261113000100; helpers RLS preservados para `authenticated` | Parcialmente demostrado estáticamente; permisos efectivos pendientes |
| Variables de entorno | `.gitignore:17-19`, `.env.example`, `src/config/supabase.ts`, prueba que rechaza `service_role` | Demostrado estáticamente y por pruebas unitarias |
| Separación por capas | `components/`, `hooks/`, `services/`, `config/`, `types/` y `docs/ARCHITECTURE.md` | Demostrado |
| Code splitting | `src/App.tsx`, `src/components/Dashboard.tsx`, cuatro chunks en `dist/assets` | Demostrado |
| Carga diferida del tablero | `lazy(() => import('./TaskBoard'))`, `Suspense`, `dashboard.test.tsx` | Demostrado localmente |
| Compatibilidad funcional tras optimización | 35 pruebas aprobadas y build exitoso | Demostrado localmente |
| Core Web Vitals / Lighthouse | No se ejecutó navegador ni Lighthouse | Pendiente |
| Colaboración multiusuario real | No hay instancia Supabase configurada para pruebas | Pendiente |
| Pruebas SQL/pgTAP | Archivos SQL preparados, no ejecutados | Pendiente |

## Seguridad verificada

### Asignación de `owner`

La migración `20261113000100_security_hardening.sql` recrea las políticas de inserción y actualización de `project_members`. El actor puede ser `owner` o `admin` para operaciones generales, pero cuando el nuevo `role` es `owner` también debe satisfacer `has_project_role(..., ['owner'])`.

Esto se verificó por inspección de código y por la presencia de pruebas preparadas para:

- admin insertando `owner` — debe fallar;
- admin promoviendo una membresía — debe fallar;
- owner concediendo `owner` deliberadamente — debe funcionar.

No se afirma validación RLS dinámica.

### Funciones `SECURITY DEFINER`

Las funciones de trigger `set_updated_at`, `handle_new_user` y `add_project_owner_member` tienen revocación explícita para `public`, `anon` y `authenticated`. Los helpers `is_project_member` y `has_project_role` no fueron revocados para `authenticated`, porque las políticas RLS los necesitan.

La efectividad de los permisos, propietarios y comportamiento del contexto `SECURITY DEFINER` requiere PostgreSQL/Supabase real.

### Credenciales y frontend

- `.env`, `.env.local` y `.env.*` quedan ignorados, con excepción de `.env.example`.
- El escaneo de `src`, `public`, `package.json` y `.env.example` no encontró `sb_secret_`, `service_role` asignado ni claves privadas.
- `src/config/supabase.ts` rechaza una clave cuyo valor contiene `service_role`.
- No se encontró `dangerouslySetInnerHTML` ni `innerHTML`; no se detectó XSS estático.

## Validación del code splitting

El grafo local actualizado registró 253 nodos y 455 relaciones. Las relaciones relevantes son:

- `App.tsx → Dashboard.tsx` mediante import dinámico.
- `Dashboard.tsx → TaskBoard.tsx` mediante import dinámico.
- `main.tsx → App.tsx` como entrada estática.
- `App.tsx → useAuth.ts` como dependencia estática necesaria para comprobar sesión.

La inspección de fuente no encontró imports estáticos de `AuthForm`, `Dashboard` o `TaskBoard` en `App.tsx`. Vite generó:

- `index-FMJi4Q88.js`: entry, 440.883 B raw / 124.497 B gzip;
- `AuthForm-CuMT7dmG.js`: diferido, 1.056 B / 561 B;
- `Dashboard--9B5z5Om.js`: diferido, 3.710 B / 1.513 B;
- `TaskBoard-D7bsQGGP.js`: diferido, 7.032 B / 2.537 B.

El entry sigue incluyendo Auth y `@supabase/supabase-js`; por ello la mejora del entry es moderada. El total generado es 452.681 B raw / 129.108 B gzip. Estas cifras no se confunden con la descarga inicial: la ruta concreta determina si se solicita AuthForm o Dashboard, y TaskBoard se solicita al seleccionar un proyecto.

## Comparación de bundle

| Métrica | Línea base | Validación final |
|---|---:|---:|
| Chunks JS | 1 | 4 |
| JS total raw | 449.655 B | 452.681 B |
| JS total gzip | 126.888 B | 129.108 B |
| Entry raw | 449.655 B | 440.883 B |
| Entry gzip | 126.888 B | 124.497 B |
| CSS raw | 4.333 B | 4.333 B |
| CSS gzip | 1.527 B | 1.527 B |

La línea base proviene del build reproducido antes de Prompt 04 y documentado en `BASELINE.md`; la medición final se tomó directamente de `dist/assets` con el mismo cálculo local de gzip.

## Cobertura de pruebas funcionales

- Inicio de sesión: envío de credenciales y manejo de error/carga en `authForm.test.tsx`.
- Cierre de sesión: `app.test.tsx`.
- Cambio de proyecto: `projectPicker.test.tsx`.
- CRUD: `taskBoard.test.tsx` y `tasks.service.test.ts`.
- Realtime: `useTasks.realtime.test.tsx`, incluidos INSERT, UPDATE, DELETE, coalescencia, reconexión y cleanup.
- Carga diferida: `app.test.tsx` y `dashboard.test.tsx`.
- Hooks: carga, errores, carreras, desmontaje, recuperación y refrescos confirmados en `useTasks.test.tsx`.

No se identificó una prueba local esencial faltante que pueda suplirse sin simular Supabase real. La brecha restante es de entorno, no de cobertura unitaria.

## Limitaciones pendientes

- Las pruebas SQL de RLS y permisos no se ejecutaron contra PostgreSQL/Supabase.
- No se probó aislamiento cross-project con dos usuarios reales.
- No se verificó Realtime contra una publicación real.
- No se ejecutó navegador, Lighthouse ni medición de Core Web Vitals.
- No se puede confirmar el propietario efectivo de las funciones `SECURITY DEFINER` sin consultar el catálogo de PostgreSQL.
- El Prompt 03 permanece incompleto: los registros disponibles terminan en “Evidencia que lo”; no existe texto adicional recuperable en el workspace ni en los logs locales.
