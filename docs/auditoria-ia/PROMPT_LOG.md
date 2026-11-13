# Auditoría IA — Prompt 01: Crear copia independiente de TaskMaster AI

Actúa como arquitecto de software y asistente de desarrollo.

Vamos a realizar un nuevo laboratorio académico llamado "Proyecto Integrador: Auditoría de IA y Optimización Final".

Usaremos TaskMaster AI como aplicación base, pero debemos trabajar en una copia independiente para no afectar el laboratorio anterior.

## Rutas

Proyecto original:\
C:\Users\strik\OneDrive\Documentos\SWNT\taskmaster-ai

Proyecto nuevo:\
C:\Users\strik\OneDrive\Documentos\SWNT\taskmaster-ai-auditoria

## Tareas

1. Verifica que exista el proyecto original y que sea una aplicación React + Vite + Supabase.
2. Comprueba que la carpeta de destino no exista. Si ya existe, detente y solicita autorización; no sobrescribas archivos.
3. Crea una copia completa del código fuente y los archivos necesarios para ejecutar la aplicación.
4. Excluye de la copia:
   - `node_modules`
   - `dist`
   - `.env.local`
   - cualquier otro archivo `.env` con credenciales reales
   - archivos temporales y cachés.
5. Conserva `package.json`, el archivo de bloqueo de dependencias, `src`, `public`, `supabase`, configuraciones, pruebas y documentación existente.
6. No copies la carpeta `.git` del proyecto original.
7. No modifiques ningún archivo dentro del proyecto original.
8. Inicializa un repositorio Git local nuevo en la copia, sin configurar remotos ni hacer commits.
9. Crea en la copia `docs/auditoria-ia/PROMPT_LOG.md` y registra íntegramente este prompt.
10. Crea `docs/auditoria-ia/PROJECT_SCOPE.md` explicando que este nuevo trabajo auditará seguridad, RLS, variables de entorno y rendimiento del bundle, tomando TaskMaster AI como caso práctico del escenario EcoMart.

## Validaciones

- Comprueba que el código y los archivos necesarios estén presentes en la copia.
- Verifica que el repositorio original no haya cambiado.
- Verifica que no se hayan copiado credenciales ni archivos sensibles.
- No ejecutes migraciones SQL ni modifiques Supabase remoto.
- No instales dependencias todavía.
- No hagas commit ni push.
- No comiences la auditoría de seguridad ni la optimización.

## Entrega

Informa:

- Ruta exacta de la copia creada.
- Archivos y carpetas principales copiados.
- Exclusiones realizadas.
- Estado del nuevo repositorio Git.
- Confirmación de que el proyecto original quedó intacto.

Detente al finalizar y espera mi siguiente instrucción.

---

# Auditoría IA — Prompt 02: Diagnóstico técnico y línea base

Trabaja exclusivamente en:

C:\Users\strik\OneDrive\Documentos\SWNT\taskmaster-ai-auditoria

Estamos realizando el laboratorio académico "Proyecto Integrador: Auditoría de IA y Optimización Final", utilizando TaskMaster AI como aplicación base.

## Objetivo

Establecer una línea base verificable de seguridad, arquitectura, rendimiento y pruebas antes de implementar cambios.

NO debes corregir vulnerabilidades ni optimizar el código todavía.

## 1. Preparación

1. Confirma que estás trabajando en `taskmaster-ai-auditoria`.
2. Verifica que el proyecto original `taskmaster-ai` no será modificado.
3. Ejecuta `npm ci` para instalar exactamente las dependencias del archivo de bloqueo.
4. Verifica que `node_modules` y `dist` estén excluidos de Git.

## 2. Arquitectura

Inspecciona:

- `package.json`
- `vite.config.ts`
- `src/App.tsx`
- Componentes React.
- Hooks y servicios.
- Configuración de Supabase.
- Migraciones SQL y políticas RLS.
- Sistema de rutas, si existe.

Identifica cómo se organiza la aplicación y qué módulos se cargan inicialmente.

## 3. Línea base de rendimiento

Ejecuta:

- `npm run build`
- `npm run lint`
- `npm run test`

Registra los resultados exactos.

Analiza los archivos generados en `dist/assets` e informa:

