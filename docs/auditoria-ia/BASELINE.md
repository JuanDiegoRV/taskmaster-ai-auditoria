# Línea base técnica — Prompt 02

Fecha de ejecución: 2026-11-13 (America/Bogota)

## Alcance y preparación

- Ruta auditada: `C:\Users\strik\OneDrive\Documentos\SWNT\taskmaster-ai-auditoria`.
- El diagnóstico se ejecutó desde esa carpeta.
- El proyecto original `taskmaster-ai` no fue utilizado para escritura ni ejecución.
- `npm ci` se ejecutó correctamente usando `package-lock.json`: 104 paquetes añadidos, 105 auditados y 0 vulnerabilidades reportadas por npm.
- `node_modules` y `dist` están excluidos por `.gitignore` mediante las reglas `node_modules` y `dist`.
- No se ejecutaron migraciones SQL, no se conectó Supabase real y no se instalaron herramientas adicionales de análisis.

## Arquitectura observada

La aplicación es React + TypeScript + Vite, con `@supabase/supabase-js` como cliente de datos y autenticación.

```text
main.tsx / StrictMode
        ↓
App.tsx
        ├─ useAuth → auth.service → config/supabase → Supabase Auth
        ├─ useProjects → projects.service → projects + RLS
        └─ ProjectPicker + TaskBoard
             └─ useTasks → tasks.service → tasks + Realtime + RLS
```

Capas principales:

- `src/components/`: `AuthForm`, `ProjectPicker` y `TaskBoard`; renderizado y eventos.
- `src/hooks/`: `useAuth`, `useProjects` y `useTasks`; estado, efectos, ciclo de vida y sincronización.
- `src/services/`: autenticación, proyectos y CRUD de tareas.
- `src/config/supabase.ts`: lectura de `VITE_SUPABASE_URL`, clave publishable o fallback anon legacy, y cliente lazy.
- `src/types/`: contratos TypeScript de la base de datos.
- `supabase/migrations/`: esquema, RLS, Realtime y triggers de integridad.
- `supabase/tests/`: prueba SQL de integridad/RLS preparada, no ejecutada.

No existe sistema de rutas: `App` es el punto de entrada único. Tampoco existe `React.lazy`, `Suspense` ni carga diferida. `main.tsx` carga `App`, y `App` importa inicialmente los tres componentes principales, hooks y estilos.

El esquema local define `profiles`, `projects`, `project_members`, `tasks` y `comments`. Todas las tablas habilitan RLS. Las políticas se apoyan en `is_project_member` y `has_project_role`, funciones `SECURITY DEFINER` con `search_path = public`; la migración 003 añade triggers de inmutabilidad de identidad y pertenencia.

## Resultados ejecutables

| Comando | Resultado exacto |
|---|---|
| `npm ci` | Éxito; 104 paquetes añadidos, 105 auditados, 0 vulnerabilidades reportadas |
| `npm run build` | Éxito; `tsc -b && vite build`, Vite 8.3.8, 71 módulos transformados |
| `npm run lint` | Éxito; `oxlint` sin salida de errores |
| `npm run test` | Éxito; 8 archivos de prueba, 34 pruebas aprobadas, duración 3.27 s |

## Bundle generado

Mediciones tomadas directamente de `dist/assets` después de `npm run build`. El gzip se calculó sobre cada archivo con `GZipStream` de .NET; no son cifras simuladas.

| Tipo | Archivo | Sin comprimir | gzip |
|---|---|---:|---:|
| JavaScript | `index-DK_5swlC.js` | 449.655 bytes | 126.888 bytes |
| CSS | `index-1awJgQJZ.css` | 4.333 bytes | 1.527 bytes |
| **Totales JavaScript** | 1 archivo | **449.655 bytes** | **126.888 bytes** |
| **Total CSS** | 1 archivo | **4.333 bytes** | **1.527 bytes** |

El archivo JavaScript más grande es `index-DK_5swlC.js`, que también contiene todo el JavaScript inicial. No hay code splitting: Vite produjo un único chunk JS y un único chunk CSS. No se encontraron `React.lazy` ni `Suspense`.

Dependencias de producción candidatas a contribuir al peso inicial:

- `@supabase/supabase-js`: integra cliente, Auth y Realtime y es el candidato funcional más relevante.
- `react` y `react-dom`: runtime necesario de la aplicación.

No se instaló ni ejecutó un analizador de composición del bundle, por lo que no se atribuye un porcentaje de peso a cada dependencia. La medición disponible es la del archivo final completo.

## Auditoría estática resumida

- Autenticación: Supabase Auth con `getSession`, `signInWithPassword`, `signOut` y listener de cambios; no hay almacenamiento manual de tokens.
- Sesión: el listener se desuscribe al desmontar; `App` oculta el workspace cuando no existe usuario.
- Formularios: React controla email, contraseña, título y descripción; hay `required` y validación básica de no vacío para tareas.
- XSS: no se encontró `dangerouslySetInnerHTML` ni asignación `innerHTML`; el contenido de usuario se renderiza mediante JSX, que escapa texto. No hay XSS confirmado en la revisión estática.
- Supabase: las consultas están encapsuladas en servicios; las mutaciones de tareas obtienen `creator_id` desde el usuario autenticado y no desde la UI.
- RLS: existe cobertura para las cinco tablas y separación por proyecto mediante membresía; la ejecución real permanece sin validar.
- Variables: solo se leen variables `VITE_*`; se rechaza una clave cuyo valor contiene `service_role`. `.env.example` contiene campos vacíos, no credenciales.
- Manejo de errores: los servicios envuelven errores y la UI muestra mensajes; el mensaje de autenticación incorpora el `message` recibido de Supabase y requiere revisar exposición de detalle en un entorno real.

## Brechas frente a la rúbrica existente

La rúbrica y documentación heredadas indican como pendientes o no verificadas:

- validación real de SQL, RLS, Realtime y colaboración multiusuario;
- ejecución de la prueba pgTAP de `supabase/tests/20261112000300_security_integrity.sql`;
- creación/asignación de proyectos y miembros desde la interfaz;
- confirmación de aislamiento cross-project contra una instancia Supabase real;
- evidencia de una optimización del bundle o code splitting;
- implementación de comentarios en la interfaz, aunque el esquema y tipos existen;
- coherencia terminológica pendiente entre la rúbrica (`TaskList`/`taskService.ts`) y el código actual (`TaskBoard`/`tasks.service.ts`).

Estas brechas son estado de línea base, no correcciones aplicadas en este prompt.

## Herramienta estructural

`graphify` se ejecutó en modo local `--code-only --no-viz` porque no había clave LLM y no se debían crear credenciales. Generó `graphify-out/graph.json` con 239 nodos, 429 relaciones y 12 comunidades. El parser opcional de SQL no estaba instalado; por eso las migraciones SQL se revisaron directamente y no se infieren relaciones AST de SQL.
