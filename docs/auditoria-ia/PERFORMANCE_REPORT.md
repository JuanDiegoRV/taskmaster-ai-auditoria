# Informe de rendimiento y code splitting — Prompt 04

Fecha: 2026-11-13 (America/Bogota)

## Alcance

Se trabajó exclusivamente en `taskmaster-ai-auditoria`. No se modificó Supabase, no se ejecutaron migraciones y no se modificó el repositorio original.

## Método de medición

1. Se ejecutó `npm run build` antes del cambio para reproducir la línea base.
2. Se verificó que el resultado previo coincidiera con `docs/auditoria-ia/BASELINE.md`.
3. Se ejecutó `npm run build` después de implementar `React.lazy` y `Suspense`.
4. Se enumeraron directamente los archivos `dist/assets/*.js` y `*.css`.
5. El gzip se calculó sobre cada archivo real con `.NET GZipStream`. Las cifras gzip de esta tabla usan el mismo método antes y después.

No se midieron Core Web Vitals ni rendimiento en navegador; este informe solo compara artefactos de build.

## Comparación reproducible

| Métrica | Antes | Después | Variación |
|---|---:|---:|---:|
| Chunks JavaScript | 1 | 4 | +3 chunks |
| JavaScript total raw | 449.655 B | 452.681 B | +3.026 B |
| JavaScript total gzip | 126.888 B | 129.108 B | +2.220 B |
| Chunk de entrada raw | 449.655 B | 440.883 B | **−8.772 B (−1,95%)** |
| Chunk de entrada gzip | 126.888 B | 124.497 B | **−2.391 B (−1,88%)** |
| CSS total raw | 4.333 B | 4.333 B | sin cambio |
| CSS total gzip | 1.527 B | 1.527 B | sin cambio |

### Procedencia de la línea base

El build previo reprodujo exactamente los valores documentados:

- `dist/assets/index-DK_5swlC.js`: 449.655 B raw, 126.888 B gzip.
- `dist/assets/index-1awJgQJZ.css`: 4.333 B raw, 1.527 B gzip.
- 1 chunk JavaScript.

### Archivos posteriores

| Archivo | Papel | Raw | gzip |
|---|---|---:|---:|
| `index-FMJi4Q88.js` | Entrada, autenticación y runtime compartido | 440.883 B | 124.497 B |
| `AuthForm-CuMT7dmG.js` | Vista de autenticación diferida | 1.056 B | 561 B |
| `Dashboard--9B5z5Om.js` | Workspace y proyectos diferidos | 3.710 B | 1.513 B |
| `TaskBoard-D7bsQGGP.js` | Tablero, CRUD y Realtime diferidos | 7.032 B | 2.537 B |
| `index-1awJgQJZ.css` | CSS total | 4.333 B | 1.527 B |

## Qué se cargó inicialmente

La entrada todavía contiene `useAuth`, `auth.service` y el cliente Supabase porque la sesión se comprueba al arrancar. Por eso `@supabase/supabase-js` sigue contribuyendo al chunk de entrada.

- Ruta no autenticada: entrada + `AuthForm-CuMT7dmG.js` cuando termina la comprobación de sesión, más CSS.
- Ruta autenticada sin proyecto seleccionado: entrada + `Dashboard--9B5z5Om.js`, más CSS.
- Ruta autenticada con proyecto seleccionado: se añade `TaskBoard-D7bsQGGP.js` cuando el workspace necesita el tablero.

El total de todos los chunks no representa el JavaScript descargado en la primera pantalla. La mejora comprobable es la reducción del chunk de entrada y la separación de las vistas no necesarias para la comprobación inicial.

## Implementación

`src/App.tsx` usa `lazy` para `AuthForm` y `Dashboard`, con `Suspense` y fallbacks visibles. `src/components/Dashboard.tsx` conserva la selección de proyectos y usa un segundo `lazy` para `TaskBoard`.

```tsx
const Dashboard = lazy(() => import('./components/Dashboard'))
const TaskBoard = lazy(() => import('./TaskBoard').then(({ TaskBoard }) => ({ default: TaskBoard })))
```

No se agregaron rutas artificiales ni `react-router-dom`. En esta aplicación `App` funciona como router de estado: sesión no autenticada versus workspace autenticado. Las vistas diferidas corresponden a esos estados reales.

No se añadió `manualChunks`: Vite ya separó correctamente los imports dinámicos en cuatro chunks y no se justificó una fragmentación manual adicional.

## Dependencias

No se eliminaron ni reemplazaron dependencias. `@supabase/supabase-js` permanece en la entrada porque Auth necesita consultar la sesión al inicio. Moverlo completamente fuera del entry exigiría convertir el contrato de cliente/servicios en asíncrono y sería un cambio desproporcionado para esta etapa.

## Pruebas

- `npm run build`: correcto; 73 módulos transformados, 4 chunks JavaScript.
- `npm run lint`: correcto.
- `npm run test`: correcto; 9 archivos y 35 pruebas aprobadas.
- `src/test/app.test.tsx`: verifica integración después de cargas diferidas y transición de cierre de sesión.
- `src/test/dashboard.test.tsx`: verifica que el tablero diferido aparece y conserva el contrato de `useTasks`.
- Las pruebas existentes de AuthForm, ProjectPicker, TaskBoard y hooks siguen pasando.

## Beneficios y limitaciones

Beneficios:

- El chunk de entrada disminuyó 8.772 B raw y 2.391 B gzip.
- AuthForm, workspace y TaskBoard tienen archivos diferidos observables en `dist/assets`.
- El tablero no se descarga hasta que existe un proyecto seleccionado.
- Los fallbacks evitan una pantalla vacía durante la carga dinámica.

Limitaciones:

- El JavaScript total generado aumenta ligeramente por el overhead de chunks.
- Supabase sigue en la entrada por la comprobación inicial de sesión.
- No hay mediciones de navegador ni afirmaciones sobre Core Web Vitals.
- La optimización adicional de Supabase requeriría rediseñar APIs asíncronas y debe tratarse como una etapa separada.
