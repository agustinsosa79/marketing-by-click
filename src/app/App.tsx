import { lazy, Suspense, useCallback, useEffect, useRef, useState, type ReactNode, type RefObject } from 'react'
import { BlogIndex } from '../components/blog/BlogIndex'
import { BlogPost } from '../components/blog/BlogPost'
import { NotFound } from '../components/blog/NotFound'
import { MenuOverlay } from '../components/nav/MenuOverlay'
import { Navbar } from '../components/nav/Navbar'
import { Hero } from '../components/sections/hero/Hero'
import { ServicePage } from '../components/services/ServicePage'
import { Cursor } from '../components/ui/Cursor'
import { nav, servicios } from '../data/content'
import { useHydrated } from '../hooks/useHydrated'
import type { Post } from '../lib/blog'
import { fontsReady } from '../lib/fonts'
import { ScrollTrigger } from '../lib/gsap'
import { LenisProvider } from './LenisProvider'
import type { Route } from './routes'

// Secciones de abajo del pliegue en un chunk aparte (ver BelowFold.tsx)
const BelowFoldSections = lazy(() => import('./BelowFold').then((m) => ({ default: m.BelowFoldSections })))
const BelowFoldFooter = lazy(() => import('./BelowFold').then((m) => ({ default: m.BelowFoldFooter })))

function Home() {
  // Las secciones lazy son solo-cliente: el HTML prerenderizado trae hasta el hero
  const hydrated = useHydrated()
  return (
    <>
      <main id="contenido" className="relative isolate z-10">
        <Hero />
        {hydrated && (
          <Suspense fallback={null}>
            <BelowFoldSections />
          </Suspense>
        )}
      </main>
      {hydrated && (
        <Suspense fallback={null}>
          <BelowFoldFooter />
        </Suspense>
      )}
    </>
  )
}

function Page({ menuOpen, pageRef, children }: { menuOpen: boolean; pageRef: RefObject<HTMLDivElement | null>; children: ReactNode }) {
  return (
    <div ref={pageRef} inert={menuOpen} className="relative z-10 overflow-x-clip bg-brand-paper">
      {children}
    </div>
  )
}

interface AppProps {
  route: Route
  /** Nota ya cargada (la página de una nota hidrata con su contenido, sin esperar). */
  post?: Post | null
}

export function App({ route, post = null }: AppProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const pageRef = useRef<HTMLDivElement>(null)
  const toggleRef = useRef<HTMLButtonElement>(null)
  const closeMenu = useCallback(() => setMenuOpen(false), [])
  const isHome = route.name === 'home'
  const service = route.name === 'service' ? servicios.items.find((s) => s.slug === route.slug) : undefined

  // Recalcular posiciones cuando terminan de cargar fuentes e imágenes
  useEffect(() => {
    const refresh = () => ScrollTrigger.refresh()
    fontsReady().then(refresh)
    window.addEventListener('load', refresh)
    return () => window.removeEventListener('load', refresh)
  }, [])

  let content: ReactNode
  if (route.name === 'home') content = <Home />
  else if (route.name === 'blog') content = <BlogIndex />
  else if (route.name === 'post' && post) content = <BlogPost post={post} />
  else if (route.name === 'service' && service) content = <ServicePage service={service} />
  else content = <NotFound />

  return (
    <LenisProvider>
      <a
        href="#contenido"
        className="sr-only z-60 bg-brand-paper px-4 py-2 font-label text-label text-brand-night focus:not-sr-only focus:fixed focus:top-4 focus:left-4"
      >
        {nav.skipLink}
      </a>
      <Navbar menuOpen={menuOpen} onToggle={() => setMenuOpen((o) => !o)} toggleRef={toggleRef} isHome={isHome} />
      <MenuOverlay open={menuOpen} onClose={closeMenu} pageRef={pageRef} toggleRef={toggleRef} isHome={isHome} />
      <Page menuOpen={menuOpen} pageRef={pageRef}>
        {content}
      </Page>
      <Cursor />
    </LenisProvider>
  )
}
