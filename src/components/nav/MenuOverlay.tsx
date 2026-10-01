import { useEffect, useRef, useState, type RefObject } from 'react'
import { contact, nav } from '../../data/content'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { gsap, useGSAP } from '../../lib/gsap'
import { MenuItem } from './MenuItem'
import { useMenuAnimation } from './useMenuAnimation'

interface MenuOverlayProps {
  open: boolean
  onClose: () => void
  pageRef: RefObject<HTMLDivElement | null>
  toggleRef: RefObject<HTMLButtonElement | null>
}

/**
 * Patrón de flechas tomado del isotipo (el cursor que apunta hacia arriba a la derecha),
 * en variación tonal sutil sobre brand-night. Deriva lento en diagonal.
 */
function ArrowPattern({ active }: { active: boolean }) {
  const ref = useRef<SVGSVGElement>(null)
  const drift = useRef<gsap.core.Tween | null>(null)
  const reduced = useReducedMotion()

  useGSAP(
    () => {
      if (reduced) return
      drift.current = gsap.to(ref.current, { xPercent: 8, yPercent: -8, duration: 30, ease: 'none', repeat: -1, yoyo: true, paused: true })
    },
    { dependencies: [reduced] },
  )

  // solo se mueve con el menú abierto
  useEffect(() => {
    if (active) drift.current?.play()
    else drift.current?.pause()
  }, [active])

  return (
    <svg ref={ref} aria-hidden="true" className="pointer-events-none absolute -top-1/4 -left-1/4 h-3/2 w-3/2">
      <defs>
        <pattern id="menu-arrows" width="168" height="168" patternUnits="userSpaceOnUse" patternTransform="rotate(-8)">
          {/* flecha-cursor del isotipo: punta arriba a la derecha + cola en diagonal */}
          <path d="M20 128 L84 64 M84 64 L84 104 M84 64 L44 64" className="fill-none stroke-brand-deep" strokeWidth="14" strokeLinecap="square" />
          <path d="M104 40 L150 22 L132 68 L124 50 Z" className="fill-brand-ink" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#menu-arrows)" className="opacity-40" />
    </svg>
  )
}

export function MenuOverlay({ open, onClose, pageRef, toggleRef }: MenuOverlayProps) {
  const panel = useRef<HTMLDivElement>(null)
  const target = useRef<string | null>(null)
  const [hovered, setHovered] = useState<number | null>(null)

  useMenuAnimation({ open, panel, page: pageRef, toggle: toggleRef, target })

  // Esc para cerrar + focus trap (botón del menú + contenido del panel)
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
        return
      }
      if (e.key !== 'Tab' || !panel.current) return
      const focusables = [toggleRef.current, ...panel.current.querySelectorAll<HTMLElement>('a[href], button')].filter(Boolean) as HTMLElement[]
      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose, toggleRef])

  useEffect(() => {
    if (!open) setHovered(null)
  }, [open])

  return (
    <div
      id="menu-panel"
      ref={panel}
      role="dialog"
      aria-modal="true"
      aria-label={nav.menuAria}
      aria-hidden={!open}
      className="invisible fixed inset-0 z-0 flex flex-col overflow-hidden bg-brand-night text-brand-paper"
    >
      <ArrowPattern active={open} />
      <nav aria-label={nav.menuAria} className="relative flex flex-1 flex-col items-center justify-center pt-20">
        <p data-menu-secondary className="mb-6 text-label font-semibold uppercase text-brand-paper/70">
          {nav.navigationLabel}
        </p>
        <ul className="flex flex-col items-center text-center" onMouseLeave={() => setHovered(null)}>
          {nav.items.map((item, i) => (
            <li key={item.id} data-menu-item>
              <MenuItem
                label={item.label}
                id={item.id}
                active={hovered === i}
                dimmed={hovered !== null && hovered !== i}
                onHover={() => setHovered(i)}
                onSelect={() => {
                  target.current = item.id
                  onClose()
                }}
              />
            </li>
          ))}
        </ul>
      </nav>

      <div className="relative grid gap-5 border-t border-brand-paper/15 px-5 py-6 md:grid-cols-3 md:items-center md:px-10 md:py-8">
        <p data-menu-secondary className="text-label font-semibold text-brand-sky">{nav.contactLabel}</p>
        <ul data-menu-secondary className="flex flex-wrap gap-x-8 gap-y-2 text-label font-semibold md:justify-center">
          {nav.secondary.map((link) => (
            <li key={link.href}>
              <a href={link.href} target="_blank" rel="noopener noreferrer" className="link-underline">
                {link.label}
              </a>
            </li>
          ))}
        </ul>
        <a
          data-menu-secondary
          href={contact.whatsapp.href}
          target="_blank"
          rel="noopener noreferrer"
          className="link-underline justify-self-start text-label font-semibold text-brand-paper/80 md:justify-self-end"
        >
          {contact.whatsapp.label}
        </a>
      </div>
    </div>
  )
}
