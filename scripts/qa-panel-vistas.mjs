/**
 * QA de las vistas previas del panel: recorre las pestañas de Precios y todas las secciones de Textos
 * y verifica que ninguna rompa la pantalla (errores JS o pantalla en blanco).
 * Uso: node scripts/qa-panel-vistas.mjs <base> <contraseña>
 */
import { chromium } from 'playwright'

const [base = 'http://localhost:5180', password = ''] = process.argv.slice(2)
const b = await chromium.launch()
const p = await b.newPage({ viewport: { width: 1440, height: 900 } })
const errors = []
p.on('pageerror', (e) => errors.push(e.message))
const alive = () => p.evaluate(() => (document.querySelector('main')?.textContent ?? '').length > 50)
const results = []
const check = (name, ok) => {
  results.push(ok)
  console.log(ok ? '✓' : '✗', name)
}

await p.goto(base, { waitUntil: 'networkidle' })
await p.fill('#password', password)
await p.click('button[type=submit]')
await p.waitForSelector('text=Tu web, en un solo lugar')

await p.goto(`${base}/#/precios`, { waitUntil: 'networkidle' })
for (const tab of ['Servicios', 'Planes']) {
  await p.click(`main button:has-text("${tab}")`)
  await p.waitForTimeout(400)
  check(`precios · ${tab}`, (await alive()) && errors.length === 0)
}

await p.goto(`${base}/#/textos`, { waitUntil: 'networkidle' })
await p.waitForSelector('text=Textos de la web')
const sections = await p.locator('nav[aria-label="Secciones de la web"] button').allTextContents()
for (const label of sections) {
  await p.locator('nav[aria-label="Secciones de la web"] button', { hasText: label.trim() }).first().click()
  await p.waitForTimeout(400)
  check(`textos · ${label.replace(/\d+$/, '').trim()}`, (await alive()) && errors.length === 0)
}

console.log(`${results.filter(Boolean).length}/${results.length} · errores JS:`, errors.length ? errors.join(' | ') : 'ninguno')
await b.close()
