import { parse as parseYaml, stringify as stringifyYaml } from 'yaml'
import {
  CATEGORIES,
  DATE_RE,
  LIMITS,
  MEDIA_DIR,
  MEDIA_URL,
  POSTS_DIR,
  SLUG_RE,
  today,
  type NewImage,
  type PostInput,
  type PostSummary,
} from '../shared/blog.js'
import { UserError } from './http.js'
import { validateImages } from './images.js'
import { getStorage, type FileChange } from './storage.js'

/**
 * Notas del blog como archivos Markdown (content/blog/<slug>.md), el mismo formato que lee el sitio
 * (vite-plugin-blog.ts): frontmatter YAML + cuerpo en Markdown.
 */

const postPath = (slug: string) => `${POSTS_DIR}/${slug}.md`
const MEDIA_REF = new RegExp(`${MEDIA_URL}/([a-z0-9-]+\\.(?:webp|jpe?g|png))`, 'g')

function split(source: string) {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/)
  if (!match) return { data: {} as Record<string, unknown>, body: source }
  return { data: (parseYaml(match[1]) ?? {}) as Record<string, unknown>, body: match[2].replace(/^\r?\n/, '') }
}

const str = (v: unknown) => (v === undefined || v === null ? '' : v instanceof Date ? v.toISOString().slice(0, 10) : String(v))

function toPost(slug: string, source: string) {
  const { data, body } = split(source)
  return {
    slug,
    title: str(data.title),
    description: str(data.description),
    date: str(data.date).slice(0, 10),
    updated: data.updated ? str(data.updated).slice(0, 10) : null,
    category: str(data.category),
    cover: str(data.cover),
    coverAlt: str(data.coverAlt),
    author: str(data.author) || 'Ian',
    draft: Boolean(data.draft),
    body,
  }
}

export async function listPosts(): Promise<PostSummary[]> {
  const storage = getStorage()
  const files = (await storage.list(POSTS_DIR)).filter((f) => f.endsWith('.md') && !f.split('/').pop()!.startsWith('_'))
  const posts = await Promise.all(
    files.map(async (file) => {
      const source = await storage.read(file)
      if (source === null) return null
      const { body: _body, coverAlt: _alt, author: _author, ...summary } = toPost(file.split('/').pop()!.replace(/\.md$/, ''), source)
      return summary
    }),
  )
  return posts.filter((p): p is PostSummary => p !== null).sort((a, b) => b.date.localeCompare(a.date))
}

export async function getPost(slug: string) {
  if (!SLUG_RE.test(slug)) throw new UserError('Nota inexistente.', 404)
  const source = await getStorage().read(postPath(slug))
  if (source === null) throw new UserError('Nota inexistente.', 404)
  return toPost(slug, source)
}

// ---------------------------------------------------------------- validación

const oneLine = (s: unknown) => String(s ?? '').replace(/\s+/g, ' ').trim()

function validate(raw: PostInput): PostInput {
  const post: PostInput = {
    slug: String(raw.slug ?? ''),
    title: oneLine(raw.title),
    description: oneLine(raw.description),
    date: String(raw.date ?? ''),
    category: raw.category,
    cover: String(raw.cover ?? ''),
    coverAlt: oneLine(raw.coverAlt),
    author: oneLine(raw.author) || 'Ian',
    draft: Boolean(raw.draft),
    body: String(raw.body ?? '').replace(/\r\n/g, '\n'),
  }
  if (!SLUG_RE.test(post.slug) || post.slug.length > LIMITS.slug.max) throw new UserError('La dirección de la nota no es válida.')
  if (post.title.length < LIMITS.title.min || post.title.length > LIMITS.title.max) throw new UserError(`El título tiene que tener entre ${LIMITS.title.min} y ${LIMITS.title.max} caracteres.`)
  if (post.description.length > LIMITS.description.max) throw new UserError(`El resumen puede tener hasta ${LIMITS.description.max} caracteres.`)
  if (!CATEGORIES.includes(post.category)) throw new UserError('Elegí una categoría.')
  if (!DATE_RE.test(post.date) || Number.isNaN(Date.parse(post.date))) throw new UserError('La fecha no es válida.')
  if (post.coverAlt.length > LIMITS.coverAlt.max || post.author.length > LIMITS.author.max) throw new UserError('Algún campo es demasiado largo.')
  if (post.body.length > LIMITS.body.max) throw new UserError('El texto es demasiado largo.')
  if (post.cover && !new RegExp(`^${MEDIA_URL}/[a-z0-9-]+\\.(webp|jpe?g|png)$`).test(post.cover)) throw new UserError('La portada no es válida.')
  if (!post.draft) {
    if (!post.description) throw new UserError('Para publicar, completá el resumen.')
    if (!post.cover) throw new UserError('Para publicar, agregá una imagen de portada.')
    if (!post.coverAlt) throw new UserError('Para publicar, describí la imagen de portada.')
    if (!post.body.trim()) throw new UserError('Para publicar, escribí el texto de la nota.')
  }
  return post
}

