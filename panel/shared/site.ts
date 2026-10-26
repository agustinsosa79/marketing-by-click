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
export const TEXTS_FILE = 'content/textos.json'
export const TESTIMONIALS_FILE = 'content/testimonios.json'
export const TESTIMONIALS_MEDIA_DIR = 'public/media/testimonios'
export const TESTIMONIALS_MEDIA_URL = '/media/testimonios'

// ---------------------------------------------------------------- proyectos

/** Categorías del portfolio: las propuestas que maneja el estudio. */
export const SERVICES = ['Plan de redes', 'Asesoría', 'Branding', 'Servicios adicionales'] as const

/** Categorías anteriores → las actuales (proyectos cargados antes del cambio), sin repetir. */
const LEGACY_SERVICES: Record<string, string> = { Estrategia: 'Plan de redes', Contenido: 'Plan de redes', 'Meta Ads': 'Plan de redes', Diseño: 'Branding' }
export const normalizeServices = (list: unknown[]) => [...new Set(list.map((s) => LEGACY_SERVICES[String(s)] ?? String(s)))]

/** Canales del cliente que se pueden enlazar desde su proyecto (solo direcciones de cada red). */
export const PROJECT_LINKS = [
  { key: 'instagram', label: 'Instagram', host: 'instagram.com', placeholder: 'https://www.instagram.com/marca' },
  { key: 'tiktok', label: 'TikTok', host: 'tiktok.com', placeholder: 'https://www.tiktok.com/@marca' },
  { key: 'linkedin', label: 'LinkedIn', host: 'linkedin.com', placeholder: 'https://www.linkedin.com/company/marca' },
] as const
export type ProjectLinkKey = (typeof PROJECT_LINKS)[number]['key']
export type ProjectLinks = Record<ProjectLinkKey, string>
export const EMPTY_LINKS: ProjectLinks = { instagram: '', tiktok: '', linkedin: '' }

/** Normaliza un link de red: https y del dominio de esa red; si no, error. Vacío = sin link. */
export function cleanProjectLink(key: ProjectLinkKey, raw: unknown): { value: string; error: string | null } {
  const v = String(raw ?? '').trim()
  if (!v) return { value: '', error: null }
  const meta = PROJECT_LINKS.find((l) => l.key === key)!
  let url: URL
  try {
    url = new URL(/^https?:\/\//i.test(v) ? v : `https://${v}`)
  } catch {
    return { value: v, error: `El link de ${meta.label} no es válido.` }
  }
  const okHost = url.hostname === meta.host || url.hostname.endsWith(`.${meta.host}`)
  if (!okHost || v.length > 200) return { value: v, error: `El link de ${meta.label} tiene que ser de ${meta.host}.` }
  url.protocol = 'https:'
  return { value: url.toString(), error: null }
}

/** Cuántos proyectos se muestran en el inicio del sitio (los marcados "En el inicio"). */
export const HOME_LIMIT = 4

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
  /** Elegido para el inicio (hasta HOME_LIMIT). */
  home: boolean
  /** Canales del cliente (vacío = sin link). */
  links: ProjectLinks
}

export interface ProjectSummary {
  slug: string
  brand: string
  title: string
  services: string[]
  cover: string
  order: number
  draft: boolean
  home: boolean
}

export const projectUrl = (slug: string) => `${SITE_URL}/proyectos/${slug}`

/**
 * Los que se ven en el inicio (misma regla que src/lib/projects.ts): los publicados marcados "En el inicio",
 * en el orden de la lista y hasta HOME_LIMIT. Si no hay ninguno marcado, los primeros publicados.
 */
export const homeSlugs = (projects: { slug: string; draft: boolean; home?: boolean }[]) => {
  const published = projects.filter((p) => !p.draft)
  const marked = published.filter((p) => p.home)
  return new Set((marked.length ? marked : published).slice(0, HOME_LIMIT).map((p) => p.slug))
}

/** Cuántos hay marcados para el inicio (publicados). */
export const markedCount = (projects: { draft: boolean; home?: boolean }[]) => projects.filter((p) => !p.draft && p.home).length

/** "A", "A y B", "A, B y C" */
export const listNames = (names: string[]) => (names.length < 2 ? (names[0] ?? '') : `${names.slice(0, -1).join(', ')} y ${names[names.length - 1]}`)

// ---------------------------------------------------------------- precios

export const PLANS = [
  { id: 'inicial', name: 'Inicial' },
  { id: 'plus', name: 'Plus' },
  { id: 'premium', name: 'Premium' },
] as const
export type PlanId = (typeof PLANS)[number]['id']

/** Precio: solo números (sin puntos ni símbolos), hasta 6 cifras. */
export const PRICE_RE = /^\d{1,6}$/

/** Servicios fuera de los planes con precio propio (opcional: vacío = la web no muestra precio). */
export const SERVICE_PRICES = [
  { id: 'asesoria', name: 'Asesoría 1:1', detailHint: 'Ej.: por sesión · 1 hora' },
  { id: 'web', name: 'Sitio web / e-commerce', detailHint: 'Ej.: desde · pago único' },
  { id: 'sesion', name: 'Sesión de fotos y videos', detailHint: 'Ej.: 2 horas' },
  { id: 'branding', name: 'Branding', detailHint: 'Ej.: identidad completa' },
  { id: 'medida', name: 'Soluciones a medida', detailHint: 'Ej.: desde' },
] as const
export type ServicePriceId = (typeof SERVICE_PRICES)[number]['id']
export interface PriceDetail {
  price: string
  detail: string
}

export interface PricesInput extends Record<ServicePriceId, PriceDetail> {
  currency: string
  plans: Record<PlanId, string>
}

/** "2 horas · 100 USD" (o vacío si no tiene precio): igual en la web y en el panel. */
export const priceLabel = (p: PriceDetail | undefined, currency = 'USD') => (p && PRICE_RE.test(p.price) ? [p.detail.trim(), `${p.price} ${currency}`].filter(Boolean).join(' · ') : '')

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

// ---------------------------------------------------------------- testimonios

export interface TestimonialItem {
  name: string
  role: string
  text: string
  photo: { src: string; alt: string } | null
}

export const TESTIMONIAL_LIMITS = { name: { min: 2, max: 60 }, role: { max: 60 }, text: { min: 20, max: 400 }, items: 4, photoBytes: 400_000 }
/** Fotos de testimonios: nombre seguro, siempre WebP (el panel las convierte). */
export const TESTIMONIAL_PHOTO_RE = /^[a-z0-9-]+\.webp$/
