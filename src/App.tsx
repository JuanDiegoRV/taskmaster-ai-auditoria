import { lazy, Suspense } from 'react'
import { useAuth } from './hooks/useAuth'
import './App.css'

const AuthForm = lazy(() => import('./components/AuthForm').then(({ AuthForm: component }) => ({ default: component })))
const Dashboard = lazy(() => import('./components/Dashboard'))

function AuthFormFallback() {
  return (
    <main className="app-shell centered">
      <p className="muted">Cargando acceso…</p>
    </main>
  )
}

function DashboardFallback() {
  return (
    <main className="app-shell centered">
      <p className="muted">Cargando espacio de trabajo…</p>
    </main>
  )
}

function App() {
  const auth = useAuth()

  if (auth.loading && !auth.user) {
    return <main className="app-shell centered"><p className="muted">Comprobando sesión…</p></main>
  }

  if (!auth.user) {
    return (
      <Suspense fallback={<AuthFormFallback />}>
        <AuthForm loading={auth.loading} error={auth.error} onSubmit={auth.signIn} />
      </Suspense>
    )
  }

  return (
    <Suspense fallback={<DashboardFallback />}>
      <Dashboard userId={auth.user.id} userEmail={auth.user.email} onSignOut={auth.signOut} />
    </Suspense>
  )
}

export default App
