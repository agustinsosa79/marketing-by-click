export type PageBg = 'paper' | 'night' | 'deep' | 'primary' | 'sky'

/** Fondo de página por sección (se interpola con el scroll en una sola capa: hooks/usePageColors.ts). */
export const PAGE_COLORS: Record<PageBg, string> = {
  paper: '#e3e8ff',
  night: '#0c1640',
  deep: '#223a8d',
  primary: '#004aad',
  sky: '#42b8fd',
}

/** Color de texto fijo de cada sección (contraste AA sobre su fondo). */
export const SECTION_TEXT: Record<PageBg, string> = {
  paper: 'text-brand-deep',
  night: 'text-brand-paper',
  deep: 'text-brand-paper',
  primary: 'text-white',
  sky: 'text-brand-night',
}
