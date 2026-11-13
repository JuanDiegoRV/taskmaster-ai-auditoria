// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { TaskBoard } from '../components/TaskBoard'
import { useTasks } from '../hooks/useTasks'
import type { TaskRow } from '../types/database'

vi.mock('../hooks/useTasks', () => ({ useTasks: vi.fn() }))

const useTasksMock = vi.mocked(useTasks)

const task: TaskRow = {
  id: 'task-1', project_id: 'project-1', title: 'Preparar demo', description: 'Revisar flujo',
  status: 'todo', priority: 'high', creator_id: 'user-1', assignee_id: null,
  created_at: '2026-11-12T00:00:00Z', updated_at: '2026-11-12T00:00:00Z',
}

function hookState(overrides: Partial<ReturnType<typeof useTasks>> = {}) {
  return {
    data: [task], loading: false, error: null,
    createTask: vi.fn(async () => task), updateTask: vi.fn(async () => task),
    deleteTask: vi.fn(async () => undefined), refreshTasks: vi.fn(async () => undefined),
    ...overrides,
  }
}

describe('TaskBoard', () => {
  beforeEach(() => vi.clearAllMocks())
  afterEach(() => cleanup())

  it('renderiza tareas y consume useTasks', () => {
    useTasksMock.mockReturnValue(hookState())
    render(<TaskBoard projectId="project-1" projectName="Proyecto Demo" />)
    expect(screen.getByRole('heading', { name: 'Proyecto Demo' })).toBeTruthy()
    expect(screen.getByText('Preparar demo')).toBeTruthy()
    expect(useTasksMock).toHaveBeenCalledWith('project-1')
  })

  it('muestra estados de carga, error y lista vacía', () => {
    useTasksMock.mockReturnValue(hookState({ data: [], loading: true }))
    const { rerender } = render(<TaskBoard projectId="project-1" projectName="Proyecto Demo" />)
    expect(screen.getByText('Cargando tareas…')).toBeTruthy()
    useTasksMock.mockReturnValue(hookState({ data: [], error: new Error('RLS denied') }))
    rerender(<TaskBoard projectId="project-1" projectName="Proyecto Demo" />)
    expect(screen.getByRole('alert').textContent).toContain('RLS denied')
    useTasksMock.mockReturnValue(hookState({ data: [] }))
    rerender(<TaskBoard projectId="project-1" projectName="Proyecto Demo" />)
    expect(screen.getByText('No hay tareas en este proyecto todavía.')).toBeTruthy()
  })

  it('crea, edita y elimina tareas mediante el hook', async () => {
    const state = hookState()
    useTasksMock.mockReturnValue(state)
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    render(<TaskBoard projectId="project-1" projectName="Proyecto Demo" />)

    fireEvent.change(screen.getByLabelText('Título de la tarea'), { target: { value: 'Nueva tarea' } })
    fireEvent.click(screen.getByRole('button', { name: 'Añadir tarea' }))
    await waitFor(() => expect(state.createTask).toHaveBeenCalledWith({ title: 'Nueva tarea', description: null, priority: 'medium' }))

    fireEvent.click(screen.getByRole('button', { name: 'Editar' }))
    const editInput = screen.getByLabelText('Editar Preparar demo')
    fireEvent.change(editInput, { target: { value: 'Demo actualizada' } })
    fireEvent.click(screen.getByRole('button', { name: 'Guardar' }))
    await waitFor(() => expect(state.updateTask).toHaveBeenCalledWith('task-1', { title: 'Demo actualizada' }))

    fireEvent.click(screen.getByRole('button', { name: 'Eliminar' }))
    await waitFor(() => expect(state.deleteTask).toHaveBeenCalledWith('task-1'))
  })
})
