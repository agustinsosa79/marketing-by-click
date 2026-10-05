import { Arrow } from '../ui/Icon'
import { RollText } from '../ui/RollText'

interface MenuItemProps {
  label: string
  href: string
  /** true: el link scrollea a una sección de esta página (no navega). */
  inPage: boolean
  active: boolean
  dimmed: boolean
  onHover: () => void
  onSelect: () => void
}

/** Link del menú: roll de letras y una flecha que entra. */
export function MenuItem({ label, href, inPage, active, dimmed, onHover, onSelect }: MenuItemProps) {
  return (
    <a
      href={href}
      onClick={(e) => {
        if (!inPage) return
        e.preventDefault()
        onSelect()
      }}
      onMouseEnter={onHover}
      onFocus={onHover}
      className={`group flex items-center gap-4 py-0.5 transition duration-500 ease-expo focus-visible:outline-offset-8 md:gap-6 ${dimmed ? 'opacity-50' : 'opacity-100'} ${active ? 'translate-x-2 md:translate-x-4' : ''}`}
    >
      <span className={`grid size-9 shrink-0 place-items-center rounded-full bg-brand-signal text-white transition-transform duration-500 ease-expo md:size-12 ${active ? 'scale-100 rotate-0' : 'scale-0 -rotate-90'}`}>
        <Arrow className="size-4 md:size-6" />
      </span>
      <span className={`font-display text-menu transition-transform duration-500 ease-expo ${active ? 'translate-x-0' : '-translate-x-13 md:-translate-x-18'}`}>
        <RollText text={label} active={active} />
      </span>
    </a>
  )
}
