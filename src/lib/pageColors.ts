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

/**
 * Énfasis de los títulos: bold italic (manual de marca) + color.
 * Naranja sobre claro y sobre noche; sobre el azul Clic el naranja no contrasta: va en blanco, solo con la itálica.
 */
export const EMPHASIS: Record<PageBg, string> = {
  paper: 'italic text-brand-flame',
  night: 'italic text-brand-signal',
  deep: 'italic text-white',
}

/** Texto secundario de cada fondo (sobre el azul Clic la bruma no llega a AA: va blanco). */
export const MUTED: Record<PageBg, string> = {
  paper: 'text-brand-night/75',
  night: 'text-brand-haze',
  deep: 'text-white',
}
