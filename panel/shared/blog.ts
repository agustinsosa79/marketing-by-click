/**
 * Reglas del blog compartidas entre el panel (navegador) y las funciones del servidor.
 * El servidor vuelve a validar todo: lo que llega del navegador nunca se da por bueno.
 */

/** Sitio público donde se ven las notas. */
export const SITE_URL = 'https://marketingbyclic.com'

/** Categorías del blog (coinciden con los servicios del sitio). */
export const CATEGORIES = ['Estrategia', 'Contenido', 'Meta Ads', 'Branding'] as const
export type Category = (typeof CATEGORIES)[number]

/** Carpetas del repo que el panel puede tocar. Nada fuera de acá. */
export const POSTS_DIR = 'content/blog'
export const MEDIA_DIR = 'public/media/blog'
/** Cómo se ven las imágenes desde el sitio publicado (public/ se sirve en la raíz). */
export const MEDIA_URL = '/media/blog'

export const LIMITS = {
  title: { min: 3, max: 120, seoMax: 60 },
  description: { max: 300, seoMin: 120, seoMax: 160 },
  coverAlt: { max: 200 },
  author: { max: 60 },
  slug: { max: 80 },
  body: { max: 100_000 },
  /** Bytes por imagen (ya convertida a WebP en el navegador). */
  image: 2_500_000,
  /** Total de imágenes nuevas por guardado: las funciones de Vercel aceptan hasta 4.5 MB por pedido. */
  imagesTotal: 3_200_000,
}

export interface PostInput {
  slug: string
  title: string
  description: string
  date: string
  category: Category
  cover: string
  coverAlt: string
  author: string
  draft: boolean
  body: string
}

export interface PostSummary {
  slug: string
  title: string
  description: string
  date: string
  updated: string | null
  category: string
  cover: string
  draft: boolean
}

/** Imagen nueva subida desde el panel: nombre de archivo + contenido en base64 (WebP). */
export interface NewImage {
  name: string
  base64: string
}

export const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
export const IMAGE_NAME_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*\.webp$/
export const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

export const slugify = (text: string) =>
  text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, LIMITS.slug.max)
    .replace(/-$/, '')

export const today = () => new Date().toISOString().slice(0, 10)

export const postUrl = (slug: string) => `${SITE_URL}/blog/${slug}`