- Tamaño total de JavaScript sin comprimir.
- Tamaño total de JavaScript gzip.
- Tamaño total de CSS.
- Tamaño del archivo JavaScript más grande.
- Dependencias que probablemente contribuyen al peso inicial.
- Si existe o no code splitting.
- Si se utiliza React.lazy y Suspense.

Obtén mediciones reales de los archivos generados. No simules cifras ni inventes resultados.

No instales herramientas adicionales de análisis sin autorización. Si no es posible identificar qué dependencias pesan más, indícalo.

## 4. Auditoría estática preliminar

Examina:

- Autenticación y manejo de sesiones.
- Formularios React.
- Posibles riesgos XSS.
- Uso de supabase-js.
- Políticas RLS de las migraciones.
- Protección de datos entre proyectos.
- Variables de entorno.
- Posible exposición de claves privilegiadas.
- Validación de entradas.
- Manejo de errores.

Para cada hallazgo indica:

- Archivo y ubicación.
- Descripción técnica.
- Severidad justificada.
- Evidencia concreta.
- Posible impacto.
- Corrección recomendada.
- Si está confirmado, es potencial o requiere pruebas contra Supabase real.

No inventes tres vulnerabilidades críticas si no existen. Distingue problemas de seguridad de mejoras generales.

## 5. Documentación

Dentro de `docs/auditoria-ia/` crea:

- `BASELINE.md`: arquitectura, resultados de pruebas y mediciones iniciales.
- `SECURITY_FINDINGS.md`: hallazgos preliminares con evidencias.
- `PLAN.md`: etapas siguientes y criterios de aceptación.

Actualiza `PROMPT_LOG.md` incorporando íntegramente este prompt y registrando las operaciones ejecutadas.

No modifiques documentación de otros laboratorios salvo que sea estrictamente necesario.

## Restricciones

- No modificar código funcional.
- No aplicar correcciones.
- No introducir React.lazy ni Suspense todavía.
- No modificar políticas RLS.
- No ejecutar SQL remoto.
- No conectar el proyecto a Supabase real.
- No crear credenciales.
- No hacer commits ni push.
- No avanzar a la siguiente etapa.

## Entrega

Presenta:

1. Confirmación de la ruta auditada.
2. Resultados de build, lint y tests.
3. Tabla de tamaños iniciales del bundle.
4. Hallazgos de seguridad clasificados por severidad.
5. Dependencias y módulos candidatos a optimización.
6. Brechas respecto a la rúbrica.
7. Archivos de documentación creados.

Detente al finalizar el diagnóstico y espera instrucciones.

## Registro de operaciones ejecutadas

- Se confirmó el directorio de trabajo y la existencia de `taskmaster-ai-auditoria`.
- Se verificó que `node_modules` y `dist` están ignorados por Git.
- Se confirmó que el estado del repositorio original no fue modificado.
- Se ejecutó `graphify . --no-viz`; el modo semántico se detuvo por ausencia de clave LLM, sin crear credenciales.
- Se ejecutó `graphify . --code-only --no-viz`; generó `graphify-out/graph.json` con 239 nodos, 429 relaciones y 12 comunidades. El parser SQL opcional no estaba instalado; las migraciones se inspeccionaron directamente.
- Se ejecutó `npm ci`: éxito, 104 paquetes añadidos, 105 auditados, 0 vulnerabilidades reportadas.
- Se ejecutó `npm run build`: éxito, 71 módulos transformados.
- Se ejecutó `npm run lint`: éxito, sin errores.
- Se ejecutó `npm run test`: éxito, 8 archivos y 34 pruebas aprobadas.
- Se midieron los archivos de `dist/assets` con sus tamaños reales y gzip local.
- Se inspeccionaron componentes, hooks, servicios, configuración Supabase, migraciones, políticas RLS, pruebas y documentación de rúbrica.
- Se crearon `BASELINE.md`, `SECURITY_FINDINGS.md` y `PLAN.md`.
- No se modificó código funcional, no se ejecutó SQL, no se conectó Supabase remoto, no se instaló una herramienta adicional, no se hizo commit ni push.

---

# Auditoría IA — Prompt 03: Seguridad, RLS y correcciones verificables

