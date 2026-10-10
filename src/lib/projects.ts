/**
 * Portfolio: cada proyecto es un JSON en content/proyectos (los crea y edita el cliente desde el panel).
 * Orden: el campo `order` (lo maneja el panel con subir/bajar). Los primeros HOME_LIMIT van en el inicio.
 * Los archivos que empiezan con "_" y los proyectos con draft: true no se publican.
 */

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

export interface Project {
  slug: string
  brand: string
  title: string
  summary: string
  sector: string
  location: string
  year: string
  services: string[]
  cover: ProjectImage
  challenge: string
  process: ProjectStep[]
  result: string
  gallery: ProjectImage[]
  order: number
  draft: boolean
}

/** Cuántos proyectos entran en la sección del inicio. */
export const HOME_LIMIT = 3

const str = (v: unknown) => (typeof v === 'string' ? v.trim() : '')

function image(v: unknown): ProjectImage | null {
  if (!v || typeof v !== 'object') return null
  const i = v as Record<string, unknown>
  const src = str(i.src)
  if (!src.startsWith('/media/')) return null
  return { src, alt: str(i.alt), width: Number(i.width) || 1200, height: Number(i.height) || 900 }
}

/** Normaliza un proyecto: si al JSON le falta algo, el sitio no se rompe (el panel valida al guardar). */
function normalize(raw: Record<string, unknown>): Project | null {
  const cover = image(raw.cover)
  const slug = str(raw.slug)
  if (!slug || !cover || !str(raw.brand)) return null
  return {
    slug,
    brand: str(raw.brand),
    title: str(raw.title),
    summary: str(raw.summary),
    sector: str(raw.sector),
    location: str(raw.location),
    year: str(raw.year),
    services: Array.isArray(raw.services) ? raw.services.map(str).filter(Boolean) : [],
    cover,
    challenge: str(raw.challenge),
    process: Array.isArray(raw.process)
      ? raw.process
          .map((s: Record<string, unknown>) => ({ title: str(s?.title), text: str(s?.text), image: image(s?.image) }))
          .filter((s) => s.title || s.text)
      : [],
    result: str(raw.result),
    gallery: Array.isArray(raw.gallery) ? raw.gallery.map(image).filter((i): i is ProjectImage => i !== null) : [],
    order: Number(raw.order) || 0,
    draft: raw.draft === true,
  }
}

const modules = import.meta.glob<Record<string, unknown>>('/content/proyectos/[!_]*.json', { eager: true, import: 'default' })

/** Proyectos publicados, en el orden elegido en el panel. */
export const projects: Project[] = Object.values(modules)
  .map(normalize)
  .filter((p): p is Project => p !== null && !p.draft)
  .sort((a, b) => a.order - b.order || a.brand.localeCompare(b.brand))

/** Los del inicio: los primeros del orden elegido en el panel. */
export const homeProjects: Project[] = projects.slice(0, HOME_LIMIT)

const SERVICE_ORDER = ['Estrategia', 'Contenido', 'Meta Ads', 'Branding']
const rank = (s: string) => (SERVICE_ORDER.includes(s) ? SERVICE_ORDER.indexOf(s) : SERVICE_ORDER.length)

/** Servicios presentes en el portfolio (para el filtro de /proyectos), en el orden de los servicios del sitio. */
export const projectServices = [...new Set(projects.flatMap((p) => p.services))].sort((a, b) => rank(a) - rank(b))

export const findProject = (slug: string) => projects.find((p) => p.slug === slug) ?? null

/** El siguiente en el orden (vuelve al primero al final). */
export function nextProject(slug: string) {
  if (projects.length < 2) return null
  const i = projects.findIndex((p) => p.slug === slug)
  return projects[(i + 1) % projects.length]
}

export const projectUrl = (slug: string) => `/proyectos/${slug}`

/** "Branding · Hostel · 2025" (lo que haya). */
export const projectMeta = (p: Project) => [p.sector, p.location, p.year].filter(Boolean).join(' · ')
