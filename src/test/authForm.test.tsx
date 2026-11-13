// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { AuthForm } from '../components/AuthForm'

describe('AuthForm', () => {
  afterEach(() => cleanup())

  it('envía correo y contraseña al servicio de autenticación', async () => {
    const onSubmit = vi.fn(async () => undefined)
    render(<AuthForm loading={false} error={null} onSubmit={onSubmit} />)
    fireEvent.change(screen.getByLabelText('Correo electrónico'), { target: { value: 'user@example.com' } })
    fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: 'secret123' } })
    fireEvent.click(screen.getByRole('button', { name: 'Iniciar sesión' }))
    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith({ email: 'user@example.com', password: 'secret123' }))
  })

  it('muestra errores y estado de carga', () => {
    const { rerender } = render(<AuthForm loading={false} error={new Error('Supabase no configurado')} onSubmit={vi.fn()} />)
    expect(screen.getByRole('alert').textContent).toContain('Supabase no configurado')
    rerender(<AuthForm loading error={null} onSubmit={vi.fn()} />)
    expect((screen.getByRole('button', { name: 'Conectando…' }) as HTMLButtonElement).disabled).toBe(true)
  })
})
