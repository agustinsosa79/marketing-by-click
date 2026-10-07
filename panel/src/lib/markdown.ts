import { Marked, type Tokens } from 'marked'

/**
 * Markdown → HTML para la vista previa del panel. Mismas reglas de seguridad que el sitio:
 * no se permite HTML escrito a mano (se descarta) y los links/imágenes solo pueden ser http(s), mailto o rutas del sitio.
 */
const safeUrl = (href: string) => (/^(https?:\/\/|mailto:|\/|#)/i.test(href) ? href.replace(/"/g, '%22') : '#')
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

type Parser = { parser: { parseInline: (tokens: Tokens.Generic[]) => string } }

export function renderMarkdown(source: string, resolveImage: (src: string) => string) {
  const marked = new Marked({
    gfm: true,
    renderer: {
      html: () => '',
      heading(this: Parser, token: Tokens.Heading) {
        const level = Math.max(2, token.depth)
        return `<h${level}>${this.parser.parseInline(token.tokens)}</h${level}>`
      },
      link(this: Parser, token: Tokens.Link) {
        return `<a href="${safeUrl(token.href)}" target="_blank" rel="noopener noreferrer">${this.parser.parseInline(token.tokens)}</a>`
      },
      image(token: Tokens.Image) {
        const caption = token.title ? `<figcaption>${esc(token.title)}</figcaption>` : ''
        return `<figure><img src="${resolveImage(safeUrl(token.href))}" alt="${esc(token.text)}" />${caption}</figure>`
      },
    },
  })
  return marked.parse(source) as string
}

/** Subtítulos (##) de la nota: arman el índice "En esta nota" del sitio. */
export const headings = (source: string) => [...source.matchAll(/^##\s+(.+)$/gm)].map((m) => m[1].trim())

export const wordCount = (source: string) =>
  source
    .replace(/[#>*_`[\]()!-]/g, ' ')
    .split(/\s+/)
    .filter(Boolean).length
