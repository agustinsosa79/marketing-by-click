import { lazy, Suspense, useCallback, useEffect, useRef, useState, type RefObject } from 'react'
import { MenuOverlay } from '../components/nav/MenuOverlay'
import { Navbar } from '../components/nav/Navbar'
import { Hero } from '../components/sections/hero/Hero'
import { Cursor } from '../components/ui/Cursor'
import { nav } from '../data/content'
import { useHydrated } from '../hooks/useHydrated'
import { fontsReady } from '../lib/fonts'
import { ScrollTrigger } from '../lib/gsap'
import { LenisProvider } from './LenisProvider'

// Secciones de abajo del pliegue en un chunk aparte (ver BelowFold.tsx)
const BelowFoldSections = lazy(() => import('./BelowFold').then((m) => ({ default: m.BelowFoldSections })))
const BelowFoldFooter = lazy(() => import('./BelowFold').then((m) => ({ default: m.BelowFoldFooter })))

function Page({ menuOpen, pageRef }: { menuOpen: boolean; pageRef: RefObject<HTMLDivElement | null> }) {
  // Las secciones lazy son solo-cliente: el HTML prerenderizado trae hasta el hero
  const hydrated = useHydrated()
  return (
    <div ref={pageRef} inert={menuOpen} className="relative z-10 overflow-x-clip bg-brand-paper">
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
    </div>
  )
}

export function App() {
  const [menuOpen, setMenuOpen] = useState(false)
  const pageRef = useRef<HTMLDivElement>(null)
  const toggleRef = useRef<HTMLButtonElement>(null)
  const closeMenu = useCallback(() => setMenuOpen(false), [])

  // Recalcular posiciones cuando terminan de cargar fuentes e imágenes
  useEffect(() => {
    const refresh = () => ScrollTrigger.refresh()
    fontsReady().then(refresh)
    window.addEventListener('load', refresh)
    return () => window.removeEventListener('load', refresh)
  }, [])

  return (
    <LenisProvider>
      <a
        href="#contenido"
        className="sr-only z-60 bg-brand-paper px-4 py-2 font-label text-label text-brand-night focus:not-sr-only focus:fixed focus:top-4 focus:left-4"
      >
        {nav.skipLink}
      </a>
      <Navbar menuOpen={menuOpen} onToggle={() => setMenuOpen((o) => !o)} toggleRef={toggleRef} />
      <MenuOverlay open={menuOpen} onClose={closeMenu} pageRef={pageRef} toggleRef={toggleRef} />
      <Page menuOpen={menuOpen} pageRef={pageRef} />
      <Cursor />
    </LenisProvider>
  )
}
