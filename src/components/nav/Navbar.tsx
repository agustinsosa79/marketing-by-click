import { useRef, useState, type RefObject } from 'react'
import { hero, nav, sections } from '../../data/content'
import { useLenis } from '../../hooks/useLenis'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { gsap, ScrollTrigger, useGSAP } from '../../lib/gsap'
import { Icon, Logo } from '../ui/Icon'
import { RollText } from '../ui/RollText'

interface NavbarProps {
  menuOpen: boolean
  onToggle: () => void
  toggleRef: RefObject<HTMLButtonElement | null>
  /** En el inicio los links scrollean; en el blog llevan al inicio (/#planes). */
  isHome: boolean
}

/**
 * Navbar: cápsula compacta centrada arriba, siempre visible. Solo lo esencial:
 * logo · Planes · Hablemos (WhatsApp) · menú. Las secciones viven en el menú a pantalla completa.
 * Al abrir el menú la barra se va (el menú tiene su propio botón de cerrar).
 * Barra de progreso de lectura en el borde inferior de la cápsula.
 */
export function Navbar({ menuOpen, onToggle, toggleRef, isHome }: NavbarProps) {
  const ref = useRef<HTMLElement>(null)
  const pill = useRef<HTMLDivElement>(null)
  const progress = useRef<HTMLDivElement>(null)
  const first = useRef(true)
  const [hoverPlans, setHoverPlans] = useState(false)
  const [hoverCta, setHoverCta] = useState(false)
  const { scrollTo } = useLenis()
  const reduced = useReducedMotion()

  useGSAP(
    () => {
      const setProgress = gsap.quickSetter(progress.current, 'scaleX')
      const st = ScrollTrigger.create({ start: 0, end: 'max', onUpdate: (self) => setProgress(self.progress) })
      return () => st.kill()
    },
    { scope: ref },
  )

  // Con el menú abierto la barra sube y desaparece; al cerrar vuelve cuando la página ya creció
  useGSAP(
    () => {
      if (first.current) {
        first.current = false
        return
      }
      gsap.to(pill.current, {
        autoAlpha: menuOpen ? 0 : 1,
        yPercent: menuOpen ? -150 : 0,
        duration: reduced ? 0.2 : menuOpen ? 0.45 : 0.8,
        delay: menuOpen || reduced ? 0 : 0.7,
        ease: menuOpen ? 'power3.in' : 'reveal',
        overwrite: true,
      })
    },
    { scope: ref, dependencies: [menuOpen, reduced] },
  )

  return (
    <header data-navbar ref={ref} inert={menuOpen} className="pointer-events-none invisible fixed inset-x-0 top-3 z-50 flex justify-center px-3 md:top-5">
      <div
        ref={pill}
        className="pointer-events-auto relative flex items-center gap-1 overflow-hidden rounded-full bg-brand-night p-1.5 pl-4 text-white shadow-lift ring-1 ring-white/15 md:gap-1.5 md:pl-6"
      >
        <div aria-hidden="true" className="absolute inset-x-6 bottom-0 h-0.5 overflow-hidden rounded-full">
          <div ref={progress} className="h-full origin-left scale-x-0 bg-brand-signal" />
        </div>

        <a
          data-nav-block
          href={isHome ? `#${sections.hero}` : '/'}
          aria-label={nav.homeLabel}
          onClick={(event) => {
            if (!isHome) return
            event.preventDefault()
            scrollTo(0, { duration: 1.8 })
          }}
          className="invisible relative mr-1 shrink-0 text-white transition-transform duration-500 ease-expo hover:scale-105 md:mr-8"
        >
          <Logo className="w-24 md:w-28" />
        </a>

        <a
          data-nav-block
          href={isHome ? `#${sections.planes}` : `/#${sections.planes}`}
          onClick={(event) => {
            if (!isHome) return
            event.preventDefault()
            const target = document.getElementById(sections.planes)
            if (target) scrollTo(target, { duration: 1.6 })
          }}
          onMouseEnter={() => setHoverPlans(true)}
          onMouseLeave={() => setHoverPlans(false)}
          onFocus={() => setHoverPlans(true)}
          onBlur={() => setHoverPlans(false)}
          className="invisible relative flex h-10 items-center rounded-full px-3.5 text-sm font-bold text-white transition-colors duration-300 hover:bg-white/10 md:h-11 md:px-5"
        >
          <RollText text={nav.plansLabel} active={hoverPlans} />
        </a>

        <a
          data-nav-block
          href={hero.cta.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={hero.cta.label}
          data-cursor={nav.ctaCursor}
          onMouseEnter={() => setHoverCta(true)}
          onMouseLeave={() => setHoverCta(false)}
          onFocus={() => setHoverCta(true)}
          onBlur={() => setHoverCta(false)}
          className="group invisible relative flex h-10 items-center gap-2 overflow-hidden rounded-full bg-brand-signal p-1 text-sm font-bold text-white transition-transform duration-300 ease-expo active:scale-97 sm:pl-4 md:h-11 md:pl-5"
        >
          <span aria-hidden="true" className="absolute inset-0 translate-y-full rounded-full bg-white transition-transform duration-500 ease-expo group-hover:translate-y-0" />
          <span className="relative hidden transition-colors duration-300 group-hover:text-brand-night sm:inline">
            <RollText text={nav.ctaLabel} active={hoverCta} />
          </span>
          <span className="relative grid size-8 place-items-center rounded-full bg-white text-brand-signal transition duration-500 ease-expo group-hover:-rotate-12 group-hover:bg-brand-signal group-hover:text-white md:size-9">
            <Icon name="whatsapp" className="size-4" />
          </span>
        </a>

        <button
          data-nav-block
          ref={toggleRef}
          type="button"
          aria-expanded={menuOpen}
          aria-controls="menu-panel"
          aria-label={menuOpen ? nav.closeAria : nav.openAria}
          onClick={onToggle}
          className="group invisible relative grid size-10 place-items-center rounded-full bg-white text-brand-night transition duration-300 ease-expo hover:bg-brand-haze active:scale-95 md:size-11"
        >
          <span aria-hidden="true" className="flex w-4.5 flex-col items-end gap-1">
            <span className="block h-0.5 w-full rounded-full bg-current" />
            <span className="block h-0.5 w-full origin-right scale-x-60 rounded-full bg-current transition-transform duration-500 ease-expo group-hover:scale-x-100" />
          </span>
        </button>
      </div>
    </header>
  )
}
