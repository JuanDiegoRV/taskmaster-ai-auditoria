# TaskMaster AI — Entrega final del caso de estudio

## 1. Solución implementada

TaskMaster AI separa la interfaz, los hooks, los servicios, la configuración y los tipos. Las entidades principales son `profiles`, `projects`, `project_members`, `tasks` y `comments`.

El cliente Supabase vive en `src/config/supabase.ts` y usa variables públicas de Vite. `src/services/tasks.service.ts` encapsula las operaciones tipadas. `src/hooks/useTasks.ts` expone `data`, `loading`, `error`, `createTask`, `updateTask`, `deleteTask` y `refreshTasks`.

La lectura siempre filtra por `project_id`. La identidad del creador se obtiene desde `auth.getUser()` y no desde un identificador arbitrario enviado por la UI. Los errores de Supabase se propagan sin ocultar fallos RLS.

## 2. Código principal

La implementación completa está en `src/hooks/useTasks.ts`. Su consumo mínimo es:

```tsx
function TaskList({ projectId }: { projectId: string }) {
  const { data, loading, error, createTask, updateTask, deleteTask } = useTasks(projectId)

  if (loading) return <p>Cargando tareas...</p>
  if (error) return <p role="alert">{error.message}</p>

  return (
    <section>
      {data.map((task) => (
        <article key={task.id}>
          <h3>{task.title}</h3>
          <button onClick={() => updateTask(task.id, { status: 'done' })}>Completar</button>
          <button onClick={() => deleteTask(task.id)}>Eliminar</button>
        </article>
      ))}
      <button onClick={() => createTask({ title: 'Nueva tarea', priority: 'medium' })}>
        Crear tarea
      </button>
    </section>
  )
}
```

En la aplicación real, `TaskBoard` consume el hook y añade formularios, confirmación de eliminación, estados vacíos y controles de accesibilidad.

## 3. Tiempo real y ciclo de vida

`useTasks(projectId)` crea un canal único dentro de `useEffect` y registra listeners `postgres_changes` para `INSERT`, `UPDATE` y `DELETE` de `public.tasks`, filtrados por proyecto. Los eventos solicitan un refresco confirmado desde el servidor; así se evitan duplicados y se conserva la respuesta definitiva de PostgreSQL.

El hook serializa refrescos consecutivos, descarta respuestas antiguas mediante identificadores de solicitud y evita actualizar estado después del desmontaje. El cleanup ejecuta `supabase.removeChannel(channel)` al desmontar, cambiar de proyecto o pasar por React Strict Mode. Los estados `CHANNEL_ERROR` y `TIMED_OUT` se exponen como error y pueden recuperarse con una nueva consulta.

## 4. Seguridad

RLS limita la lectura y mutación a miembros del proyecto y aplica roles `owner`, `admin`, `member` y `viewer`. Las funciones auxiliares `SECURITY DEFINER` tienen `search_path` fijo y evitan recursión. La migración `20261112000300_protect_identity_fields.sql` vuelve inmutables los campos de identidad y pertenencia de tareas, comentarios, proyectos y membresías, sin impedir cambios legítimos de contenido.

## 5. Memoria técnica

Se eligió una arquitectura por capas porque la interfaz debe concentrarse en renderizar e interpretar acciones del usuario, mientras que Supabase requiere contratos y reglas de acceso centralizados. `useTasks(projectId)` funciona como caso de uso reutilizable: recibe el proyecto, coordina el ciclo de vida y expone un estado pequeño y predecible. Los servicios contienen las consultas y mutaciones tipadas, por lo que pueden probarse con clientes simulados sin montar componentes React. La identidad del creador se deriva de la sesión autenticada y las políticas RLS permanecen como frontera real de seguridad.

Para Realtime se usa `postgres_changes` sobre `public.tasks`. El callback no modifica directamente la lista con un payload potencialmente incompleto; solicita un refresco confirmado. Esta decisión simplifica la consistencia ante eventos rápidos, carreras, mutaciones locales y DELETE. Un contador de solicitudes impide que una respuesta antigua reemplace datos de otro proyecto. La suscripción se crea y destruye dentro del mismo `useEffect`, evitando canales duplicados y fugas durante cambios de proyecto o Strict Mode.

La solución distingue errores de configuración, permisos y conexión. Las variables del navegador solo aceptan URL y clave publishable; nunca `service_role` o `sb_secret_`. El esquema usa UUID, relaciones explícitas, restricciones, índices, triggers de timestamps y RLS. La validación automatizada cubre servicios, hook, Realtime y componentes. La validación SQL pgTAP y la colaboración entre usuarios requieren una instancia Supabase preparada, migraciones ejecutadas y dos sesiones autenticadas.

## 6. Evidencia y validación

- Build: correcto.
- Lint: correcto.
- Tests: 8 archivos, 34 pruebas aprobadas, 0 fallidas.
- Evidencias visuales: `docs/image (26).png` y `docs/image (27).png`.
- Migraciones ordenadas y documentadas.
- No se usa `service_role` en frontend.

## 7. Rúbrica

| Criterio | Evidencia |
|---|---|
| Abstracción y modularidad | `src/hooks`, `src/services`, `src/types`, `src/components` |
| Fetching y CRUD | `useTasks.ts` y `tasks.service.ts` |
| `loading`, `error`, `data` | Estado público de `useTasks` |
| Realtime | `postgres_changes` en `useTasks` |
| Ciclo de vida | `useEffect` y `removeChannel` |
| Seguridad | Migraciones RLS y hardening |
| Componente consumidor | `TaskBoard.tsx` |

**Conclusión:** la lógica de datos está encapsulada, es testeable y preparada para colaboración en tiempo real, manteniendo RLS como control definitivo de acceso.
