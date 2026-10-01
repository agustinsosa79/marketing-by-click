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
}

const QUICK_LINKS = nav.items.filter((item) => nav.quickLinks.includes(item.id))

/**
 * Navbar fija a todo el ancho, con fondo opaco y barra de progreso de lectura.
 *  - CTA "Hablemos" (WhatsApp) fijo; en desktop además los links a las secciones clave
 */
export function Navbar({ menuOpen, onToggle, toggleRef }: NavbarProps) {
  const ref = useRef<HTMLElement>(null)
  const progress = useRef<HTMLDivElement>(null)
  const [hoverCta, setHoverCta] = useState(false)
  const { scrollTo } = useLenis()
  const reduced = useReducedMotion()

  useGSAP(
    () => {
      const setProgress = gsap.quickSetter(progress.current, 'scaleX')
      const st = ScrollTrigger.create({
        start: 0,
        end: 'max',
        onUpdate: (self) => setProgress(self.progress),
      })
      return () => st.kill()
    },
    { scope: ref },
  )

  useGSAP(
    () => {
      const duration = reduced ? 0 : 0.6
      gsap.to('[data-line="top"]', { y: menuOpen ? 3 : 0, rotate: menuOpen ? 45 : 0, duration, ease: 'reveal' })
      gsap.to('[data-line="bottom"]', { y: menuOpen ? -3 : 0, rotate: menuOpen ? -45 : 0, duration, ease: 'reveal' })
    },
    { scope: ref, dependencies: [menuOpen, reduced] },
  )

  const goTo = (id: string) => {
    const target = document.getElementById(id)
    if (target) scrollTo(target, { offset: -24, duration: 1.6 })
  }

  return (
    <header data-navbar ref={ref} className="invisible pointer-events-none fixed inset-x-0 top-0 z-50 bg-brand-night text-brand-paper">
      <div className="relative flex h-14 items-center justify-between gap-3 px-4 md:h-16 md:px-8">
        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-0.5 bg-white/15">
          <div ref={progress} className="h-full origin-left scale-x-0 bg-brand-sky" />
        </div>
        <a
          data-nav-block
          href={`#${sections.hero}`}
          aria-label={nav.homeLabel}
          onClick={(event) => {
            event.preventDefault()
            if (!menuOpen) scrollTo(0, { duration: 1.8 })
          }}
          className="pointer-events-auto invisible relative shrink-0"
        >
          <Logo className="w-24 md:w-32" />
        </a>
        <nav data-nav-block aria-label={nav.quickAria} className="pointer-events-auto invisible relative hidden lg:block">
          <ul className="flex items-center gap-8 text-sm font-semibold">
            {QUICK_LINKS.map((item) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  onClick={(event) => {
                    event.preventDefault()
                    goTo(item.id)
                  }}
                  className="link-underline text-sm font-semibold"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div data-nav-block className="pointer-events-auto invisible relative flex items-center gap-2">
          <a
            href={hero.cta.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={hero.cta.label}
            data-cursor={nav.ctaCursor}
            onMouseEnter={() => setHoverCta(true)}
            onMouseLeave={() => setHoverCta(false)}
            onFocus={() => setHoverCta(true)}
            onBlur={() => setHoverCta(false)}
            className="group flex items-center gap-2 rounded-sm bg-brand-sky p-1.5 text-sm font-semibold text-brand-night transition-transform duration-300 ease-expo hover:-translate-y-px active:scale-97 sm:pl-4"
          >
            <span className="hidden sm:inline"><RollText text={nav.ctaLabel} active={hoverCta} /></span>
            <span className="grid size-8 place-items-center rounded-sm bg-brand-night text-brand-sky transition-transform duration-500 ease-expo group-hover:-rotate-12 group-hover:scale-110">
              <Icon name="whatsapp" className="size-4" />
            </span>
          </a>
          <button
            ref={toggleRef}
            type="button"
            aria-expanded={menuOpen}
            aria-controls="menu-panel"
            aria-label={menuOpen ? nav.closeAria : nav.openAria}
            onClick={onToggle}
            className="group grid size-11 place-items-center border-l border-white/20 transition-transform duration-300 ease-expo hover:scale-105 active:scale-95"
          >
            <span aria-hidden="true" className="flex w-5 flex-col gap-1">
              <span data-line="top" className="block h-0.5 w-full rounded-full bg-current" />
              <span data-line="bottom" className="block h-0.5 w-full rounded-full bg-current" />
            </span>
          </button>
        </div>
      </div>
    </header>
  )
}
