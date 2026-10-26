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
  /** En el inicio los links scrollean; en otras páginas llevan al inicio (/#planes). */
  isHome: boolean
}

/**
 * Accesos directos a lo que más se busca (precios), al lado de la acción principal.
 * El resto de las secciones vive solo en el menú a pantalla completa: no se repiten links.
 */
const QUICK: { label: string; short?: string; id: string }[] = [
  { label: nav.plansLabel, id: sections.planes },
  { label: nav.servicesLabel, id: sections.servicios },
]

/** Link de la barra: en el inicio scrollea con Lenis; desde otra página lleva a /#sección. */
function NavLink({ id, label, short, href, isHome }: { id: string; label: string; short?: string; href?: string; isHome: boolean }) {
  const { scrollTo } = useLenis()
  return (
    <a
      data-nav-block
      href={href ?? (isHome ? `#${id}` : `/#${id}`)}
      onClick={(event) => {
        if (href || !isHome) return
        event.preventDefault()
        const target = document.getElementById(id)
        if (target) scrollTo(target, { duration: 1.6 })
      }}
      className="invisible relative px-0.5 py-2 text-sm font-bold whitespace-nowrap text-brand-night transition-colors duration-300 hover:text-brand-deep sm:text-base"
    >
      <span className="link-underline">
        {short ? (
          <>
            <span className="lg:hidden">{short}</span>
            <span className="hidden lg:inline">{label}</span>
          </>
        ) : (
          label
        )}
      </span>
    </a>
  )
}

/**
 * Barra de navegación a todo el ancho (pedido del cliente: el logo se veía chico dentro de la cápsula).
 * Patrones de UX que sigue:
 *  - logo arriba a la izquierda y clickeable al inicio (NN/g: mejor orientación y recuerdo de marca)
 *  - sin repetir el menú: solo Planes y Servicios (lo que más se busca) junto a la acción principal
 *  - logo en el azul Clic; el naranja queda solo para la acción principal ("Hablemos")
 *  - "parcialmente fija": se esconde al bajar y vuelve al subir (no tapa el contenido y la navegación está a mano)
 *  - arriba de todo es transparente; al scrollear toma fondo blanco con sombra y el logo se achica un poco
 *  - barra de progreso de lectura en el borde inferior
 * Solo se animan transform y opacity. Con el menú abierto la barra se va (el menú tiene su propio cerrar).
 */
export function Navbar({ menuOpen, onToggle, toggleRef, isHome }: NavbarProps) {
  const ref = useRef<HTMLElement>(null)
  const bar = useRef<HTMLDivElement>(null)
  const progress = useRef<HTMLDivElement>(null)
  const [scrolled, setScrolled] = useState(false)
  const [away, setAway] = useState(false)
  const [hoverCta, setHoverCta] = useState(false)
  const { scrollTo } = useLenis()
  const reduced = useReducedMotion()

  useGSAP(
    () => {
      const setProgress = gsap.quickSetter(progress.current, 'scaleX')
      let lastY = window.scrollY
      let wasScrolled = false
      let wasAway = false
      const st = ScrollTrigger.create({
        start: 0,
        end: 'max',
        onUpdate: (self) => {
          setProgress(self.progress)
          const y = window.scrollY
          // React solo se entera cuando algo cambia (no en cada cuadro del scroll)
          const nowScrolled = y > 12
          if (nowScrolled !== wasScrolled) setScrolled((wasScrolled = nowScrolled))
          // se esconde bajando (pasada la primera pantalla) y vuelve apenas se sube
          if (Math.abs(y - lastY) > 6) {
            const nowAway = y > lastY && y > window.innerHeight * 0.6
            if (nowAway !== wasAway) setAway((wasAway = nowAway))
            lastY = y
          }
        },
      })
      return () => st.kill()
    },
    { scope: ref },
  )

  // Una sola animación para "fuera de vista": menú abierto o bajando
  const hidden = menuOpen || away
  const wasMenu = useRef(false)
  const first = useRef(true)
  useGSAP(
    () => {
      if (first.current) {
        first.current = false
        return
      }
      const closingMenu = wasMenu.current && !menuOpen
      wasMenu.current = menuOpen
      gsap.to(bar.current, {
        yPercent: hidden ? -110 : 0,
        autoAlpha: menuOpen ? 0 : 1,
        duration: reduced ? 0.2 : hidden ? 0.45 : 0.6,
        delay: closingMenu ? (reduced ? 0.3 : 0.9) : 0,
        ease: hidden ? 'power3.in' : 'reveal',
        overwrite: true,
      })
    },
    { scope: ref, dependencies: [hidden, menuOpen, reduced] },
  )

  return (
    <header data-navbar ref={ref} inert={menuOpen} className="pointer-events-none invisible fixed inset-x-0 top-0 z-50">
      <div ref={bar} className="pointer-events-auto relative">
        {/* fondo: aparece al scrollear (opacity) */}
        <div aria-hidden="true" className={`absolute inset-0 border-b border-brand-deep/10 bg-white shadow-soft transition-opacity duration-500 ${scrolled ? 'opacity-100' : 'opacity-0'}`}>
          <div className="absolute inset-x-0 bottom-0 h-0.5 overflow-hidden">
            <div ref={progress} className="h-full origin-left scale-x-0 bg-brand-deep" />
          </div>
        </div>

        <div className="relative flex h-20 items-center justify-between gap-4 px-5 md:h-24 md:px-10">
          <a
            data-nav-block
            href={isHome ? `#${sections.hero}` : '/'}
            aria-label={nav.homeLabel}
            onClick={(event) => {
              if (!isHome) return
              event.preventDefault()
              scrollTo(0, { duration: 1.8 })
            }}
            className="invisible shrink-0"
          >
            <Logo className={`h-14 w-auto origin-left transition-transform duration-500 ease-expo md:h-20 ${scrolled ? 'scale-85' : 'scale-100'}`} />
          </a>

          <div className="flex items-center gap-2 md:gap-3">
            <nav aria-label="Accesos directos" className="mr-0.5 flex items-center gap-3 sm:mr-1 sm:gap-4 md:mr-3 md:gap-6">
              {QUICK.map((l) => (
                <NavLink key={l.id} {...l} isHome={isHome} />
              ))}
            </nav>
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
              className="group invisible relative flex h-12 items-center gap-2 overflow-hidden rounded-full bg-brand-signal p-1.5 font-bold text-brand-ink shadow-soft transition-transform duration-300 ease-expo active:scale-97 sm:pl-5"
            >
              <span aria-hidden="true" className="absolute inset-0 translate-y-full rounded-full bg-brand-night transition-transform duration-500 ease-expo group-hover:translate-y-0" />
              <span className="relative hidden transition-colors duration-300 group-hover:text-white sm:inline">
                <RollText text={nav.ctaLabel} active={hoverCta} />
              </span>
              <span className="relative grid size-9 place-items-center rounded-full bg-brand-ink text-white transition duration-500 ease-expo group-hover:-rotate-12 group-hover:bg-brand-deep">
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
              className="group invisible relative grid size-12 place-items-center rounded-full bg-brand-deep text-white shadow-soft transition duration-300 ease-expo hover:bg-brand-night active:scale-95"
            >
              <span aria-hidden="true" className="flex w-5 flex-col items-end gap-1.5">
                <span className="block h-0.5 w-full rounded-full bg-current" />
                <span className="block h-0.5 w-full origin-right scale-x-60 rounded-full bg-current transition-transform duration-500 ease-expo group-hover:scale-x-100" />
              </span>
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
