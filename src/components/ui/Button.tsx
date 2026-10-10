import { useRef, useState, type MouseEvent, type PointerEvent } from 'react'
import { prefersReducedMotion } from '../../hooks/useReducedMotion'
import { gsap } from '../../lib/gsap'
import { Icon } from './Icon'
import { RollText } from './RollText'

type Variant = 'signal' | 'night' | 'white' | 'onSignal'

// cara · relleno que sube al hover · círculo del ícono
const STYLES: Record<Variant, { face: string; fill: string; badge: string }> = {
  signal: { face: 'bg-brand-signal text-white', fill: 'bg-brand-night', badge: 'bg-white text-brand-signal' },
  night: { face: 'bg-brand-night text-white shadow-soft', fill: 'bg-brand-signal', badge: 'bg-brand-signal text-white' },
  white: { face: 'bg-white text-brand-night shadow-soft group-hover:text-white', fill: 'bg-brand-signal', badge: 'bg-brand-night text-white' },
  // sobre fondo azul señal: el relleno del hover no puede ser del mismo azul
  onSignal: { face: 'bg-white text-brand-night shadow-soft group-hover:text-white', fill: 'bg-brand-night', badge: 'bg-brand-signal text-white' },
}

interface ButtonProps {
  href: string
  label: string
  variant?: Variant
  size?: 'md' | 'lg'
  icon?: 'whatsapp' | 'arrow'
  /** Etiqueta del cursor propio al pasar por encima. */
  cursor?: string
  className?: string
  onClick?: (e: MouseEvent<HTMLAnchorElement>) => void
}

/**
 * Botón pastilla: texto + círculo con ícono.
 * Hover: el color sube desde abajo, roll de letras y la flecha se endereza. Press: scale 0.97.
 * Clic: una onda sale desde el punto exacto del puntero (la firma "by Clic" del preloader).
 */
export function Button({ href, label, variant = 'signal', size = 'md', icon = 'arrow', cursor, className = '', onClick }: ButtonProps) {
  const [active, setActive] = useState(false)
  const face = useRef<HTMLSpanElement>(null)

  const ripple = (e: PointerEvent<HTMLAnchorElement>) => {
    const el = face.current
    if (!el || prefersReducedMotion()) return
    const r = el.getBoundingClientRect()
    const ring = document.createElement('span')
    ring.setAttribute('aria-hidden', 'true')
    ring.className = 'pointer-events-none absolute size-10 rounded-full border-2 border-current'
    ring.style.left = `${e.clientX - r.left}px`
    ring.style.top = `${e.clientY - r.top}px`
    el.appendChild(ring)
    gsap.fromTo(ring, { xPercent: -50, yPercent: -50, scale: 0, opacity: 0.9 }, { scale: 6, opacity: 0, duration: 0.7, ease: 'power2.out', onComplete: () => ring.remove() })
  }
  const external = href.startsWith('http')
  const s = STYLES[variant]

  const sizes = size === 'lg' ? 'gap-4 py-2 pr-2 pl-6 text-base md:py-2.5 md:pr-2.5 md:pl-8 md:text-lg' : 'gap-3 py-1.5 pr-1.5 pl-5 text-sm md:text-base'
  const badge = size === 'lg' ? 'size-11 md:size-13' : 'size-9 md:size-10'

  return (
    <a
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      data-cursor={cursor}
      onClick={onClick}
      onPointerDown={ripple}
      onMouseEnter={() => setActive(true)}
      onMouseLeave={() => setActive(false)}
      onFocus={() => setActive(true)}
      onBlur={() => setActive(false)}
      className={`group relative inline-flex select-none ${className}`}
    >
      <span
        ref={face}
        className={`relative inline-flex w-full items-center justify-between overflow-hidden rounded-full font-bold transition duration-300 ease-expo group-active:scale-97 ${s.face} ${sizes}`}
      >
        <span aria-hidden="true" className={`absolute inset-0 translate-y-full rounded-full transition-transform duration-500 ease-expo group-hover:translate-y-0 ${s.fill}`} />
        <span className="relative inline-flex w-full items-center justify-between gap-4">
          <RollText text={label} active={active} />
          <span className={`grid shrink-0 place-items-center rounded-full transition-transform duration-500 ease-expo group-hover:scale-110 group-active:scale-95 ${s.badge} ${badge}`}>
            {icon === 'whatsapp' ? (
              <Icon name="whatsapp" className="size-4 transition-transform duration-500 ease-expo group-hover:-rotate-12 md:size-5" />
            ) : (
              <svg viewBox="0 0 24 24" aria-hidden="true" className={`size-4 fill-none stroke-current stroke-2 transition-transform duration-500 ease-expo md:size-5 ${active ? 'rotate-0' : '-rotate-45'}`}>
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            )}
          </span>
        </span>
      </span>
    </a>
  )
}
