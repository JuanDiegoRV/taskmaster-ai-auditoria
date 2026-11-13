# Hallazgos preliminares de seguridad — Prompt 02

Esta es una revisión estática preliminar. No se ejecutó SQL, no se conectó una instancia Supabase real y no se modificó ninguna política. Las severidades expresan riesgo potencial, no explotación demostrada.

## Resumen antes de la remediación

| ID | Severidad | Estado |
|---|---|---|
| SEC-01 | Media | Potencial; requiere validar privilegios en Supabase real |
| SEC-02 | Media | Potencial; depende del modelo de gobierno esperado para roles |
| SEC-03 | Baja | Brecha preventiva confirmada en configuración, sin secreto presente |
| SEC-04 | Baja | Potencial; requiere observar mensajes reales de Supabase |

## Estado después de la remediación local

- **SEC-01:** corregido en `supabase/migrations/20261113000100_security_hardening.sql`; permisos efectivos pendientes de PostgreSQL/Supabase real.
- **SEC-02:** corregido en las políticas recreadas por la misma migración; pruebas RLS preparadas, no ejecutadas.
- **SEC-03:** corregido en `.gitignore`; `.env.example` se conserva y no hay secretos actuales.
- **SEC-04:** no se modifica; sigue siendo potencial y requiere observar respuestas reales. No se encontró XSS.

No se encontraron vulnerabilidades críticas confirmadas.

## SEC-01 — Funciones `SECURITY DEFINER` de triggers sin revocación explícita

- **Archivo/ubicación:** `supabase/migrations/20261112000100_initial_schema.sql:72-81`, `:104-122` y `:170-181`.
- **Descripción:** `set_updated_at`, `handle_new_user` y `add_project_owner_member` se declaran `SECURITY DEFINER` con `search_path = public`, pero la migración solo revoca explícitamente `is_project_member` y `has_project_role` en las líneas 164-167. No se observa `REVOKE EXECUTE` equivalente para las funciones de trigger.
- **Severidad:** Media, por superficie de privilegios de funciones definidas como invocables por el contexto de seguridad del propietario. El `search_path` fijo y la calificación de objetos son controles positivos, pero no sustituyen una política explícita de ejecución mínima.
- **Evidencia:** Las tres funciones usan `security definer`; no hay revocación posterior para ellas.
- **Impacto posible:** Un rol con permisos de ejecución podría intentar invocar funciones privilegiadas o ampliar la superficie de ataque, aunque una invocación directa de una función de trigger puede fallar por el contexto requerido.
- **Corrección recomendada:** Revocar `EXECUTE` a `public`, `anon` y `authenticated` para las funciones invocadas exclusivamente por triggers, y validar que los triggers sigan funcionando.
- **Estado:** Potencial; requiere pruebas de permisos en PostgreSQL/Supabase real.

## SEC-02 — Un administrador puede conceder el rol `owner`

- **Archivo/ubicación:** `supabase/migrations/20261112000100_initial_schema.sql:230-237`.
- **Descripción:** Las políticas `project_members_insert_admins` y `project_members_update_admins` autorizan a `owner` o `admin` mediante `has_project_role`, pero no restringen que el valor nuevo de `role` sea `owner`, ni reservan explícitamente esa transición al propietario.
- **Severidad:** Media si el modelo esperado es que solo el propietario pueda transferir o conceder propiedad; baja si la promoción a owner por un admin es deliberada.
- **Evidencia:** `with check (public.has_project_role(project_id, array['owner', 'admin']...))` valida el rol del actor, pero no el rol asignado.
- **Impacto posible:** Un administrador podría elevar a otro miembro a owner y cambiar el gobierno del proyecto; según las demás políticas, el nuevo owner obtiene permisos de administración.
- **Corrección recomendada:** Definir la matriz de roles esperada y, si corresponde, limitar altas/cambios a `owner`, impedir múltiples owners no deseados o implementar una operación explícita de transferencia.
- **Estado:** Potencial; requiere confirmación funcional y prueba RLS con dos usuarios.

## SEC-03 — `.env` genérico no está excluido explícitamente

- **Archivo/ubicación:** `.gitignore:10-13`.
- **Descripción:** Se ignoran `node_modules`, `dist` y `*.local`, pero no existe una regla explícita para `.env` o `.env.*` manteniendo solamente `.env.example`.
- **Severidad:** Baja; es una brecha preventiva de higiene de secretos, no una credencial expuesta en esta copia.
- **Evidencia:** Solo se encontró `.env.example`, con valores vacíos y comentarios que prohíben secretos; no existe `.env.local` ni otro `.env` con credenciales.
- **Impacto posible:** Una persona podría crear `.env` con claves reales y añadirlo accidentalmente al repositorio.
- **Corrección recomendada:** Añadir reglas explícitas para archivos `.env*` y una excepción controlada para `.env.example`, verificando que los ejemplos permanezcan versionables.
- **Estado:** Confirmado como brecha de configuración; no hay secreto actual que remediar.

## SEC-04 — Mensaje de error de autenticación refleja detalle del proveedor

- **Archivo/ubicación:** `src/services/auth.service.ts:37-44`, mostrado por `src/components/AuthForm.tsx:36`.
- **Descripción:** `getAuthErrorMessage` concatena el `message` del error recibido de Supabase y la UI lo presenta al usuario.
- **Severidad:** Baja, porque React escapa el texto y no se observó XSS; el riesgo es de divulgación de detalles operativos o diferencias útiles para enumeración.
- **Evidencia:** `return \`No se pudo iniciar sesión: ${message}\`` y renderizado de `error.message` dentro de JSX.
- **Impacto posible:** Exponer mensajes internos, nombres de configuración o señales de autenticación en respuestas de error reales.
- **Corrección recomendada:** Mantener mensajes de usuario genéricos y registrar detalles solo en un canal controlado, sin incluir secretos ni tokens.
- **Estado:** Potencial; requiere observar respuestas reales de Supabase y la política de mensajes deseada.

## Controles positivos observados

- `src/config/supabase.ts:20-35` usa variables `VITE_*` y rechaza una clave que contiene `service_role`.
- `src/services/tasks.service.ts:93-124` obtiene `creator_id` desde `auth.getUser()`.
- `src/services/tasks.service.ts:127-159` limita la forma de actualización a campos de contenido permitidos por el tipo.
- `supabase/migrations/20261112000100_initial_schema.sql:187-191` habilita RLS en todas las tablas principales.
- Las políticas de lectura usan membresía de proyecto; las migraciones 003 protegen identidad y pertenencia mediante triggers.
- No se encontró `dangerouslySetInnerHTML`, `innerHTML`, almacenamiento manual de tokens ni clave privilegiada real.

## Límites de la evidencia

Los hallazgos RLS, privilegios de funciones, Realtime y aislamiento entre proyectos no están confirmados contra Supabase real porque el alcance prohíbe ejecutar SQL remoto o conectar el proyecto. Las pruebas SQL existentes son evidencia preparada, no resultado de ejecución. La migración nueva no debe considerarse aplicada hasta ejecutarse en una instancia de pruebas.
