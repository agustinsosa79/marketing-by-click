import { SLUG_RE, LIMITS, type NewImage } from '../shared/blog.js'
import {
  PROJECT_LIMITS as L,
  PROJECTS_DIR,
  PROJECTS_MEDIA_DIR,
  PROJECTS_MEDIA_URL,
  SERVICES,
  type ProjectImage,
  type ProjectInput,
  type ProjectStep,
  type ProjectSummary,
} from '../shared/site.js'
import { UserError } from './http.js'
import { validateImages } from './images.js'
import { getStorage, type FileChange, type Storage } from './storage.js'

/**
 * Proyectos del portfolio: un JSON por proyecto (content/proyectos/<slug>.json), el mismo formato que lee
 * el sitio (src/lib/projects.ts). Imágenes en public/media/proyectos/*.webp.
 */

const projectPath = (slug: string) => `${PROJECTS_DIR}/${slug}.json`
const IMAGE_SRC_RE = new RegExp(`^${PROJECTS_MEDIA_URL}/([a-z0-9-]+\\.webp)$`)

const line = (v: unknown) => String(v ?? '').replace(/\s+/g, ' ').trim()
/** Texto largo: se respetan los párrafos (línea en blanco), se limpian los espacios de más. */
const block = (v: unknown) =>
  String(v ?? '')
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()

// ---------------------------------------------------------------- lectura

/** Lectura tolerante (para el editor): si el archivo tiene algo raro, se muestra igual y se corrige al guardar. */
function looseImage(v: unknown): ProjectImage | null {
  if (!v || typeof v !== 'object') return null
  const i = v as Record<string, unknown>
  if (!i.src) return null
  return { src: String(i.src), alt: String(i.alt ?? ''), width: Number(i.width) || 0, height: Number(i.height) || 0 }
}

function toInput(slug: string, source: string): ProjectInput | null {
  let raw: Record<string, unknown>
  try {
    raw = JSON.parse(source)
  } catch {
    return null
  }
  if (!raw || typeof raw !== 'object') return null
  const arr = (v: unknown) => (Array.isArray(v) ? v : [])
  return {
    slug,
    brand: String(raw.brand ?? ''),
    title: String(raw.title ?? ''),
    summary: String(raw.summary ?? ''),
    sector: String(raw.sector ?? ''),
    location: String(raw.location ?? ''),
    year: String(raw.year ?? ''),
    services: arr(raw.services).map(String),
    cover: looseImage(raw.cover),
    challenge: String(raw.challenge ?? ''),
    process: arr(raw.process).map((s: Record<string, unknown>) => ({ title: String(s?.title ?? ''), text: String(s?.text ?? ''), image: looseImage(s?.image) })),
    result: String(raw.result ?? ''),
    gallery: arr(raw.gallery)
      .map(looseImage)
      .filter((i): i is ProjectImage => i !== null),
    order: Number(raw.order) || 0,
    draft: raw.draft === true,
  }
}

async function readAll(storage: Storage) {
  const files = (await storage.list(PROJECTS_DIR)).filter((f) => f.endsWith('.json') && !f.split('/').pop()!.startsWith('_'))
  const items = await Promise.all(
    files.map(async (file) => {
      const source = await storage.read(file)
      return source === null ? null : toInput(file.split('/').pop()!.replace(/\.json$/, ''), source)
    }),
  )
  return items.filter((p): p is ProjectInput => p !== null).sort((a, b) => a.order - b.order || a.brand.localeCompare(b.brand))
}

const summary = (p: ProjectInput): ProjectSummary => ({
  slug: p.slug,
  brand: p.brand,
  title: p.title,
  services: p.services,
  cover: p.cover?.src ?? '',
  order: p.order,
  draft: p.draft,
})

export async function listProjects(): Promise<ProjectSummary[]> {
  return (await readAll(getStorage())).map(summary)
}

export async function getProject(slug: string) {
  if (!SLUG_RE.test(slug)) throw new UserError('Proyecto inexistente.', 404)
  const source = await getStorage().read(projectPath(slug))
  const project = source === null ? null : toInput(slug, source)
  if (!project) throw new UserError('Proyecto inexistente.', 404)
  return project
}

// ---------------------------------------------------------------- validación