Trabaja EXCLUSIVAMENTE en:

C:\Users\strik\OneDrive\Documentos\SWNT\taskmaster-ai-auditoria

Estamos realizando el laboratorio académico "Proyecto Integrador: Auditoría de IA y Optimización Final".

La etapa de diagnóstico ya terminó. Consulta:

- docs/auditoria-ia/BASELINE.md
- docs/auditoria-ia/SECURITY_FINDINGS.md
- docs/auditoria-ia/PLAN.md
- docs/auditoria-ia/PROMPT_LOG.md

## Objetivo

Realizar una auditoría de seguridad profunda, corregir los problemas demostrables y documentar evidencias antes/después para cumplir la rúbrica académica.

## 1. Verificación de hallazgos

Investiga específicamente:

A. Funciones SECURITY DEFINER

- Identifica todas las funciones SECURITY DEFINER en las migraciones.
- Examina sus permisos EXECUTE, propietarios, search_path y posibles rutas de abuso.
- Distingue funciones utilizadas exclusivamente por triggers de funciones RPC necesarias para las políticas RLS.
- No revoques permisos de funciones que deban ser invocables por usuarios autenticados sin estudiar sus dependencias.
- Determina qué exposición puede demostrarse y cuál requiere pruebas SQL reales.

B. Escalada de privilegios en membresías

- Examina las políticas RLS de project_members.
- Determina si un administrador puede crear o modificar membresías con role='owner'.
- Comprueba si existe alguna restricción que impida asignar ese rol a personas distintas del propietario real.
- Diseña la corrección mínima que mantenga las operaciones legítimas.

C. Variables de entorno

- Revisa .gitignore y archivos de configuración.
- Asegura que archivos .env con valores reales no puedan añadirse accidentalmente.
- Conserva .env.example.
- Comprueba que no existan claves secretas en el frontend.

D. Autenticación y formularios

- Revisa los componentes y servicios de autenticación.
- Investiga riesgos reales de XSS, exposición de información, validación de entradas y manejo de sesiones.
- Corrige únicamente problemas sustentados por evidencia.
- No introduzcas sanitización innecesaria que interfiera con el escape automático de React.

E. Otros controles

- Examina si hay políticas RLS excesivamente permisivas.
- Revisa el aislamiento entre proyectos.
- Comprueba que la actualización de campos sensibles esté protegida.
- Busca otras vulnerabilidades relevantes sin inventar hallazgos.

## 2. Implementación

- Aplica correcciones mínimas y justificadas.
- Para cambios SQL, crea una nueva migración posterior a las existentes.
- No reescribas migraciones históricas.
- Conserva compatibilidad con los servicios y hooks actuales.
- No debilites RLS.
- No ejecutes SQL remoto.

## 3. Pruebas

Añade pruebas automatizadas para las correcciones cuando sea posible.

Para cambios SQL:

- Prepara pruebas de seguridad ejecutables en un entorno Supabase de pruebas.
- Incluye intentos de acceso no autorizado y operaciones legítimas.
- Si no hay instancia SQL disponible, marca las pruebas como preparadas y no ejecutadas.
- No afirmes que RLS fue validado realmente sin ejecutarlo contra PostgreSQL.

Ejecuta:

- npm run build
- npm run lint
- npm run test

Reporta cifras exactas.

## 4. Documentación académica

Actualiza:

- docs/auditoria-ia/SECURITY_FINDINGS.md
- docs/auditoria-ia/PROMPT_LOG.md
- docs/auditoria-ia/PLAN.md

Crea:

docs/auditoria-ia/SECURITY_REMEDIATION.md

Para cada hallazgo documenta:

1. Código o política original.
2. Riesgo e impacto.
3. Severidad justificada.
4. Evidencia que lo

## Registro de operaciones ejecutadas

