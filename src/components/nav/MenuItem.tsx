import { RollText } from '../ui/RollText'

interface MenuItemProps {
  label: string
  id: string
  active: boolean
  dimmed: boolean
  onHover: () => void
  onSelect: () => void
}

export function MenuItem({ label, id, active, dimmed, onHover, onSelect }: MenuItemProps) {
  return (
    <a
      href={`#${id}`}
      onClick={(e) => {
        e.preventDefault()
        onSelect()
      }}
      onMouseEnter={onHover}
      onFocus={onHover}
      className={`relative flex items-center py-1 font-editorial text-menu uppercase transition-opacity duration-500 focus-visible:outline-offset-8 ${dimmed ? 'opacity-30' : 'opacity-100'}`}
    >
      {/* flecha del isotipo que entra al hover (fuera del flujo: no descentra el texto) */}
      <span
        aria-hidden="true"
        className={`absolute right-full mr-4 font-label text-big text-brand-sky transition-transform duration-500 ease-expo ${active ? 'translate-x-0 scale-100' : '-translate-x-6 scale-0'}`}
      >
        ↗
      </span>
      <RollText text={label} active={active} />
    </a>
  )
}
