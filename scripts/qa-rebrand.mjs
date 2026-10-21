/**
 * Capturas de secciones puntuales del rebrand (Clic Studio): va a cada ancla con Lenis y saca una captura.
 * Uso: node scripts/qa-rebrand.mjs [base] [ancho] [alto] [prefijo] [secciones separadas por coma]
 * → %TEMP%/qa/<prefijo>-<sección>.png
 */
import { chromium } from 'playwright'

const out = process.env.TEMP.split(String.fromCharCode(92)).join('/') + '/qa'
const [base = 'http://127.0.0.1:5190', w = '1440', h = '900', prefix = 'rb', list = 'planes,contacto'] = process.argv.slice(2)
const b = await chromium.launch()
const p = await b.newPage({ viewport: { width: +w, height: +h } })
const errors = []
p.on('pageerror', (e) => errors.push(e.message))
await p.goto(`${base}/?debug=1`, { waitUntil: 'load' })
await p.waitForTimeout(7500)
for (const id of list.split(',')) {
  await p.evaluate((id) => window.__lenis.scrollTo(document.getElementById(id), { immediate: true, force: true }), id)
  await p.waitForTimeout(2200)
  await p.screenshot({ path: `${out}/${prefix}-${id}.png` })
}
console.log('errores:', errors.length ? errors.join(' | ') : 'ninguno')
await b.close()
