import type { ComponentProps } from 'react'
import { SECTION_SURFACE, SECTION_TEXT, type PageBg } from '../../lib/pageColors'

interface SectionProps extends ComponentProps<'section'> {
  bg: PageBg
  /** La sección pinta su propio fondo y texto (no usa la capa de fondo interpolada). */
  ownColors?: boolean
}

/**
 * Cada sección controla su superficie y su color de texto; no hay mezclas de fondo durante el scroll.
 */
export function Section({ bg, ownColors = false, className = '', children, ...rest }: SectionProps) {
  return (
    <section data-bg={bg} className={`relative ${SECTION_SURFACE[bg]} ${ownColors ? '' : SECTION_TEXT[bg]} ${className}`} {...rest}>
      {children}
    </section>
  )
}
