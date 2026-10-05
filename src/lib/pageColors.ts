export type PageBg = 'paper' | 'night' | 'deep'

/** Fondo de cada sección. */
export const SECTION_BG: Record<PageBg, string> = {
  paper: 'bg-brand-paper',
  night: 'bg-brand-night',
  deep: 'bg-brand-deep',
}

/** Color de texto fijo de cada sección (contraste AA sobre su fondo). */
export const SECTION_TEXT: Record<PageBg, string> = {
  paper: 'text-brand-night',
  night: 'text-white',
  deep: 'text-white',
}

/** Énfasis de los títulos: solo color, nunca cursiva. Sobre azul Clic el señal no contrasta: va bruma. */
export const EMPHASIS: Record<PageBg, string> = {
  paper: 'text-brand-signal',
  night: 'text-brand-signal',
  deep: 'text-brand-haze',
}

/** Texto secundario de cada fondo. */
export const MUTED: Record<PageBg, string> = {
  paper: 'text-brand-night/70',
  night: 'text-brand-haze',
  deep: 'text-brand-haze',
}