function image(v: unknown, what: string): ProjectImage | null {
  if (!v || typeof v !== 'object') return null
  const i = v as Record<string, unknown>
  const src = String(i.src ?? '')
  if (!IMAGE_SRC_RE.test(src)) throw new UserError(`${what}: la imagen no es válida. Volvé a subirla.`)
  const width = Math.round(Number(i.width))
  const height = Math.round(Number(i.height))
  if (!(width > 0 && width <= 10_000 && height > 0 && height <= 10_000)) throw new UserError(`${what}: la imagen no es válida. Volvé a subirla.`)
  const alt = line(i.alt)
  if (alt.length > L.alt.max) throw new UserError(`${what}: la descripción de la imagen es demasiado larga.`)
  return { src, alt, width, height }
}

function validate(raw: ProjectInput): ProjectInput {
  if (!raw || typeof raw !== 'object') throw new UserError('Proyecto inválido.')
  const p: ProjectInput = {
    slug: String(raw.slug ?? ''),
    brand: line(raw.brand),
    title: line(raw.title),
    summary: line(raw.summary),
    sector: line(raw.sector),
    location: line(raw.location),
    year: line(raw.year),
    services: [...new Set(Array.isArray(raw.services) ? raw.services.map(String) : [])],
    cover: image(raw.cover, 'Portada'),
    challenge: block(raw.challenge),
    process: [],
    result: block(raw.result),
    gallery: [],
    order: Math.round(Number(raw.order)) || 0,
    draft: raw.draft === true,
  }
  if (!SLUG_RE.test(p.slug) || p.slug.length > LIMITS.slug.max) throw new UserError('La dirección del proyecto no es válida.')
  if (p.brand.length < L.brand.min || p.brand.length > L.brand.max) throw new UserError(`El nombre de la marca tiene que tener entre ${L.brand.min} y ${L.brand.max} caracteres.`)
  if (p.title.length > L.title.max) throw new UserError(`La frase de qué hicieron puede tener hasta ${L.title.max} caracteres.`)
  if (p.summary.length > L.summary.max) throw new UserError(`El resumen puede tener hasta ${L.summary.max} caracteres.`)
  if ([p.sector, p.location, p.year].some((s) => s.length > L.short.max)) throw new UserError('Rubro, ubicación o año son demasiado largos.')
  if (p.services.some((s) => !(SERVICES as readonly string[]).includes(s))) throw new UserError('Hay un servicio inválido.')
  if (p.challenge.length > L.long.max || p.result.length > L.long.max) throw new UserError(`El desafío y el resultado pueden tener hasta ${L.long.max} caracteres cada uno.`)

  const steps = Array.isArray(raw.process) ? raw.process : []
  if (steps.length > L.steps) throw new UserError(`Se pueden cargar hasta ${L.steps} pasos.`)
  p.process = steps
    .map((s: ProjectStep, i: number): ProjectStep => ({ title: line(s?.title), text: block(s?.text), image: image(s?.image, `Paso ${i + 1}`) }))
    .filter((s) => s.title || s.text || s.image)
  for (const s of p.process) {
    if (s.title.length > L.stepTitle.max) throw new UserError(`El título de un paso puede tener hasta ${L.stepTitle.max} caracteres.`)
    if (s.text.length > L.long.max) throw new UserError('El texto de un paso es demasiado largo.')
  }

  const gallery = Array.isArray(raw.gallery) ? raw.gallery : []
  if (gallery.length > L.gallery) throw new UserError(`La galería puede tener hasta ${L.gallery} imágenes.`)
  p.gallery = gallery.map((g, i) => image(g, `Galería, imagen ${i + 1}`)).filter((g): g is ProjectImage => g !== null)

  if (!p.draft) {
    if (!p.cover) throw new UserError('Para publicar, agregá una imagen de portada.')
    if (!p.cover.alt) throw new UserError('Para publicar, describí la imagen de portada.')
    if (!p.summary) throw new UserError('Para publicar, completá el resumen.')
  }
  return p
}

/** Nombres de archivo de todas las imágenes que usa un proyecto. */
const imagesOf = (p: ProjectInput) =>
  new Set(
    [p.cover, ...p.process.map((s) => s.image), ...p.gallery]
      .map((i) => i?.src.match(IMAGE_SRC_RE)?.[1])
      .filter((n): n is string => Boolean(n)),
  )

