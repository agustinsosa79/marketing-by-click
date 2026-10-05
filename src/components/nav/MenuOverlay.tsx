import { useEffect, useRef, useState, type RefObject } from 'react'
import { contact, nav } from '../../data/content'
import { Button } from '../ui/Button'
import { Icon, Logo } from '../ui/Icon'
import { MenuItem } from './MenuItem'
import { useMenuAnimation } from './useMenuAnimation'

interface MenuOverlayProps {
  open: boolean
  onClose: () => void
  pageRef: RefObject<HTMLDivElement | null>
  toggleRef: RefObject<HTMLButtonElement | null>
  isHome: boolean
}

/**
 * Menú a pantalla completa sobre azul noche: la página se achica como una tarjeta (useMenuAnimation)
 * y los links pasan de desenfocados a nítidos. A la derecha, el contacto directo.
 */
export function MenuOverlay({ open, onClose, pageRef, toggleRef, isHome }: MenuOverlayProps) {
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
      const focusables = [...panel.current.querySelectorAll<HTMLElement>('a[href], button')]
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
  }, [open, onClose])

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
      className="invisible fixed inset-0 z-0 overflow-hidden bg-brand-night text-white"
    >

      {/* la navbar se va al abrir: acá quedan la marca y el botón de cerrar */}
      <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between px-5 pt-5 md:px-10 md:pt-7">
        <Logo data-menu-secondary className="w-28 text-white md:w-32" />
        <button
          data-menu-secondary
          type="button"
          onClick={onClose}
          aria-label={nav.closeAria}
          className="group flex items-center gap-3 rounded-full bg-white/10 py-1.5 pr-1.5 pl-5 text-sm font-bold ring-1 ring-white/15 transition duration-300 ease-expo hover:bg-white hover:text-brand-night"
        >
          {nav.closeLabel}
          <span className="grid size-9 place-items-center rounded-full bg-brand-signal text-white transition-transform duration-500 ease-expo group-hover:rotate-90">
            <svg viewBox="0 0 24 24" aria-hidden="true" className="size-4 fill-none stroke-current stroke-2" strokeLinecap="round">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </span>
        </button>
      </div>

      <div className="relative grid grid-cols-1 h-full grid-rows-1 gap-8 px-5 pt-24 pb-6 md:px-10 md:pt-28 md:pb-10 lg:grid-cols-12">
        <nav aria-label={nav.menuAria} className="flex flex-col justify-center lg:col-span-8">
          <ul className="flex flex-col" onMouseLeave={() => setHovered(null)}>
            {nav.items.map((item, i) => (
              <li key={item.id} data-menu-item>
                <MenuItem
                  label={item.label}
                  href={item.href ?? (isHome ? `#${item.id}` : `/#${item.id}`)}
                  inPage={isHome && !item.href}
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

        <aside className="flex flex-col justify-end gap-6 lg:col-span-4 lg:justify-center">
          <p data-menu-secondary className="font-display text-big">
            {nav.contactTitle}
          </p>
          <div data-menu-secondary>
            <Button href={contact.whatsapp.href} label={contact.whatsapp.label} icon="whatsapp" variant="signal" cursor={nav.ctaCursor} />
          </div>
          <ul data-menu-secondary className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold text-brand-haze">
            {[contact.instagram, contact.founderInstagram].map((link) => (
              <li key={link.href}>
                <a href={link.href} target="_blank" rel="noopener noreferrer" className="group flex items-center gap-2 transition-colors duration-300 hover:text-white">
                  <Icon name="instagram" className="size-4 transition-transform duration-500 ease-expo group-hover:-rotate-12" />
                  <span className="link-underline">{link.label}</span>
                </a>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </div>
  )
}