- Se volvió a leer la instrucción de `graphify` y se consultó el grafo existente para ubicar el cliente Supabase, servicios y hooks relacionados.
- Se inspeccionaron todas las declaraciones `SECURITY DEFINER`, políticas de `project_members`, configuración de variables, formularios, servicios y migraciones.
- Se confirmó que `is_project_member` y `has_project_role` son helpers necesarios para RLS y no se revocaron.
- Se creó la migración `supabase/migrations/20261113000100_security_hardening.sql` sin modificar migraciones históricas.
- Se creó la prueba preparada `supabase/tests/20261113000100_security_hardening.sql`; no se ejecutó por ausencia de PostgreSQL/Supabase local.
- Se reforzó `.gitignore` para excluir `.env` y `.env.*`, conservando `.env.example`.
- Se creó `docs/auditoria-ia/SECURITY_REMEDIATION.md` y se actualizaron `SECURITY_FINDINGS.md` y `PLAN.md`.
- El resto del prompt recibido quedó registrado literalmente hasta su final incompleto: “Evidencia que lo”.

La búsqueda en los registros locales de la sesión también confirma que el Prompt 03 termina exactamente en ese fragmento. No se inventa ni se reconstruye el texto faltante.

---

# Auditoría IA — Prompt 04: Optimización de bundle y Code Splitting

Trabaja EXCLUSIVAMENTE en:

C:\Users\strik\OneDrive\Documentos\SWNT\taskmaster-ai-auditoria

Estamos realizando el laboratorio académico "Proyecto Integrador: Auditoría de IA y Optimización Final".

## Objetivo

Optimizar el JavaScript inicial de TaskMaster AI utilizando técnicas justificadas de code splitting, React.lazy y Suspense, conservando toda la funcionalidad.

Debemos demostrar los resultados mediante una comparación reproducible antes/después.

## 1. Verificación de línea base

Consulta `docs/auditoria-ia/BASELINE.md`.

Las mediciones iniciales reportadas fueron:

- JavaScript total: 449.655 bytes.
- JavaScript gzip: 126.888 bytes.
- CSS: 4.333 bytes.
- Un único chunk JavaScript.
- 34 pruebas aprobadas.

Verifica que estas cifras correspondan al build inicial y conserva su procedencia.

## 2. Análisis técnico

Inspecciona:

- src/App.tsx
- src/components/
- src/hooks/
- src/services/
- vite.config.ts
- package.json

Identifica qué código necesita la pantalla de autenticación y qué módulos pueden cargarse posteriormente.

Analiza si es conveniente separar:

- Pantalla de autenticación.
- Selector de proyectos.
- Tablero de tareas.
- Dependencias de Supabase.
- Otros módulos pesados.

No agregues rutas artificiales únicamente para aparentar cumplimiento.

Si el proyecto no utiliza react-router-dom, aplica React.lazy y Suspense a las pantallas o vistas principales de la arquitectura existente y explica por qué es equivalente para esta aplicación.

## 3. Implementación

1. Implementa React.lazy y Suspense para cargar diferidamente las vistas que no se necesiten al inicio.
2. Conserva los estados de carga y error.
3. Evita introducir parpadeos o pantallas vacías durante las transiciones.
4. Evalúa si la configuración de Vite necesita ajustes de chunks.
5. Si propones manualChunks, evita dependencias circulares y fragmentación excesiva.
6. No instales librerías adicionales sin una justificación técnica clara.
7. No elimines funcionalidades.
8. Conserva autenticación, selección de proyectos, CRUD y Realtime.
9. No modifiques migraciones SQL ni políticas RLS.

## 4. Medición después de optimizar

Ejecuta:

- npm run build
- npm run lint
- npm run test

Mide los archivos reales de dist/assets.

Compara:

- Número de chunks JavaScript.
- JavaScript total sin comprimir.
- JavaScript total gzip.
- JavaScript del chunk de entrada sin comprimir y gzip.
- CSS total.
- Dependencias eliminadas o reemplazadas, si aplica.

IMPORTANTE:

No confundas el tamaño total de todos los chunks con el JavaScript descargado inicialmente.

Distingue entre:

- Bundle total generado.
- Chunk de entrada.
- Dependencias cargadas inicialmente.
- Chunks diferidos.

Si el chunk de entrada carga otros chunks mediante imports estáticos, inclúyelos en la estimación de carga inicial.

No afirmes mejoras en Core Web Vitals sin mediciones de navegador.

## 5. Pruebas

Actualiza o añade pruebas para verificar:

- Pantalla de autenticación.
- Carga diferida del tablero.
- Transiciones entre estados.
- Funcionamiento de las operaciones existentes.
- Ausencia de regresiones en los hooks.

