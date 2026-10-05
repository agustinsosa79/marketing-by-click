/**
 * Blog: las notas son archivos Markdown en content/blog (los crea el cliente desde /admin, Decap CMS).
 * - Listados: solo los datos de cada nota (glob ?meta, entra en el bundle principal, pesa poco).
 * - Página de la nota: su HTML se carga aparte (un chunk por nota) y antes de hidratar (main.tsx).
 * Los archivos que empiezan con "_" (plantillas) y las notas con draft: true no se publican.
 */

export interface PostMeta {
  slug: string
  title: string
  description: string
  date: string
  updated: string | null
  category: string
  cover: string
  coverAlt: string
  author: string
  draft: boolean
  readingMinutes: number
}

export interface TocItem {
  id: string
  text: string
}

export interface Post {
  meta: PostMeta
  html: string
  toc: TocItem[]
}

const metaModules = import.meta.glob<PostMeta>('/content/blog/[!_]*.md', { query: '?meta', import: 'meta', eager: true })
const postModules = import.meta.glob<Post>('/content/blog/[!_]*.md')

/** Notas publicadas, de la más nueva a la más vieja. */
export const posts: PostMeta[] = Object.values(metaModules)
  .filter((p) => !p.draft)
  .sort((a, b) => b.date.localeCompare(a.date))

export const categories = [...new Set(posts.map((p) => p.category))]

export function findPost(slug: string) {
  return posts.find((p) => p.slug === slug) ?? null
}

/** Carga el HTML de una nota (cliente: chunk aparte). */
export async function loadPost(slug: string): Promise<Post | null> {
  const entry = Object.entries(postModules).find(([path]) => path.endsWith(`/${slug}.md`))
  if (!entry || !findPost(slug)) return null
  return entry[1]()
}

/** Notas para "Seguí leyendo": primero las de la misma categoría, después las más nuevas. */
export function relatedPosts(meta: PostMeta, count = 3) {
  const others = posts.filter((p) => p.slug !== meta.slug)
  return [...others.filter((p) => p.category === meta.category), ...others.filter((p) => p.category !== meta.category)].slice(0, count)
}

const dateFormat = new Intl.DateTimeFormat('es-AR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })
export const formatDate = (iso: string) => dateFormat.format(new Date(`${iso}T00:00:00Z`))

export const postUrl = (slug: string) => `/blog/${slug}`
