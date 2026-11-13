// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from '../App'
import { useAuth } from '../hooks/useAuth'
import { useProjects } from '../hooks/useProjects'
import { useTasks } from '../hooks/useTasks'
import type { User } from '@supabase/supabase-js'
import type { ProjectRow } from '../types/database'

vi.mock('../hooks/useAuth', () => ({ useAuth: vi.fn() }))
vi.mock('../hooks/useProjects', () => ({ useProjects: vi.fn() }))
vi.mock('../hooks/useTasks', () => ({ useTasks: vi.fn() }))

const authMock = vi.mocked(useAuth)
const projectsMock = vi.mocked(useProjects)
const tasksMock = vi.mocked(useTasks)
const user = { id: 'user-1', email: 'user@example.com' } as User
const project: ProjectRow = {
  id: 'project-1', name: 'Proyecto Demo', description: 'Demo', owner_id: 'user-1',
  created_at: '2026-11-12T00:00:00Z', updated_at: '2026-11-12T00:00:00Z',
}

function authenticatedState() {
  return { user, loading: false, error: null, signIn: vi.fn(async () => undefined), signOut: vi.fn(async () => undefined) }
}

function projectState() {
  return { data: [project], loading: false, error: null, refreshProjects: vi.fn(async () => undefined) }
}

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    authMock.mockReturnValue(authenticatedState())
    projectsMock.mockReturnValue(projectState())
    tasksMock.mockReturnValue({
      data: [], loading: false, error: null,
      createTask: vi.fn(async () => { throw new Error('not used') }),
      updateTask: vi.fn(async () => { throw new Error('not used') }),
      deleteTask: vi.fn(async () => undefined), refreshTasks: vi.fn(async () => undefined),
    })
  })
  afterEach(() => cleanup())

  it('integra autenticación, proyectos y el tablero seleccionado después de la carga diferida', async () => {
    render(<App />)
    expect(await screen.findByText('user@example.com')).toBeTruthy()
    expect(await screen.findByRole('heading', { name: 'Proyecto Demo' })).toBeTruthy()
    await waitFor(() => expect(projectsMock).toHaveBeenCalledWith('user-1'))
  })

  it('oculta el workspace al cerrar sesión y no conserva el proyecto anterior', async () => {
    const { rerender } = render(<App />)
    expect((await screen.findAllByText('Proyecto Demo')).length).toBeGreaterThan(0)
    authMock.mockReturnValue({ user: null, loading: false, error: null, signIn: vi.fn(async () => undefined), signOut: vi.fn(async () => undefined) })
    projectsMock.mockReturnValue({ data: [], loading: false, error: null, refreshProjects: vi.fn(async () => undefined) })
    rerender(<App />)
    expect(await screen.findByRole('button', { name: 'Iniciar sesión' })).toBeTruthy()
    await waitFor(() => expect(screen.queryByText('Proyecto Demo')).toBeNull())
  })

  it('expone la acción de cerrar sesión', async () => {
    const authState = authenticatedState()
    authMock.mockReturnValue(authState)
    render(<App />)
    fireEvent.click(await screen.findByRole('button', { name: 'Cerrar sesión' }))
    expect(authState.signOut).toHaveBeenCalledOnce()
  })
})