## 6. Documentación

Crea:

docs/auditoria-ia/PERFORMANCE_REPORT.md

Incluye:

- Tabla antes/después.
- Método de medición.
- Archivos generados.
- Explicación del code splitting.
- Fragmentos relevantes de código.
- Beneficios y limitaciones.
- Resultados de pruebas.

Actualiza:

- docs/auditoria-ia/PLAN.md
- docs/auditoria-ia/PROMPT_LOG.md

Corrige también el registro incompleto del Prompt 03 en PROMPT_LOG.md utilizando el texto íntegro disponible en esta conversación o en los registros locales. Si no puedes recuperar el texto completo, no lo inventes: señala explícitamente el fragmento faltante para que pueda proporcionártelo.

Registra íntegramente este Prompt 04.

## Restricciones

- No modificar el repositorio original.
- No modificar Supabase remoto.
- No ejecutar migraciones.
- No hacer commit ni push.
- No comenzar el informe final.
- No avanzar automáticamente a otra etapa.

## Entrega

Reporta:

1. Archivos modificados.
2. Técnicas de optimización implementadas.
3. Comparativa numérica antes/después.
4. Resultados exactos de build, lint y tests.
5. Evidencia de carga diferida.
6. Problemas o limitaciones pendientes.

Detente al finalizar.

## Registro de operaciones ejecutadas

- Se verificó el build pre-optimización: 1 chunk JS, 449.655 B raw, 126.888 B gzip y 4.333 B CSS raw.
- Se inspeccionaron `App.tsx`, componentes, hooks, servicios, `vite.config.ts` y `package.json`.
- Se creó `src/components/Dashboard.tsx` para encapsular el workspace autenticado.
- Se aplicó `React.lazy`/`Suspense` a `AuthForm`, `Dashboard` y `TaskBoard`, sin agregar rutas artificiales.
- Se actualizaron las pruebas de `App` para esperar las cargas dinámicas y se creó `src/test/dashboard.test.tsx`.
- Se ejecutaron build, lint y tests posteriores.
- Se midieron directamente los archivos reales de `dist/assets` y sus tamaños gzip.
- Se creó `docs/auditoria-ia/PERFORMANCE_REPORT.md` y se actualizó `PLAN.md`.
- Se verificó que el Prompt 03 termina en “Evidencia que lo” tanto en el workspace como en los registros locales; no se inventó el fragmento faltante.
- No se modificó Supabase, no se ejecutaron migraciones, no se modificó el repositorio original, no se hizo commit ni push.

---

# Auditoría IA — Prompt 05: Validación final y evidencias

Trabaja exclusivamente en:

C:\Users\strik\OneDrive\Documentos\SWNT\taskmaster-ai-auditoria

Estamos realizando el laboratorio "Proyecto Integrador: Auditoría de IA y Optimización Final".

## Objetivo

Validar las correcciones de seguridad y la optimización del bundle, recopilar evidencia reproducible y preparar la información para los entregables académicos.

No redactes todavía el informe final.

## 1. Verificación de seguridad

Revisa las migraciones y correcciones implementadas.

Comprueba estáticamente:

- Restricción de asignación del rol owner.
- Permisos EXECUTE de funciones SECURITY DEFINER.
- Compatibilidad de los helpers con RLS.
- Exclusión de credenciales en Git.
- Ausencia de claves privilegiadas en frontend.
- Protección de campos sensibles.
- Aislamiento de proyectos.

Identifica las pruebas que se pueden ejecutar localmente y las que requieren PostgreSQL o Supabase real.

No afirmes que una política RLS fue validada dinámicamente si solo se inspeccionó su código.

## 2. Validación del rendimiento

Revisa la implementación de React.lazy y Suspense.

Verifica:

- Que el Dashboard se cargue únicamente cuando corresponda.
- Que TaskBoard sea diferido.
- Que los fallbacks sean visibles.
- Que no existan imports estáticos que anulen la carga diferida.
- Que el entry chunk y sus dependencias estáticas se contabilicen correctamente.
- Que las mediciones antes/después sean reproducibles.

