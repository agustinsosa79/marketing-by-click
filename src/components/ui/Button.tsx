import { useRef, useState, type MouseEvent } from 'react'
import { gsap, useGSAP } from '../../lib/gsap'
import { Icon } from './Icon'
import { RollText } from './RollText'

type Variant = 'sky' | 'night' | 'paper'

// cara · capa de brillo al hover · círculo del ícono
const STYLES: Record<Variant, { face: string; badge: string }> = {
  sky: { face: 'bg-brand-sky text-brand-night', badge: 'bg-brand-night text-brand-sky' },
  night: { face: 'bg-brand-night text-brand-paper shadow-soft', badge: 'bg-brand-sky text-brand-night' },
  paper: { face: 'bg-brand-paper text-brand-night shadow-soft', badge: 'bg-brand-night text-brand-paper' },
}

interface ButtonProps {
  href: string
  label: string
  variant?: Variant
  size?: 'md' | 'lg'
  magnetic?: boolean
  icon?: 'whatsapp' | 'arrow'
  /** Etiqueta del cursor propio al pasar por encima. */
  cursor?: string
  className?: string
}

/**
 * Botón pastilla: texto + círculo con ícono.
 * Hover: roll de letras y giro del ícono. Press: scale 0.97. Magnético opcional.
 */
export function Button({ href, label, variant = 'sky', size = 'md', magnetic = false, icon = 'arrow', cursor, className = '' }: ButtonProps) {
  const ref = useRef<HTMLAnchorElement>(null)
  const inner = useRef<HTMLSpanElement>(null)
  const [active, setActive] = useState(false)
  const moveTo = useRef<{ x: gsap.QuickToFunc; y: gsap.QuickToFunc; ix: gsap.QuickToFunc; iy: gsap.QuickToFunc } | null>(null)
  const external = href.startsWith('http')
  const s = STYLES[variant]

  useGSAP(
    () => {
      if (!magnetic) return
      const opts = { duration: 0.22, ease: 'power3.out' }
      moveTo.current = {
        x: gsap.quickTo(ref.current, 'x', opts),
        y: gsap.quickTo(ref.current, 'y', opts),
        ix: gsap.quickTo(inner.current, 'x', opts),
        iy: gsap.quickTo(inner.current, 'y', opts),
      }
    },
    { dependencies: [magnetic], scope: ref },
  )

  const onMove = (e: MouseEvent<HTMLAnchorElement>) => {
    if (!moveTo.current || !ref.current) return
    const r = ref.current.getBoundingClientRect()
    const dx = e.clientX - (r.left + r.width / 2)
    const dy = e.clientY - (r.top + r.height / 2)
    moveTo.current.x(dx * 0.25)
    moveTo.current.y(dy * 0.3)
    moveTo.current.ix(dx * 0.1)
    moveTo.current.iy(dy * 0.12)
  }

  const onLeave = () => {
    setActive(false)
    if (!moveTo.current) return
    moveTo.current.x(0)
    moveTo.current.y(0)
    moveTo.current.ix(0)
    moveTo.current.iy(0)
  }

  const sizes = size === 'lg' ? 'gap-4 py-2.5 pr-2.5 pl-7 text-base md:py-3 md:pr-3 md:pl-9 md:text-lg' : 'gap-3 py-2 pr-2 pl-6 text-sm md:text-base'
  const badge = size === 'lg' ? 'size-11 md:size-14' : 'size-9 md:size-10'

  return (
    <a
      ref={ref}
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      data-cursor={cursor}
      onMouseEnter={() => setActive(true)}
      onMouseLeave={onLeave}
      onMouseMove={onMove}
      onFocus={() => setActive(true)}
      onBlur={() => setActive(false)}
      className={`group relative inline-flex select-none ${className}`}
    >
      <span
        className={`sheen relative inline-flex w-full items-center justify-between overflow-hidden rounded-full font-semibold transition-transform duration-200 ease-expo group-active:scale-97 ${s.face} ${sizes}`}
      >
        <span ref={inner} className="relative z-2 inline-flex w-full items-center justify-between gap-4">
          <RollText text={label} active={active} />
          <span className={`grid shrink-0 place-items-center rounded-full transition-transform duration-200 ease-expo group-hover:scale-110 group-active:scale-95 ${s.badge} ${badge}`}>
            {icon === 'whatsapp' ? (
              <Icon name="whatsapp" className="size-4 transition-transform duration-200 ease-expo group-hover:-rotate-12 md:size-5" />
            ) : (
              <svg viewBox="0 0 24 24" aria-hidden="true" className={`size-4 fill-none stroke-current stroke-2 transition-transform duration-200 ease-expo ${active ? 'rotate-0 translate-x-0.5' : '-rotate-45'}`}>
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            )}
          </span>
        </span>
      </span>
    </a>
  )
}
