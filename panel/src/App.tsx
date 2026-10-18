import { useCallback, useEffect, useState, type MouseEvent } from 'react'
import { SITE_URL } from '../shared/blog'
import { api, ApiError, onUnauthorized } from './api'
import { Spinner, Toast, type ToastData } from './components/ui'
import { DialogHost } from './components/DialogHost'
import { confirmLeave, go, unsaved } from './lib/nav'
import { Editor } from './pages/Editor'
import { Faq } from './pages/Faq'
import { Home } from './pages/Home'
import { Login } from './pages/Login'
import { PostList } from './pages/PostList'
import { Prices } from './pages/Prices'
import { Texts } from './pages/Texts'
import { Media } from './pages/Media'
import { ProjectEditor } from './pages/ProjectEditor'
import { ProjectList } from './pages/ProjectList'

/**
 * Rutas del panel (hash, para que funcione en cualquier hosting estático):
 *   #/                         inicio
 *   #/blog · #/blog/nueva · #/blog/editar/<slug>
 *   #/proyectos · #/proyectos/nuevo · #/proyectos/editar/<slug>
 *   #/precios · #/preguntas · #/textos · #/fotos
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
  | { name: 'texts' }
  | { name: 'media' }

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
  if (path === '/textos') return { name: 'texts' }
  if (path === '/fotos') return { name: 'media' }
  return { name: 'home' }
}

const SECTIONS = [
  { id: 'home', label: 'Inicio', href: '#/' },
  { id: 'blog', label: 'Blog', href: '#/blog' },
  { id: 'projects', label: 'Proyectos', href: '#/proyectos' },
  { id: 'prices', label: 'Precios', href: '#/precios' },
  { id: 'faq', label: 'Preguntas', href: '#/preguntas' },
  { id: 'texts', label: 'Textos', href: '#/textos' },
  { id: 'media', label: 'Fotos', href: '#/fotos' },
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
    // Toda navegación pasa por acá (barra, links, "atrás" del navegador). Con cambios sin guardar,
    // se vuelve a la pantalla actual y se pregunta con el modal del panel.
    let current = window.location.hash
    const onHash = () => {
      const target = window.location.hash
      if (target === current) return
      if (unsaved.current) {
        // se vuelve a poner la pantalla actual en el historial: así un segundo "atrás" tampoco sale del panel
        history.pushState(null, '', current || '#/')
        confirmLeave().then((ok) => ok && go(target))
        return
      }
      current = target
      setRoute(parse(target))
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
    if (!(await confirmLeave())) return
    await api.logout().catch(() => {})
    setAuth('out')
  }
  // con cambios sin guardar, la navegación espera la respuesta del modal
  const guard = (e: MouseEvent<HTMLAnchorElement>) => {
    if (!unsaved.current) return
    e.preventDefault()
    const hash = e.currentTarget.getAttribute('href') ?? '#/'
    confirmLeave().then((ok) => ok && go(hash))
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
          <nav aria-label="Secciones del panel" className="hidden items-center gap-1 lg:flex">
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
        <nav aria-label="Secciones del panel" className="grid grid-cols-4 gap-1 border-t border-brand-deep/5 px-2 py-2 sm:grid-cols-7 sm:px-4 lg:hidden">
          {SECTIONS.map((s) => (
            <a
              key={s.id}
              href={s.href}
              onClick={guard}
              aria-current={current === s.id ? 'page' : undefined}
              className={`rounded-full px-0.5 py-2 text-center text-[0.7rem] font-bold tracking-tight min-[380px]:text-xs sm:text-sm ${current === s.id ? 'bg-brand-deep text-white' : 'text-brand-deep'}`}
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
        {route.name === 'texts' && <Texts notify={setToast} />}
        {route.name === 'media' && <Media notify={setToast} />}
      </main>

      <Toast toast={toast} onClose={closeToast} />
      <DialogHost />
    </div>
  )
}
