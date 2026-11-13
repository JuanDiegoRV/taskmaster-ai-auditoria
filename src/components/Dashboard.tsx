import { lazy, Suspense, useState } from 'react'
import { ProjectPicker } from './ProjectPicker'
import { useProjects } from '../hooks/useProjects'

const TaskBoard = lazy(() => import('./TaskBoard').then(({ TaskBoard: component }) => ({ default: component })))

interface DashboardProps {
  userId: string
  userEmail: string | undefined
  onSignOut(): Promise<void>
}

function TaskBoardFallback() {
  return (
    <section className="task-board empty-board" aria-live="polite">
      <p className="muted">Cargando tablero de tareas…</p>
    </section>
  )
}

export function Dashboard({ userId, userEmail, onSignOut }: DashboardProps) {
  const projects = useProjects(userId)
  const [selectedProjectId, setSelectedProjectId] = useState('')
  const selectedProject = projects.data.find((project) => project.id === selectedProjectId) ?? projects.data[0] ?? null

  return (
    <div className="app-shell dashboard-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">TaskMaster AI</p>
          <h1>Tu espacio de trabajo</h1>
        </div>
        <div className="session-controls">
          <span className="user-email">{userEmail}</span>
          <button className="ghost-button" type="button" onClick={() => void onSignOut()}>Cerrar sesión</button>
        </div>
      </header>
      <div className="dashboard-grid">
        <ProjectPicker
          projects={projects.data}
          selectedProjectId={selectedProject?.id ?? ''}
          loading={projects.loading}
          error={projects.error}
          onSelect={setSelectedProjectId}
        />
        {selectedProject ? (
          <Suspense fallback={<TaskBoardFallback />}>
            <TaskBoard projectId={selectedProject.id} projectName={selectedProject.name} />
          </Suspense>
        ) : (
          <section className="task-board empty-board">
            <p className="eyebrow">Sin selección</p>
            <h2>Elige un proyecto</h2>
            <p className="muted">Selecciona un proyecto para consultar y gestionar sus tareas.</p>
          </section>
        )}
      </div>
    </div>
  )
}

export default Dashboard