Si es posible, usa una herramienta local ya disponible para inspeccionar el grafo de imports y documenta qué se descarga inicialmente.

No instales herramientas adicionales sin autorización.

## 3. Validación funcional

Ejecuta:

- npm run build
- npm run lint
- npm run test

Revisa si existen pruebas suficientes para:

- Inicio y cierre de sesión.
- Cambio de proyecto.
- CRUD de tareas.
- Realtime.
- Carga diferida.
- Limpieza de suscripciones.

Si identificas una prueba esencial faltante, impleméntala sin alterar funcionalidades.

## 4. Evidencia para la rúbrica

Crea:

docs/auditoria-ia/VALIDATION_REPORT.md

Incluye:

- Tabla de criterios de la rúbrica.
- Evidencia concreta por criterio.
- Referencias a archivos y funciones.
- Resultados de pruebas.
- Comparación de bundle.
- Limitaciones pendientes.
- Estado: demostrado, parcialmente demostrado o pendiente.

No inventes resultados de navegador, Lighthouse, Core Web Vitals ni Supabase real.

## 5. Bitácora

Actualiza:

- docs/auditoria-ia/PROMPT_LOG.md
- docs/auditoria-ia/PLAN.md

Registra este prompt íntegramente.

Respecto al Prompt 03, deja documentado que su registro disponible termina en “Evidencia que lo”. No inventes el contenido restante.

## Restricciones

- No modificar el proyecto original.
- No ejecutar migraciones remotas.
- No modificar credenciales.
- No hacer commit ni push.
- No redactar el informe final.
- No avanzar automáticamente.

## Entrega

Reporta:

1. Resultados exactos de build, lint y tests.
2. Estado de seguridad y pruebas SQL.
3. Verificación del code splitting.
4. Evidencias reunidas.
5. Criterios de la rúbrica aún incompletos.
6. Archivos creados o modificados.

Detente al finalizar.

## Registro de operaciones ejecutadas

- Se revisaron `BASELINE.md`, `SECURITY_FINDINGS.md`, `SECURITY_REMEDIATION.md`, `PERFORMANCE_REPORT.md` y `PLAN.md`.
- Se reconstruyó el grafo local con `graphify . --code-only --no-viz`: 253 nodos y 455 relaciones; el parser SQL opcional no está instalado.
- Se inspeccionaron estáticamente las políticas RLS, revocaciones `EXECUTE`, helpers, `.gitignore`, variables y claves del frontend.
- Se verificaron `App → Dashboard` y `Dashboard → TaskBoard` como imports dinámicos; no hay imports estáticos equivalentes que anulen el splitting.
- Se ejecutó `npm run build`: éxito, 73 módulos transformados y 4 chunks JavaScript.
- Se ejecutó `npm run lint`: éxito.
- Se ejecutó `npm run test -- --reporter=verbose`: 9 archivos y 35 pruebas aprobadas en 3.99 s.
- Se creó `docs/auditoria-ia/VALIDATION_REPORT.md` y se actualizó `PLAN.md`.
- Se confirmó que el Prompt 03 termina en “Evidencia que lo” en el workspace y en los registros locales; no se inventó el contenido faltante.
- No se ejecutó SQL remoto, no se modificó Supabase, no se modificaron credenciales, no se hizo commit ni push y no se modificó el proyecto original.

---

# Auditoría IA — Prompt 06: Entregables finales del laboratorio

Trabaja exclusivamente en:

C:\Users\strik\OneDrive\Documentos\SWNT\taskmaster-ai-auditoria

Estamos finalizando el laboratorio académico "Proyecto Integrador: Auditoría de IA y Optimización Final".

## Objetivo

Crear los tres entregables solicitados por la rúbrica, utilizando exclusivamente los resultados verificables del proyecto y su documentación.

## Fuentes obligatorias

Consulta:

- docs/auditoria-ia/BASELINE.md
- docs/auditoria-ia/SECURITY_FINDINGS.md
- docs/auditoria-ia/SECURITY_REMEDIATION.md
- docs/auditoria-ia/PERFORMANCE_REPORT.md
- docs/auditoria-ia/VALIDATION_REPORT.md
- docs/auditoria-ia/PROMPT_LOG.md
- Migraciones SQL y código React modificado.

