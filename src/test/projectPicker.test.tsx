// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ProjectPicker } from '../components/ProjectPicker'
import type { ProjectRow } from '../types/database'

const project: ProjectRow = {
  id: 'project-1', name: 'Proyecto Demo', description: 'Proyecto académico', owner_id: 'user-1',
  created_at: '2026-11-12T00:00:00Z', updated_at: '2026-11-12T00:00:00Z',
}

describe('ProjectPicker', () => {
  afterEach(() => cleanup())

  it('permite seleccionar y cambiar de proyecto', () => {
    const onSelect = vi.fn()
    render(<ProjectPicker projects={[project]} selectedProjectId="" loading={false} error={null} onSelect={onSelect} />)
    fireEvent.click(screen.getByRole('button', { name: /Proyecto Demo/ }))
    expect(onSelect).toHaveBeenCalledWith('project-1')
  })

  it('muestra estados vacío, carga y error', () => {
    const { rerender } = render(<ProjectPicker projects={[]} selectedProjectId="" loading={false} error={null} onSelect={vi.fn()} />)
    expect(screen.getByText('No tienes proyectos disponibles.')).toBeTruthy()
    rerender(<ProjectPicker projects={[]} selectedProjectId="" loading error={null} onSelect={vi.fn()} />)
    expect(screen.getByText('Cargando proyectos…')).toBeTruthy()
    rerender(<ProjectPicker projects={[]} selectedProjectId="" loading={false} error={new Error('No autorizado')} onSelect={vi.fn()} />)
    expect(screen.getByRole('alert').textContent).toContain('No autorizado')
  })
})
