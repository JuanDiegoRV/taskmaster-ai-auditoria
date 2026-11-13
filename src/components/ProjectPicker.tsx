import type { ProjectRow } from '../types/database'

interface ProjectPickerProps {
  projects: ProjectRow[]
  selectedProjectId: string
  loading: boolean
  error: Error | null
  onSelect(projectId: string): void
}

export function ProjectPicker({ projects, selectedProjectId, loading, error, onSelect }: ProjectPickerProps) {
  return (
    <aside className="project-panel" aria-labelledby="projects-title">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Workspace</p>
          <h2 id="projects-title">Proyectos</h2>
        </div>
        <span className="count-badge">{projects.length}</span>
      </div>
      {loading && <p className="muted">Cargando proyectos…</p>}
      {error && <p className="inline-error" role="alert">{error.message}</p>}
      {!loading && !error && projects.length === 0 && (
        <p className="muted">No tienes proyectos disponibles.</p>
      )}
      <div className="project-list" role="list">
        {projects.map((project) => (
          <button
            className={`project-option ${selectedProjectId === project.id ? 'is-selected' : ''}`}
            key={project.id}
            type="button"
            onClick={() => onSelect(project.id)}
            aria-pressed={selectedProjectId === project.id}
          >
            <strong>{project.name}</strong>
            <span>{project.description || 'Sin descripción'}</span>
          </button>
        ))}
      </div>
    </aside>
  )
}
