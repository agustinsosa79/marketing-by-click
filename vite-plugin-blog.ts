import { readFileSync } from 'node:fs'
import { Marked, type Tokens } from 'marked'
import type { Plugin } from 'vite'
import { parse as parseYaml } from 'yaml'

/**
 * Notas del blog en Markdown (content/blog/*.md, las escribe el cliente desde el panel: panel/README.md).
 * Cada archivo se importa como módulo JS en dos variantes:
 *   nota.md?meta → solo los datos (listados: el HTML de todas las notas no entra en el bundle)
 *   nota.md      → datos + HTML + índice de títulos (la página de la nota, en su propio chunk)
 */

const slugify = (text: string) =>
  text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

function split(source: string) {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/)
  if (!match) return { data: {} as Record<string, unknown>, body: source }
  return { data: (parseYaml(match[1]) ?? {}) as Record<string, unknown>, body: match[2] }
}

const toDate = (value: unknown) => {
  if (value instanceof Date) return value.toISOString().slice(0, 10)
  return String(value ?? '').slice(0, 10)
}

/**
 * Seguridad: los links e imágenes de las notas solo pueden ser http(s), mailto o rutas del sitio
 * (nada de "javascript:"), y los textos que van dentro de atributos se escapan.
 */
const safeUrl = (href: string) => (/^(https?:\/\/|mailto:|\/|#)/i.test(href) ? href.replace(/"/g, '%22') : '#')
const escapeHtml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

function compile(id: string, source: string) {
  const file = id.split('/').pop()!.replace(/\.md$/, '')
  const { data, body } = split(source)
  const toc: { id: string; text: string }[] = []
  const used = new Set<string>()

  const marked = new Marked({
    gfm: true,
    renderer: {
      heading(this: { parser: { parseInline: (t: Tokens.Generic[]) => string } }, token: Tokens.Heading) {
        const text = this.parser.parseInline(token.tokens)
        const plain = token.text.replace(/[*_`]/g, '')
        let anchor = slugify(plain) || 'seccion'
        while (used.has(anchor)) anchor += '-2'
        used.add(anchor)
        // el título de la nota es el h1 de la página: dentro del cuerpo los niveles arrancan en h2
        const level = Math.max(2, token.depth)
        if (level === 2) toc.push({ id: anchor, text: plain })
        return `<h${level} id="${anchor}">${text}</h${level}>`
      },
      // HTML escrito a mano en la nota: se descarta (las notas las escribe el cliente desde el panel)
      html: () => '',
      image(token: Tokens.Image) {
        const caption = token.title ? `<figcaption>${escapeHtml(token.title)}</figcaption>` : ''
        return `<figure><img src="${safeUrl(token.href)}" alt="${escapeHtml(token.text)}" loading="lazy" decoding="async" />${caption}</figure>`
      },
      link(this: { parser: { parseInline: (t: Tokens.Generic[]) => string } }, token: Tokens.Link) {
        const external = /^https?:\/\//.test(token.href) && !token.href.includes('marketingbyclic.com')
        const attrs = external ? ' target="_blank" rel="noopener noreferrer"' : ''
        return `<a href="${safeUrl(token.href)}"${attrs}>${this.parser.parseInline(token.tokens)}</a>`
      },
    },
  })

  const html = (marked.parse(body) as string)
    // las imágenes sueltas quedan envueltas en <p>: se saca para no anidar <figure> dentro de <p>
    .replace(/<p>(<figure>[\s\S]*?<\/figure>)<\/p>/g, '$1')
  const words = body.replace(/<!--[\s\S]*?-->/g, '').split(/\s+/).filter(Boolean).length

  const meta = {
    slug: String(data.slug ?? slugify(file)),
    title: String(data.title ?? file),
    description: String(data.description ?? ''),
    date: toDate(data.date),
    updated: data.updated ? toDate(data.updated) : null,
    category: String(data.category ?? 'Estrategia'),
    cover: String(data.cover ?? ''),
    coverAlt: String(data.coverAlt ?? ''),
    author: String(data.author ?? 'Ian'),
    draft: Boolean(data.draft),
    readingMinutes: Math.max(1, Math.round(words / 200)),
  }
  return { meta, html, toc }
}

export function blogPlugin(): Plugin {
  return {
    name: 'mbc-blog-markdown',
    load(id) {
      const [path, query] = id.split('?')
      if (!path.endsWith('.md') || !path.includes('/content/blog/')) return null
      const { meta, html, toc } = compile(path, readFileSync(path, 'utf8'))
      if (query === 'meta') return `export const meta = ${JSON.stringify(meta)}`
      return `export const meta = ${JSON.stringify(meta)}\nexport const html = ${JSON.stringify(html)}\nexport const toc = ${JSON.stringify(toc)}`
    },
  }
}
