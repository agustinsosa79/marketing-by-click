import { useCallback, useEffect, useState } from 'react'
import { SITE_URL } from '../shared/blog'
import { api, ApiError, onUnauthorized } from './api'
import { Spinner, Toast, type ToastData } from './components/ui'
import { Editor } from './pages/Editor'
import { Login } from './pages/Login'
import { PostList } from './pages/PostList'

/** Rutas del panel (hash, para que funcione en cualquier hosting estático): #/ · #/nueva · #/editar/<slug> */
type Route = { name: 'list' } | { name: 'new' } | { name: 'edit'; slug: string }

const parse = (hash: string): Route => {
  const edit = hash.match(/^#\/editar\/([a-z0-9-]+)$/)
  if (edit) return { name: 'edit', slug: edit[1] }
  if (hash === '#/nueva') return { name: 'new' }
  return { name: 'list' }
}

export const go = (hash: string) => {
  window.location.hash = hash
}

export function App() {
  const [auth, setAuth] = useState<'loading' | 'in' | 'out' | 'misconfigured'>('loading')
  const [route, setRoute] = useState<Route>(() => parse(window.location.hash))
  const [configError, setConfigError] = useState('')
  const [toast, setToast] = useState<ToastData | null>(null)
  const closeToast = useCallback(() => setToast(null), [])

  useEffect(() => {
    api
      .session()
      .then((s) => setAuth(s.error ? 'misconfigured' : s.authenticated ? 'in' : 'out'))
      .catch((e) => {
        setConfigError(e instanceof ApiError ? e.message : '')
        setAuth('misconfigured')
      })
    onUnauthorized.current = () => setAuth('out')
    const onHash = () => setRoute(parse(window.location.hash))
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  if (auth === 'loading') {
    return (
      <div className="grid min-h-svh place-items-center text-brand-deep">
        <Spinner className="size-6" />
      </div>
    )
  }
  if (auth === 'misconfigured') {
    return (
      <div className="grid min-h-svh place-items-center p-6 text-center">
        <div className="max-w-md">
          <h1 className="text-2xl font-extrabold text-brand-deep">El panel no está configurado</h1>
          <p className="mt-3 text-sm text-brand-night/70">{configError || 'No se pudo conectar con el servidor del panel.'}</p>
        </div>
      </div>
    )
  }
  if (auth === 'out') return <Login onLogin={() => setAuth('in')} />

  const logout = async () => {
    await api.logout().catch(() => {})
    setAuth('out')
  }

  return (
    <div className="min-h-svh">
      <header className="sticky top-0 z-30 border-b border-brand-deep/10 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <a href="#/" className="flex items-center gap-3">
            <span role="img" aria-label="Marketing by Clic" className="logo h-7 text-brand-deep" />
            <span className="hidden border-l border-brand-deep/15 pl-3 text-sm font-bold text-brand-deep sm:inline">Panel del blog</span>
          </a>
          <nav className="flex items-center gap-1 text-sm font-semibold">
            <a href={`${SITE_URL}/blog`} target="_blank" rel="noopener noreferrer" className="rounded-full px-3 py-2 text-brand-deep hover:bg-brand-deep/5">
              Ver blog ↗
            </a>
            <button type="button" onClick={logout} className="rounded-full px-3 py-2 text-brand-night/70 hover:bg-brand-deep/5 hover:text-brand-night">
              Salir
            </button>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        {route.name === 'list' && <PostList notify={setToast} />}
        {route.name === 'new' && <Editor key="new" notify={setToast} />}
        {route.name === 'edit' && <Editor key={route.slug} slug={route.slug} notify={setToast} />}
      </main>

      <Toast toast={toast} onClose={closeToast} />
    </div>
  )
}
