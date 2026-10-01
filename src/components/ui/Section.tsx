import type { ComponentProps } from 'react'
import { SECTION_TEXT, type PageBg } from '../../lib/pageColors'

interface SectionProps extends ComponentProps<'section'> {
  bg: PageBg
  /** La sección pinta su propio fondo y texto (no usa la capa de fondo interpolada). */
  ownColors?: boolean
}

/**
 * Sección de página: sin fondo propio (lo pinta la capa [data-page-bg] de <main>, interpolada con el scroll)
 * y con su color de texto fijo. `data-bg` alimenta la interpolación (hooks/usePageColors.ts).
 */
export function Section({ bg, ownColors = false, className = '', children, ...rest }: SectionProps) {
  return (
    <section data-bg={bg} className={`relative ${ownColors ? '' : SECTION_TEXT[bg]} ${className}`} {...rest}>
      {children}
    </section>
  )
}
