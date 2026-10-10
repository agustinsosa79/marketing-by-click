/**
 * QA de las páginas de proyectos: /proyectos y la página de cada proyecto, en computadora y celular.
 * Captura de página completa + desborde horizontal + errores de consola.
 * Uso: node scripts/qa-proyectos.mjs [base] → %TEMP%/qa/proy-*.png
 */
import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'

const out = process.env.TEMP.split(String.fromCharCode(92)).join('/') + '/qa'
mkdirSync(out, { recursive: true })
const [base = 'http://localhost:4173'] = process.argv.slice(2)

const b = await chromium.launch()
const errors = []
const viewports = [
  ['desk', { width: 1440, height: 900 }],
  ['mob', { width: 390, height: 844, isMobile: true, hasTouch: true }],
]
const pages = await (async () => {
  const p = await b.newPage()
  await p.goto(`${base}/proyectos/`, { waitUntil: 'load' })
  const links = await p.$$eval('a[href^="/proyectos/"]', (as) => [...new Set(as.map((a) => a.getAttribute('href')))])
  await p.close()
  return ['/proyectos', ...links]
})()

for (const [name, vp] of viewports) {
  const ctx = await b.newContext({ viewport: { width: vp.width, height: vp.height }, isMobile: vp.isMobile, hasTouch: vp.hasTouch })
  for (const url of pages) {
    const p = await ctx.newPage()
    p.on('pageerror', (e) => errors.push(`${url}: ${e.message}`))
    p.on('console', (m) => m.type() === 'error' && errors.push(`${url}: ${m.text()}`))
    // la barra final: el servidor de vista previa de Vite solo sirve el index.html de la carpeta así
    await p.goto(`${base}${url}/`, { waitUntil: 'load' })
    await p.waitForTimeout(1500)
    // bajar de a poco para disparar las entradas al hacer scroll
    const h = await p.evaluate(() => document.documentElement.scrollHeight)
    for (let y = 0; y < h; y += vp.height / 2) {
      await p.evaluate((y) => window.__lenis?.scrollTo(y, { immediate: true }) ?? scrollTo(0, y), y)
      await p.waitForTimeout(250)
    }
    await p.waitForTimeout(1200)
    await p.evaluate(() => window.__lenis?.scrollTo(0, { immediate: true }) ?? scrollTo(0, 0))
    await p.waitForTimeout(400)
    const overflow = await p.evaluate(() => document.documentElement.scrollWidth - innerWidth)
    const slug = url.split('/').filter(Boolean).join('-')
    await p.screenshot({ path: `${out}/proy-${name}-${slug}.png`, fullPage: true })
    console.log(`${name} ${url}: alto ${h}px · desborde horizontal ${overflow}px`)
    await p.close()
  }
  await ctx.close()
}
console.log('errores:', errors.length ? errors.join(' | ') : 'ninguno')
await b.close()
