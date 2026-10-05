/**
 * Genera el HTML estático de cada ruta a partir de dist/index.html y del render del servidor (dist-ssr/entry-server.js):
 *   /            → dist/index.html
 *   /blog        → dist/blog/index.html
 *   /blog/<nota> → dist/blog/<nota>/index.html
 *   /404         → dist/404.html
 * Cada página lleva su <head> (title, description, canonical, Open Graph, datos estructurados).
 * También escribe dist/sitemap.xml y dist/blog/rss.xml con las notas publicadas.
 * Corre después de `vite build` y `vite build --ssr src/entry-server.tsx --outDir dist-ssr`.
 */
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const root = path.resolve(import.meta.dirname, '..')
const dist = path.join(root, 'dist')
const { render, head, routes, feeds } = await import(pathToFileURL(path.join(root, 'dist-ssr', 'entry-server.js')).href)
const template = readFileSync(path.join(dist, 'index.html'), 'utf8')
if (!template.includes('<div id="root"></div>')) throw new Error('No encontré <div id="root"></div> en dist/index.html')

// El JS de la app corre después del primer pintado con contenido: el primer contenido no espera a bajar y ejecutar React + GSAP.
const entry = template.match(/<script type="module" crossorigin src="([^"]+)"><\/script>/)
if (!entry) throw new Error('No encontré el <script type="module"> de entrada en dist/index.html')
const loader = `<script type="module">
      let started = false
      const go = () => {
        if (started) return
        started = true
        import('${entry[1]}')
      }
      // espera el primer pintado con contenido; respaldo por si el navegador no lo reporta
      try {
        new PerformanceObserver((list) => list.getEntries().some((e) => e.name === 'first-contentful-paint') && setTimeout(go)).observe({ type: 'paint', buffered: true })
      } catch {
        go()
      }
      setTimeout(go, 1500)
    </script>`

const attr = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const text = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

function setMeta(html, pattern, replacement) {
  if (!pattern.test(html)) throw new Error(`No encontré ${pattern} en el template`)
  return html.replace(pattern, replacement)
}

function page(url) {
  const h = head(url)
  let out = template.replace('<div id="root"></div>', `<div id="root" data-route="${url === '/404' ? '/404' : url}">${render(url)}</div>`)
  out = out.replace(entry[0], loader)
  out = setMeta(out, /<title>[^<]*<\/title>/, `<title>${text(h.title)}</title>`)
  out = setMeta(out, /<meta name="description" content="[^"]*" \/>/, `<meta name="description" content="${attr(h.description)}" />`)
  out = setMeta(out, /<meta property="og:type" content="[^"]*" \/>/, `<meta property="og:type" content="${h.type}" />`)
  out = setMeta(out, /<meta property="og:title" content="[^"]*" \/>/, `<meta property="og:title" content="${attr(h.title)}" />`)
  out = setMeta(out, /<meta property="og:description" content="[^"]*" \/>/, `<meta property="og:description" content="${attr(h.description)}" />`)
  out = setMeta(out, /<meta property="og:url" content="[^"]*" \/>/, `<meta property="og:url" content="${attr(h.canonical)}" />`)
  out = setMeta(out, /<meta property="og:image" content="[^"]*" \/>/, `<meta property="og:image" content="${attr(h.image)}" />`)
  out = setMeta(out, /<link rel="canonical" href="[^"]*" \/>/, `<link rel="canonical" href="${attr(h.canonical)}" />`)
  const extra = [
    h.noindex ? '<meta name="robots" content="noindex" />' : '',
    ...h.jsonLd.map((data) => `<script type="application/ld+json">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>`),
  ]
    .filter(Boolean)
    .join('\n    ')
  if (extra) out = out.replace('</head>', `    ${extra}\n  </head>`)
  return out
}

for (const url of routes()) {
  const file = url === '/' ? path.join(dist, 'index.html') : url === '/404' ? path.join(dist, '404.html') : path.join(dist, ...url.split('/').filter(Boolean), 'index.html')
  mkdirSync(path.dirname(file), { recursive: true })
  writeFileSync(file, page(url))
  console.log(`prerender: ${url}`)
}

const { sitemap, rss } = feeds()
writeFileSync(path.join(dist, 'sitemap.xml'), sitemap)
mkdirSync(path.join(dist, 'blog'), { recursive: true })
writeFileSync(path.join(dist, 'blog', 'rss.xml'), rss)
console.log('prerender: sitemap.xml + blog/rss.xml')

rmSync(path.join(root, 'dist-ssr'), { recursive: true, force: true })