## Entregable 1: Informe de auditoría

Crea:

docs/auditoria-ia/INFORME_FINAL.md

Debe contener:

1. Portada con nombre del laboratorio, aplicación auditada y campos editables para estudiante y fecha.
2. Resumen ejecutivo.
3. Descripción de la arquitectura React, Vite y Supabase.
4. Metodología de auditoría asistida por IA.
5. Tres hallazgos de seguridad relevantes, priorizados por severidad real.
6. Evidencia técnica de cada hallazgo.
7. Correcciones implementadas.
8. Comparación antes/después.
9. Limitaciones de la validación.
10. Conclusiones y recomendaciones.
11. Referencias a los archivos y pruebas del repositorio.

No clasifiques vulnerabilidades como críticas sin evidencia suficiente.

Distingue explícitamente auditoría estática de validación dinámica.

## Entregable 2: Optimización del bundle

Crea:

docs/auditoria-ia/OPTIMIZACION_FINAL.md

Incluye la tabla:

Antes:

- 1 chunk JS.
- JS total: 449.655 bytes raw y 126.888 bytes gzip.
- Entry: 449.655 bytes raw y 126.888 bytes gzip.

Después:

- 4 chunks JS.
- JS total: 452.681 bytes raw y 129.108 bytes gzip.
- Entry: 440.883 bytes raw y 124.497 bytes gzip.

Explica:

- React.lazy.
- Suspense.
- Imports dinámicos.
- Separación de Dashboard y TaskBoard.
- Por qué el JS total aumentó ligeramente.
- Por qué la reducción del entry no demuestra por sí sola una mejora en Core Web Vitals.
- Por qué no fue necesario modificar vite.config.ts.

No inventes métricas Lighthouse.

## Entregable 3: Fragmento refactorizado

Crea:

docs/auditoria-ia/CODIGO_MEJORADO.md

Selecciona un ejemplo real de:

- Una política RLS corregida, o
- Un componente React refactorizado.

Incluye:

- Código anterior.
- Código posterior.
- Archivo de origen.
- Explicación técnica.
- Riesgo o problema resuelto.
- Validación disponible.

Los fragmentos deben corresponder exactamente al código del repositorio.

## Evidencia de IA y rúbrica

Crea:

docs/auditoria-ia/ENTREGA_CHECKLIST.md

Incluye:

- Los tres entregables.
- Ubicación de los archivos.
- Evidencia del diálogo iterativo con Codex.
- Pruebas realizadas.
- Limitaciones.
- Estado de cada criterio de la rúbrica.

Actualiza:

- docs/auditoria-ia/PLAN.md
- docs/auditoria-ia/PROMPT_LOG.md

Registra íntegramente este Prompt 06.

No inventes la parte faltante del Prompt 03; documenta la limitación.

## Control de calidad

Comprueba que las cifras coincidan en todos los documentos.

Revisa ortografía, estructura, coherencia y referencias internas.

Ejecuta build, lint y tests y reporta los resultados exactos.

## Restricciones

- No modificar código funcional.
- No modificar SQL.
- No conectar Supabase remoto.
- No inventar resultados.
- No hacer commit ni push.
- No modificar el repositorio original.

## Entrega

Informa los documentos creados, resultados de validación y cualquier criterio que permanezca parcialmente demostrado.

Detente al finalizar.

## Registro de operaciones ejecutadas

- Se consultaron las fuentes obligatorias, migraciones SQL y código React modificado.
- Se verificó el grafo local y las relaciones de arquitectura/imports.
- Se crearon `INFORME_FINAL.md`, `OPTIMIZACION_FINAL.md`, `CODIGO_MEJORADO.md` y `ENTREGA_CHECKLIST.md`.
- Se actualizó `PLAN.md` y se registró íntegramente este prompt.
- Se conservaron las cifras: antes 449.655/126.888 B, después 452.681/129.108 B y entry posterior 440.883/124.497 B.
- Se ejecutarán nuevamente build, lint y tests como control final.
- Se mantiene explícitamente la limitación del Prompt 03: termina en “Evidencia que lo”.
- No se modificó código funcional, SQL, Supabase remoto, credenciales ni el repositorio original; no se hizo commit ni push.