const referencedImages = (post: Pick<PostInput, 'cover' | 'body'>) => new Set([...`${post.cover}\n${post.body}`.matchAll(MEDIA_REF)].map((m) => m[1]))

function serialize(post: PostInput, updated: string | null) {
  const data: Record<string, unknown> = {
    title: post.title,
    description: post.description,
    date: post.date,
    ...(updated ? { updated } : {}),
    category: post.category,
    cover: post.cover,
    coverAlt: post.coverAlt,
    author: post.author,
    draft: post.draft,
  }
  return `---\n${stringifyYaml(data, { lineWidth: 0 })}---\n\n${post.body.trim()}\n`
}

// ---------------------------------------------------------------- escritura

export async function savePost(raw: PostInput, images: NewImage[], mode: 'create' | 'update') {
  const post = validate(raw)
  validateImages(images)
  const storage = getStorage()
  const existing = await storage.read(postPath(post.slug))
  if (mode === 'create' && existing !== null) throw new UserError('Ya existe una nota con esa dirección. Cambiá el título o la dirección.', 409)
  if (mode === 'update' && existing === null) throw new UserError('La nota ya no existe.', 404)

  // Toda imagen que use la nota tiene que existir o venir en este guardado
  const available = new Set((await storage.list(MEDIA_DIR)).map((f) => f.split('/').pop()!))
  const incoming = new Set(images.map((i) => i.name))
  for (const name of images.map((i) => i.name)) if (available.has(name)) throw new UserError('Ya existe una imagen con ese nombre. Volvé a subirla.', 409)
  for (const name of referencedImages(post)) if (!available.has(name) && !incoming.has(name)) throw new UserError(`Falta la imagen ${name}. Volvé a subirla.`)
  // Solo se guardan las imágenes nuevas que la nota realmente usa
  const used = referencedImages(post)

  // Fecha de actualización: si se edita una nota publicada (sirve para Google: "dateModified")
  const before = existing ? toPost(post.slug, existing) : null
  const updated = before && !before.draft && !post.draft ? today() : (before?.updated ?? null)

  const changes: FileChange[] = [
    ...images.filter((i) => used.has(i.name)).map((i) => ({ path: `${MEDIA_DIR}/${i.name}`, content: i.base64, encoding: 'base64' as const })),
    { path: postPath(post.slug), content: serialize(post, updated) },
  ]
  const verb = mode === 'create' ? 'nueva nota' : 'edita'
  await storage.commit(changes, `Blog (panel): ${verb} «${post.title}»${post.draft ? ' [borrador]' : ''}`)
  return { slug: post.slug }
}

export async function deletePost(slug: string) {
  const post = await getPost(slug)
  const storage = getStorage()
  // Imágenes que solo usaba esta nota: se borran también, para no dejar archivos huérfanos
  const others = await Promise.all(
    (await storage.list(POSTS_DIR)).filter((f) => f.endsWith('.md') && f !== postPath(slug)).map((f) => storage.read(f)),
  )
  const usedElsewhere = new Set(others.flatMap((src) => (src ? [...referencedImages(toPost('x', src))] : [])))
  const orphans = [...referencedImages(post)].filter((name) => !usedElsewhere.has(name))
  await storage.commit(
    [{ path: postPath(slug), content: null }, ...orphans.map((name) => ({ path: `${MEDIA_DIR}/${name}`, content: null }))],
    `Blog (panel): elimina «${post.title}»`,
  )
}
