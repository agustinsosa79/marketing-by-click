import type { ComponentProps } from 'react'
import { SECTION_BG, SECTION_TEXT, type PageBg } from '../../lib/pageColors'

interface SectionProps extends ComponentProps<'section'> {
  bg: PageBg
  /** La sección pinta su propio fondo y texto (no usa la capa de fondo interpolada). */
  ownColors?: boolean
}

/**
 * Sección de página con fondo y texto propios: el contraste es correcto en todo momento del scroll.
 */
export function Section({ bg, ownColors = false, className = '', children, ...rest }: SectionProps) {
  return (
    <section data-bg={bg} className={`relative ${ownColors ? '' : `${SECTION_BG[bg]} ${SECTION_TEXT[bg]}`} ${className}`} {...rest}>
      {children}
    </section>
  )
}
