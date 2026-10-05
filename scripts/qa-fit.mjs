/**
 * QA de "una sección = una pantalla": baja a cada sección, saca una captura y mide su alto contra el viewport.
 * También busca texto desbordado (scrollWidth > clientWidth) en títulos y párrafos.
 * Uso: node scripts/qa-fit.mjs [url] [ancho] [alto] [prefijo]
 * Salida: %TEMP%/qa/<prefijo>-fit-<sección>.png
 */
import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'

const out = process.env.TEMP.split(String.fromCharCode(92)).join('/') + '/qa'
mkdirSync(out, { recursive: true })
const [url = 'http://localhost:4173/?debug=1', w = '1440', h = '900', prefix = 'desk'] = process.argv.slice(2)

const b = await chromium.launch()
const p = await b.newPage({ viewport: { width: +w, height: +h }, deviceScaleFactor: 1, hasTouch: +w < 800, isMobile: +w < 800 })
const errors = []
p.on('pageerror', (e) => errors.push(e.message))
p.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
await p.goto(url, { waitUntil: 'load' })
await p.waitForTimeout(6500)
await p.screenshot({ path: `${out}/${prefix}-fit-00-hero.png` })
// hero ya recortado en tarjeta
await p.evaluate(() => window.__lenis.scrollTo(window.innerHeight, { immediate: true }))
await p.waitForTimeout(1200)
await p.screenshot({ path: `${out}/${prefix}-fit-01-hero-card.png` })

const ids = ['servicios', 'caso', 'proceso', 'diagnostico', 'planes', 'preguntas', 'nosotros', 'contacto']
for (const [i, id] of ids.entries()) {
  await p.evaluate((id) => window.__lenis.scrollTo(document.getElementById(id), { immediate: true }), id)
  await p.waitForTimeout(400)
  // segunda pasada: las posiciones pueden moverse cuando cargan imágenes
  await p.evaluate((id) => window.__lenis.scrollTo(document.getElementById(id), { immediate: true }), id)
  await p.waitForTimeout(2200)
  const info = await p.evaluate((id) => {
    const el = document.getElementById(id)
    const overflow = [...el.querySelectorAll('h1,h2,h3,p,li,a,span')]
      .filter((n) => n.offsetParent && n.scrollWidth > n.clientWidth + 1 && getComputedStyle(n).overflow !== 'visible' && !n.closest('[data-roll],.no-scrollbar'))
      .slice(0, 5)
      .map((n) => `${n.tagName}.${(n.className || '').toString().slice(0, 40)} "${n.textContent.slice(0, 30)}"`)
    return { height: el.offsetHeight, vh: window.innerHeight, overflow }
  }, id)
  console.log(`${id}: ${info.height}px / ${info.vh}px ${info.height > info.vh ? '✗ NO ENTRA' : '✓'}${info.overflow.length ? ' · desborde: ' + info.overflow.join(' | ') : ''}`)
  await p.screenshot({ path: `${out}/${prefix}-fit-${String(i + 2).padStart(2, '0')}-${id}.png` })
}
await p.evaluate(() => window.__lenis.scrollTo(document.documentElement.scrollHeight, { immediate: true }))
await p.waitForTimeout(2500)
await p.screenshot({ path: `${out}/${prefix}-fit-09-footer.png` })
console.log(`errores: ${errors.length ? errors.join(' | ') : 'ninguno'}`)
console.log(out)
await b.close()
