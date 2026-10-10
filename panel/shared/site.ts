/**
 * Reglas de lo que el panel edita además del blog: proyectos, precios y preguntas frecuentes.
 * Se comparten entre el panel (navegador) y las funciones del servidor; el servidor vuelve a validar todo.
 * El formato de los archivos es el mismo que lee el sitio (src/lib/projects.ts y src/data/content.ts).
 */
import { SITE_URL } from './blog.js'

// ---------------------------------------------------------------- archivos del repo que se pueden tocar

export const PROJECTS_DIR = 'content/proyectos'
export const PROJECTS_MEDIA_DIR = 'public/media/proyectos'
export const PROJECTS_MEDIA_URL = '/media/proyectos'
export const PRICES_FILE = 'content/precios.json'
export const FAQ_FILE = 'content/faq.json'

// ---------------------------------------------------------------- proyectos

/** Servicios que se pueden marcar en un proyecto (los mismos del sitio). */
export const SERVICES = ['Estrategia', 'Contenido', 'Meta Ads', 'Branding'] as const

/** Cuántos proyectos se muestran en el inicio del sitio: los primeros publicados de la lista. */
export const HOME_LIMIT = 3

export const PROJECT_LIMITS = {
  brand: { min: 2, max: 80 },
  title: { max: 120 },
  summary: { max: 300, seoMin: 80, seoMax: 160 },
  short: { max: 60 },
  long: { max: 2_000 },
  alt: { max: 200 },
  stepTitle: { max: 80 },
  steps: 8,
  gallery: 12,
}

export interface ProjectImage {
  src: string
  alt: string
  width: number
  height: number
}

export interface ProjectStep {
  title: string
  text: string
  image: ProjectImage | null
}

export interface ProjectInput {
  slug: string
  brand: string
  title: string
  summary: string
  sector: string
  location: string
  year: string
  services: string[]
  cover: ProjectImage | null
  challenge: string
  process: ProjectStep[]
  result: string
  gallery: ProjectImage[]
  order: number
  draft: boolean
}

export interface ProjectSummary {
  slug: string
  brand: string
  title: string
  services: string[]
  cover: string
  order: number
  draft: boolean
}

export const projectUrl = (slug: string) => `${SITE_URL}/proyectos/${slug}`

/** Los que se ven en el inicio: los primeros publicados, en el orden de la lista. */
export const homeSlugs = (projects: { slug: string; draft: boolean }[]) =>
  new Set(
    projects
      .filter((p) => !p.draft)
      .slice(0, HOME_LIMIT)
      .map((p) => p.slug),
  )

/** "A", "A y B", "A, B y C" */
export const listNames = (names: string[]) => (names.length < 2 ? (names[0] ?? '') : `${names.slice(0, -1).join(', ')} y ${names[names.length - 1]}`)

// ---------------------------------------------------------------- precios

export const PLANS = [
  { id: 'inicial', name: 'Inicial' },
  { id: 'plus', name: 'Plus' },
  { id: 'premium', name: 'Premium' },
] as const
export type PlanId = (typeof PLANS)[number]['id']

export interface PricesInput {
  currency: string
  plans: Record<PlanId, string>
  asesoria: { price: string; detail: string }
  sesion: { price: string; detail: string }
}

/** Precio: solo números (sin puntos ni símbolos), hasta 6 cifras. */
export const PRICE_RE = /^\d{1,6}$/
export const PRICE_DETAIL_MAX = 40

// ---------------------------------------------------------------- preguntas frecuentes

export interface FaqItem {
  q: string
  a: string
}

export const FAQ_LIMITS = { q: 200, a: 1_000, items: 20 }

/** Un archivo editado desde el panel + la versión que se leyó (para no pisar cambios hechos en el medio). */
export interface Versioned<T> {
  data: T
  version: string
}
