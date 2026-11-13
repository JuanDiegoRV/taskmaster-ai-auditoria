import { useState, type FormEvent } from 'react'
import type { AuthCredentials } from '../services/auth.service'

interface AuthFormProps {
  loading: boolean
  error: Error | null
  onSubmit(credentials: AuthCredentials): Promise<void>
}

export function AuthForm({ loading, error, onSubmit }: AuthFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    try {
      await onSubmit({ email, password })
    } catch {
      // El hook conserva el error para mostrarlo en el formulario.
    }
  }

  return (
    <form className="auth-card" onSubmit={handleSubmit} aria-labelledby="login-title">
      <p className="eyebrow">Acceso seguro</p>
      <h1 id="login-title">TaskMaster AI</h1>
      <p className="muted">Inicia sesión para consultar tus proyectos y tareas.</p>
      <label>
        Correo electrónico
        <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
      </label>
      <label>
        Contraseña
        <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
      </label>
      {error && <p className="inline-error" role="alert">{error.message}</p>}
      <button className="primary-button" type="submit" disabled={loading}>
        {loading ? 'Conectando…' : 'Iniciar sesión'}
      </button>
    </form>
  )
}
