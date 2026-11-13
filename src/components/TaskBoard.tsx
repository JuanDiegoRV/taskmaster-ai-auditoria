import { useState, type FormEvent } from 'react'
import { useTasks, type UseTasksCreateInput } from '../hooks/useTasks'
import type { TaskPriority, TaskStatus } from '../types/database'

interface TaskBoardProps {
  projectId: string
  projectName: string
}

const statuses: TaskStatus[] = ['todo', 'in_progress', 'done', 'cancelled']
const priorities: TaskPriority[] = ['low', 'medium', 'high', 'urgent']

export function TaskBoard({ projectId, projectName }: TaskBoardProps) {
  const { data, loading, error, createTask, updateTask, deleteTask, refreshTasks } = useTasks(projectId)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<TaskPriority>('medium')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [actionError, setActionError] = useState<Error | null>(null)

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!title.trim()) return
    setActionError(null)
    try {
      const input: UseTasksCreateInput = { title: title.trim(), description: description.trim() || null, priority }
      await createTask(input)
      setTitle('')
      setDescription('')
      setPriority('medium')
    } catch (cause) {
      setActionError(cause instanceof Error ? cause : new Error(String(cause)))
    }
  }

  async function handleUpdate(taskId: string, changes: { title?: string; status?: TaskStatus; priority?: TaskPriority }) {
    setActionError(null)
    try {
      await updateTask(taskId, changes)
      setEditingId(null)
    } catch (cause) {
      setActionError(cause instanceof Error ? cause : new Error(String(cause)))
    }
  }

  async function handleDelete(taskId: string) {
    if (!window.confirm('¿Eliminar esta tarea? Esta acción no se puede deshacer.')) return
    setActionError(null)
    try {
      await deleteTask(taskId)
    } catch (cause) {
      setActionError(cause instanceof Error ? cause : new Error(String(cause)))
    }
  }

  return (
    <section className="task-board" aria-labelledby="tasks-title">
      <header className="board-heading">
        <div>
          <p className="eyebrow">Proyecto seleccionado</p>
          <h2 id="tasks-title">{projectName}</h2>
        </div>
        <button className="ghost-button" type="button" onClick={() => void refreshTasks()} disabled={loading}>
          Actualizar
        </button>
      </header>

      <form className="task-form" onSubmit={handleCreate} aria-label="Crear tarea">
        <input aria-label="Título de la tarea" placeholder="¿Qué hay que hacer?" value={title} onChange={(event) => setTitle(event.target.value)} required />
        <input aria-label="Descripción de la tarea" placeholder="Descripción opcional" value={description} onChange={(event) => setDescription(event.target.value)} />
        <select aria-label="Prioridad de la tarea" value={priority} onChange={(event) => setPriority(event.target.value as TaskPriority)}>
          {priorities.map((value) => <option key={value} value={value}>{value}</option>)}
        </select>
        <button className="primary-button" type="submit">Añadir tarea</button>
      </form>

      {(error || actionError) && (
        <p className="inline-error" role="alert">{(actionError || error)?.message}</p>
      )}
      {loading && data.length === 0 && <p className="muted">Cargando tareas…</p>}
      {!loading && !error && data.length === 0 && <p className="empty-state">No hay tareas en este proyecto todavía.</p>}

      <div className="task-list" aria-live="polite">
        {data.map((task) => (
          <article className="task-card" key={task.id}>
            {editingId === task.id ? (
              <div className="edit-row">
                <input aria-label={`Editar ${task.title}`} defaultValue={task.title} onKeyDown={(event) => {
                  if (event.key === 'Enter') void handleUpdate(task.id, { title: event.currentTarget.value.trim() })
                }} />
                <button className="small-button" type="button" onClick={(event) => {
                  const input = event.currentTarget.previousElementSibling as HTMLInputElement | null
                  if (input?.value.trim()) void handleUpdate(task.id, { title: input.value.trim() })
                }}>Guardar</button>
                <button className="small-button muted-button" type="button" onClick={() => setEditingId(null)}>Cancelar</button>
              </div>
            ) : (
              <>
                <div className="task-main">
                  <h3>{task.title}</h3>
                  {task.description && <p>{task.description}</p>}
                </div>
                <div className="task-meta">
                  <select aria-label={`Estado de ${task.title}`} value={task.status} onChange={(event) => void handleUpdate(task.id, { status: event.target.value as TaskStatus })}>
                    {statuses.map((value) => <option key={value} value={value}>{value}</option>)}
                  </select>
                  <span className={`priority priority-${task.priority}`}>{task.priority}</span>
                  <button className="small-button" type="button" onClick={() => setEditingId(task.id)}>Editar</button>
                  <button className="small-button danger-button" type="button" onClick={() => void handleDelete(task.id)}>Eliminar</button>
                </div>
              </>
            )}
          </article>
        ))}
      </div>
    </section>
  )
}
