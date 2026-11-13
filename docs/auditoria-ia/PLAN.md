# Plan de etapas siguientes

Este plan no ejecuta cambios en el Prompt 02. Define trabajo posterior y criterios de aceptación.

## Etapa 1 — Validación de seguridad SQL/RLS

Acciones futuras:

- Levantar o seleccionar una instancia Supabase aislada y autorizada para laboratorio.
- Aplicar las migraciones en orden únicamente a esa instancia.
- Ejecutar la prueba SQL de integridad/RLS con fixtures de owner, admin, member, viewer y usuario externo.
- Validar SEC-01 y SEC-02 con permisos efectivos y confirmar el aislamiento cross-project.
- Ejecutar `supabase/tests/20261113000100_security_hardening.sql` en la misma instancia de pruebas.

Criterios de aceptación:

- Las pruebas negativas cross-project no leen, actualizan ni eliminan datos.
- Las mutaciones permitidas por rol funcionan.
- Las funciones de trigger no tienen ejecución pública innecesaria.
- El modelo de transferencia/promoción de roles queda documentado y probado.

Estado actual: migración y pruebas preparadas localmente; ejecución real pendiente.

## Etapa 2 — Revisión de variables y errores

Acciones futuras:

- Fortalecer las reglas de exclusión de `.env` preservando `.env.example`.
- Probar que una clave publishable funciona y que claves privilegiadas son rechazadas antes de crear el cliente.
- Definir mensajes de error de autenticación genéricos y pruebas para no filtrar detalles operativos.

Criterios de aceptación:

- No hay archivos de entorno con secretos en Git.
- Existen pruebas para variables ausentes, publishable, anon legacy y service role.
- La UI no expone detalles no necesarios de proveedores.

Estado actual: exclusión de `.env` corregida; mensajes del proveedor siguen pendientes de decisión y prueba real.

## Etapa 3 — Optimización del bundle

Estado: completada localmente en Prompt 04.

- `AuthForm` y `Dashboard` se cargan con `React.lazy` desde `src/App.tsx`.
- `TaskBoard` se carga de forma diferida desde `src/components/Dashboard.tsx`.
- Los fallbacks `Suspense` conservan una interfaz visible durante la carga.
- Build posterior: 4 chunks JS; entry de 440.883 B raw y 124.497 B gzip.
- La medición completa y sus limitaciones están en `PERFORMANCE_REPORT.md`.
- No se midieron Core Web Vitals.

Siguiente criterio pendiente: decidir si una futura etapa justifica convertir la inicialización de Supabase en asíncrona para retirar `@supabase/supabase-js` del entry. No forma parte de este prompt.

## Etapa 4 — Validación final y evidencias

Estado: completada localmente en Prompt 05.

- Build, lint y 35 pruebas automatizadas pasan.
- Se verificaron estáticamente las migraciones de hardening, variables y ausencia de claves privilegiadas.
- Se reconstruyó el grafo AST local: 253 nodos y 455 relaciones.
- Se confirmó el code splitting y la procedencia de las mediciones antes/después.
- `VALIDATION_REPORT.md` clasifica cada criterio como demostrado, parcialmente demostrado o pendiente.
- RLS dinámico, Supabase real, Realtime multiusuario, SQL/pgTAP y Core Web Vitals siguen pendientes por restricciones de entorno.

No se inicia el informe final ni una etapa adicional automáticamente.

## Etapa 5 — Entregables finales

Estado: completada localmente en Prompt 06.

- Se crearon `INFORME_FINAL.md`, `OPTIMIZACION_FINAL.md`, `CODIGO_MEJORADO.md` y `ENTREGA_CHECKLIST.md`.
- Las cifras de bundle fueron cotejadas con `PERFORMANCE_REPORT.md` y `VALIDATION_REPORT.md`.
- Los entregables distinguen auditoría estática de validación dinámica.
- Se documentó que el Prompt 03 termina en “Evidencia que lo” y que el fragmento restante no es recuperable.
- No se modificó código funcional, SQL, Supabase remoto, credenciales ni el repositorio original.

El laboratorio queda listo para revisión académica; no se crea un informe adicional ni se inicia otra etapa automáticamente.

## Etapa 4 — Rendimiento del bundle

Acciones futuras:

- Mantener la medición de esta línea base como comparación.
- Evaluar separación de rutas o superficies de carga solo si la aplicación crece; actualmente no existe router.
- Introducir code splitting únicamente después de definir límites de carga y criterios de regresión.
- Medir nuevamente raw/gzip y validar que la funcionalidad y las pruebas no regresen.

Criterios de aceptación:

- La estrategia de carga está justificada por mediciones.
- El tamaño JavaScript inicial no aumenta sin una razón documentada.
- Build, lint y tests siguen pasando.

## Etapa 5 — Cobertura y rúbrica

Acciones futuras:

- Ejecutar pruebas de dos sesiones y Realtime en instancia aislada.
- Resolver la brecha de gestión de proyectos/membresías si la rúbrica la exige.
- Alinear nombres documentales (`TaskBoard`/`tasks.service.ts`) con el código real.
- Revisar si comentarios requieren una interfaz funcional o solo soporte de datos.

Criterios de aceptación:

- Cada requisito de la rúbrica tiene evidencia ejecutada o una dependencia externa claramente marcada.
- No se declara validación real mientras no exista una ejecución reproducible.

## Restricciones mantenidas

Hasta recibir autorización explícita para la siguiente etapa no se modifican políticas RLS, no se ejecutan migraciones remotas, no se introducen `React.lazy`/`Suspense`, no se optimiza el bundle y no se hacen commits o pushes.
