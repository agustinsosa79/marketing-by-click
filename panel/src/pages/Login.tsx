import { useState, type FormEvent } from 'react'
import { api, ApiError } from '../api'
import { Button, Spinner, inputClass } from '../components/ui'

export function Login({ onLogin }: { onLogin: () => void }) {
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      await api.login(password)
      onLogin()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo conectar. Revisá tu internet.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="grid min-h-svh place-items-center bg-brand-night px-4 py-10">
      <form onSubmit={submit} className="w-full max-w-sm rounded-3xl bg-white p-7 shadow-lift sm:p-8">
        <span role="img" aria-label="Marketing by Clic" className="logo h-8 text-brand-deep" />
        <h1 className="mt-8 text-2xl font-extrabold tracking-tight text-brand-deep">Panel de la web</h1>
        <p className="mt-1 text-sm text-brand-night/60">Blog, proyectos, precios y preguntas frecuentes.</p>

        <label htmlFor="password" className="mt-6 block text-sm font-bold text-brand-deep">
          Contraseña
        </label>
        <div className="relative mt-1.5">
          <input
            id="password"
            type={show ? 'text' : 'password'}
            autoComplete="current-password"
            autoFocus
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`${inputClass} pr-20`}
          />
          <button type="button" onClick={() => setShow((s) => !s)} className="absolute top-1/2 right-3 -translate-y-1/2 rounded-full px-2 py-1 text-xs font-bold text-brand-deep hover:bg-brand-deep/5">
            {show ? 'Ocultar' : 'Mostrar'}
          </button>
        </div>
        {error && (
          <p role="alert" className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
            {error}
          </p>
        )}
        <Button type="submit" disabled={busy || !password} className="mt-6 w-full py-3">
          {busy && <Spinner />}
          Ingresar
        </Button>
      </form>
    </div>
  )
}
