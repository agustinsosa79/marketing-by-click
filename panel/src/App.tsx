import { useCallback, useEffect, useState, type MouseEvent } from 'react'
import { SITE_URL } from '../shared/blog'
import { api, ApiError, onUnauthorized } from './api'
import { Spinner, Toast, type ToastData } from './components/ui'
import { leaveOk, unsaved } from './lib/nav'
import { Editor } from './pages/Editor'
import { Faq } from './pages/Faq'
import { Home } from './pages/Home'
import { Login } from './pages/Login'
import { PostList } from './pages/PostList'
import { Prices } from './pages/Prices'
import { ProjectEditor } from './pages/ProjectEditor'
import { ProjectList } from './pages/ProjectList'

/**
 * Rutas del panel (hash, para que funcione en cualquier hosting estático):
 *   #/                         inicio
 *   #/blog · #/blog/nueva · #/blog/editar/<slug>
 *   #/proyectos · #/proyectos/nuevo · #/proyectos/editar/<slug>
 *   #/precios · #/preguntas
 */
type Route =
  | { name: 'home' }
  | { name: 'blog' }
  | { name: 'blog-new' }
  | { name: 'blog-edit'; slug: string }
  | { name: 'projects' }
  | { name: 'project-new' }
  | { name: 'project-edit'; slug: string }
  | { name: 'prices' }
  | { name: 'faq' }

function parse(hash: string): Route {
  const path = hash.replace(/^#/, '') || '/'
  let m: RegExpMatchArray | null
  if (path === '/blog') return { name: 'blog' }
  // #/nueva y #/editar/… eran las direcciones del panel del blog: siguen funcionando
  if (path === '/blog/nueva' || path === '/nueva') return { name: 'blog-new' }
  if ((m = path.match(/^\/(?:blog\/)?editar\/([a-z0-9-]+)$/))) return { name: 'blog-edit', slug: m[1] }
  if (path === '/proyectos') return { name: 'projects' }
  if (path === '/proyectos/nuevo') return { name: 'project-new' }
  if ((m = path.match(/^\/proyectos\/editar\/([a-z0-9-]+)$/))) return { name: 'project-edit', slug: m[1] }
  if (path === '/precios') return { name: 'prices' }
  if (path === '/preguntas') return { name: 'faq' }
  return { name: 'home' }
}

const SECTIONS = [
  { id: 'home', label: 'Inicio', href: '#/' },
  { id: 'blog', label: 'Blog', href: '#/blog' },
  { id: 'projects', label: 'Proyectos', href: '#/proyectos' },
  { id: 'prices', label: 'Precios', href: '#/precios' },
  { id: 'faq', label: 'Preguntas', href: '#/preguntas' },
] as const

const sectionOf = (route: Route) => (route.name.startsWith('blog') ? 'blog' : route.name.startsWith('project') ? 'projects' : route.name)


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
    const onHash = () => {
      unsaved.current = false
      setRoute(parse(window.location.hash))
      window.scrollTo(0, 0)
    }
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
    if (!leaveOk()) return
    await api.logout().catch(() => {})
    setAuth('out')
  }
  const guard = (e: MouseEvent) => {
    if (!leaveOk()) e.preventDefault()
  }
  const current = sectionOf(route)

  return (
    <div className="min-h-svh">
      <header className="sticky top-0 z-30 border-b border-brand-deep/10 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <a href="#/" onClick={guard} className="flex shrink-0 items-center gap-3">
            <span role="img" aria-label="Marketing by Clic" className="logo h-7 text-brand-deep" />
            <span className="hidden border-l border-brand-deep/15 pl-3 text-sm font-bold text-brand-deep lg:inline">Panel</span>
          </a>
          <nav aria-label="Secciones del panel" className="hidden items-center gap-1 md:flex">
            {SECTIONS.map((s) => (
              <a
                key={s.id}
                href={s.href}
                onClick={guard}
                aria-current={current === s.id ? 'page' : undefined}
                className={`rounded-full px-3.5 py-2 text-sm font-bold transition ${current === s.id ? 'bg-brand-deep text-white' : 'text-brand-deep hover:bg-brand-deep/5'}`}
              >
                {s.label}
              </a>
            ))}
          </nav>
          <div className="flex shrink-0 items-center gap-1 text-sm font-semibold">
            <a href={SITE_URL} target="_blank" rel="noopener noreferrer" className="rounded-full px-3 py-2 text-brand-deep hover:bg-brand-deep/5">
              Ver sitio ↗
            </a>
            <button type="button" onClick={logout} className="rounded-full px-3 py-2 text-brand-night/70 hover:bg-brand-deep/5 hover:text-brand-night">
              Salir
            </button>
          </div>
        </div>
        {/* Celular: las secciones en una fila que se desliza */}
        <nav aria-label="Secciones del panel" className="no-scrollbar flex gap-1 overflow-x-auto border-t border-brand-deep/5 px-4 py-2 md:hidden">
          {SECTIONS.map((s) => (
            <a
              key={s.id}
              href={s.href}
              onClick={guard}
              aria-current={current === s.id ? 'page' : undefined}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm font-bold ${current === s.id ? 'bg-brand-deep text-white' : 'text-brand-deep'}`}
            >
              {s.label}
            </a>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        {route.name === 'home' && <Home />}
        {route.name === 'blog' && <PostList notify={setToast} />}
        {route.name === 'blog-new' && <Editor key="new" notify={setToast} />}
        {route.name === 'blog-edit' && <Editor key={route.slug} slug={route.slug} notify={setToast} />}
        {route.name === 'projects' && <ProjectList notify={setToast} />}
        {route.name === 'project-new' && <ProjectEditor key="new" notify={setToast} />}
        {route.name === 'project-edit' && <ProjectEditor key={route.slug} slug={route.slug} notify={setToast} />}
        {route.name === 'prices' && <Prices notify={setToast} />}
        {route.name === 'faq' && <Faq notify={setToast} />}
      </main>

      <Toast toast={toast} onClose={closeToast} />
    </div>
  )
}
