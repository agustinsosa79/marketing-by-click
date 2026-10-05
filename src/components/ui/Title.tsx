import type { ElementType, ReactNode } from 'react'
import type { Headline } from '../../data/content'
import { splitHeadline } from '../../lib/headline'
import { EMPHASIS, type PageBg } from '../../lib/pageColors'

interface TitleProps {
  title: Headline
  /** Fondo de la sección: define el color del énfasis. */
  tone: PageBg
  as?: ElementType
  className?: string
}

/**
 * Título de sección: Montserrat ExtraBold en mayúscula inicial, el énfasis va solo con color.
 * Entra por líneas con máscara (data-reveal="lines", lo anima setupReveals de la sección).
 */
export function Title({ title, tone, as: Tag = 'h2', className = '' }: TitleProps) {
  const [before, em, after] = splitHeadline(title)
  return (
    <Tag data-reveal="lines" className={`font-display text-title ${className}`}>
      {before}
      {em && <span className={EMPHASIS[tone]}>{em}</span>}
      {after}
    </Tag>
  )
}

/** Antetítulo: trazo corto en azul señal + etiqueta. */
export function Label({ children, tone = 'paper', className = '' }: { children: ReactNode; tone?: PageBg; className?: string }) {
  const color = tone === 'paper' ? 'text-brand-deep' : 'text-brand-haze'
  const line = tone === 'deep' ? 'bg-brand-haze' : 'bg-brand-signal'
  return (
    <p data-reveal="rise" className={`flex items-center gap-3 font-label text-label ${color} ${className}`}>
      <span aria-hidden="true" className={`block h-0.5 w-6 rounded-full ${line}`} />
      {children}
    </p>
  )
}
