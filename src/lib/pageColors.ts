export type PageBg = 'paper' | 'night' | 'deep' | 'primary' | 'sky'

/** Superficies sólidas por sección: el texto no depende de un color intermedio del scroll. */
export const SECTION_SURFACE: Record<PageBg, string> = {
  paper: 'bg-brand-paper',
  night: 'bg-brand-night',
  deep: 'bg-brand-deep',
  primary: 'bg-brand-primary',
  sky: 'bg-brand-sky',
}

/** Color de texto fijo de cada sección (contraste AA sobre su fondo). */
export const SECTION_TEXT: Record<PageBg, string> = {
  paper: 'text-brand-deep',
  night: 'text-brand-paper',
  deep: 'text-brand-paper',
  primary: 'text-white',
  sky: 'text-brand-night',
}
