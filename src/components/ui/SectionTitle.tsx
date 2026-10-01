import type { ElementType, ReactNode } from 'react'
import { Emphasis } from './Emphasis'

interface SectionTitleProps {
  text: string
  as?: ElementType
  className?: string
  emphasisClassName?: string
}

/**
 * Título de sección: entra por líneas con máscara (data-reveal="lines", lo anima setupReveals de la sección).
 * `*palabra*` va en la serif itálica.
 */
export function SectionTitle({ text, as: Tag = 'h2', className = '', emphasisClassName }: SectionTitleProps) {
  return (
    <Tag data-reveal="lines" className={className}>
      <Emphasis text={text} className={emphasisClassName} />
    </Tag>
  )
}

/** Antetítulo editorial, sin cápsula ni marcador decorativo. */
export function Label({ children, className = '', tone = 'light' }: { children: ReactNode; className?: string; tone?: 'light' | 'dark' }) {
  const color = tone === 'dark' ? 'text-brand-paper/70' : 'text-brand-deep/70'
  return (
    <p data-reveal="rise" className={`text-label font-semibold uppercase ${color} ${className}`}>
      {children}
    </p>
  )
}
