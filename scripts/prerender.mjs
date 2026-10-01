/**
 * Inyecta el HTML prerenderizado de la app (dist-ssr/entry-server.js) en dist/index.html.
 * Corre después de `vite build` y `vite build --ssr src/entry-server.tsx --outDir dist-ssr`.
 */
import { readFileSync, rmSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const root = path.resolve(import.meta.dirname, '..')
const { render } = await import(pathToFileURL(path.join(root, 'dist-ssr', 'entry-server.js')).href)
const file = path.join(root, 'dist', 'index.html')
const html = readFileSync(file, 'utf8')
if (!html.includes('<div id="root"></div>')) throw new Error('No encontré <div id="root"></div> en dist/index.html')
let out = html.replace('<div id="root"></div>', `<div id="root">${render()}</div>`)

// El JS de la app corre después del primer pintado con contenido (el wordmark: CSS + fuente precargada):
// el primer contenido no espera a bajar y ejecutar React + GSAP. La animación CSS del wordmark sigue mientras tanto.
const entry = out.match(/<script type="module" crossorigin src="([^"]+)"><\/script>/)
if (!entry) throw new Error('No encontré el <script type="module"> de entrada en dist/index.html')
const loader = `<script type="module">
      let started = false
      const go = () => {
        if (started) return
        started = true
        import('${entry[1]}')
      }
      // espera el primer pintado con contenido (el wordmark); respaldo por si el navegador no lo reporta
      try {
        new PerformanceObserver((list) => list.getEntries().some((e) => e.name === 'first-contentful-paint') && setTimeout(go)).observe({ type: 'paint', buffered: true })
      } catch {
        go()
      }
      setTimeout(go, 1500)
    </script>`
out = out.replace(entry[0], loader)

writeFileSync(file, out)
rmSync(path.join(root, 'dist-ssr'), { recursive: true, force: true })
console.log('prerender: dist/index.html listo')
