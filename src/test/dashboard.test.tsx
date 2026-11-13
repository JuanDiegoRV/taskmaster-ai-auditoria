// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import Dashboard from '../components/Dashboard'
import { useProjects } from '../hooks/useProjects'
import { useTasks } from '../hooks/useTasks'
import type { TaskRow } from '../types/database'

vi.mock('../hooks/useProjects', () => ({ useProjects: vi.fn() }))
vi.mock('../hooks/useTasks', () => ({ useTasks: vi.fn() }))

const projectsMock = vi.mocked(useProjects)
const tasksMock = vi.mocked(useTasks)
const task: TaskRow = {
  id: 'task-1', project_id: 'project-1', title: 'Preparar demo', description: null,
  status: 'todo', priority: 'medium', creator_id: 'user-1', assignee_id: null,
  created_at: '2026-11-12T00:00:00Z', updated_at: '2026-11-12T00:00:00Z',
}

describe('Dashboard code splitting', () => {
  beforeEach(() => {
    projectsMock.mockReturnValue({
      data: [{ id: 'project-1', name: 'Proyecto Demo', description: null, owner_id: 'user-1', created_at: '', updated_at: '' }],
      loading: false, error: null, refreshProjects: vi.fn(async () => undefined),
    })
    tasksMock.mockReturnValue({
      data: [task], loading: false, error: null,
      createTask: vi.fn(async () => task), updateTask: vi.fn(async () => task),
      deleteTask: vi.fn(async () => undefined), refreshTasks: vi.fn(async () => undefined),
    })
  })
  afterEach(() => cleanup())

  it('carga el tablero diferido y conserva el flujo de tareas', async () => {
    render(<Dashboard userId="user-1" userEmail="user@example.com" onSignOut={vi.fn(async () => undefined)} />)
    expect(await screen.findByRole('heading', { name: 'Proyecto Demo' })).toBeTruthy()
    expect(await screen.findByText('Preparar demo')).toBeTruthy()
    expect(tasksMock).toHaveBeenCalledWith('project-1')
  })
})