const serialize = (p: ProjectInput) => `${JSON.stringify(p, null, 2)}\n`

// ---------------------------------------------------------------- escritura

export async function saveProject(raw: ProjectInput, images: NewImage[], mode: 'create' | 'update') {
  const project = validate(raw)
  validateImages(images)
  const storage = getStorage()
  const all = await readAll(storage)
  const before = all.find((p) => p.slug === project.slug) ?? null
  const others = all.filter((p) => p.slug !== project.slug)
  if (mode === 'create' && before) throw new UserError('Ya existe un proyecto con esa dirección. Cambiá el nombre o la dirección.', 409)
  if (mode === 'update' && !before) throw new UserError('El proyecto ya no existe.', 404)

  // El orden lo maneja la lista (subir/bajar): uno nuevo va al final
  project.order = before ? before.order : Math.max(0, ...all.map((p) => p.order)) + 1

  // Toda imagen que use el proyecto tiene que existir o venir en este guardado
  const available = new Set((await storage.list(PROJECTS_MEDIA_DIR)).map((f) => f.split('/').pop()!))
  const incoming = new Set(images.map((i) => i.name))
  for (const name of incoming) if (available.has(name)) throw new UserError('Ya existe una imagen con ese nombre. Volvé a subirla.', 409)
  const used = imagesOf(project)
  for (const name of used) if (!available.has(name) && !incoming.has(name)) throw new UserError('Falta una imagen del proyecto. Volvé a subirla.')

  // Imágenes que el proyecto dejó de usar (y no usa otro): se borran para no dejar archivos huérfanos
  const usedElsewhere = new Set(others.flatMap((p) => [...imagesOf(p)]))
  const dropped = before ? [...imagesOf(before)].filter((n) => !used.has(n) && !usedElsewhere.has(n) && available.has(n)) : []

  const changes: FileChange[] = [
    ...images.filter((i) => used.has(i.name)).map((i) => ({ path: `${PROJECTS_MEDIA_DIR}/${i.name}`, content: i.base64, encoding: 'base64' as const })),
    ...dropped.map((n) => ({ path: `${PROJECTS_MEDIA_DIR}/${n}`, content: null })),
    { path: projectPath(project.slug), content: serialize(project) },
  ]
  const verb = mode === 'create' ? 'nuevo proyecto' : 'edita'
  await storage.commit(changes, `Proyectos (panel): ${verb} «${project.brand}»${project.draft ? ' [borrador]' : ''}`)
  return { slug: project.slug }
}

export async function deleteProject(slug: string) {
  const project = await getProject(slug)
  const storage = getStorage()
  const others = (await readAll(storage)).filter((p) => p.slug !== slug)
  const usedElsewhere = new Set(others.flatMap((p) => [...imagesOf(p)]))
  const orphans = [...imagesOf(project)].filter((n) => !usedElsewhere.has(n))
  await storage.commit(
    [{ path: projectPath(slug), content: null }, ...orphans.map((n) => ({ path: `${PROJECTS_MEDIA_DIR}/${n}`, content: null }))],
    `Proyectos (panel): elimina «${project.brand}»`,
  )
}

/**
 * Cambia la posición de un proyecto en el portfolio: sube, baja o va al principio.
 * Los primeros publicados son los que se ven en el inicio. Renumera 1..n y guarda solo los que cambiaron.
 */
export async function moveProject(slug: string, to: 'up' | 'down' | 'top') {
  const storage = getStorage()
  const all = await readAll(storage)
  const i = all.findIndex((p) => p.slug === slug)
  if (i < 0) throw new UserError('Proyecto inexistente.', 404)
  const j = to === 'top' ? 0 : i + (to === 'up' ? -1 : 1)
  if (j < 0 || j >= all.length || j === i) return
  const [moved] = all.splice(i, 1)
  all.splice(j, 0, moved)
  const changed = all.filter((p, k) => {
    const order = k + 1
    if (p.order === order) return false
    p.order = order
    return true
  })
  if (changed.length === 0) return
  const verb = to === 'top' ? 'pasa al principio' : to === 'up' ? 'sube' : 'baja'
  await storage.commit(
    changed.map((p) => ({ path: projectPath(p.slug), content: serialize(p) })),
    `Proyectos (panel): ${verb} «${moved.brand}» en el orden`,
  )
}
