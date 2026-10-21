/**
 * QA de "proyectos en el inicio" del panel: crea 5 proyectos de prueba (copiando el existente), marca 4 para el inicio,
 * verifica que el 5.º no se pueda sumar, desmarca uno y revisa los archivos. Con el panel en `npm run dev` sobre una COPIA.
 * Uso: node scripts/qa-panel-inicio.mjs <base> <contraseña> <carpeta de la copia>
 */
import { chromium } from 'playwright'
import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'

const [base = 'http://localhost:5180', password = '', root = ''] = process.argv.slice(2)
const dir = path.join(root, 'content/proyectos')
const results = []
const check = (name, ok, extra = '') => {
  results.push(ok)
  console.log(ok ? '✓' : '✗', name, extra)
}

// 5 proyectos publicados en la copia (a partir del existente)
const src = readdirSync(dir).find((f) => f.endsWith('.json') && !f.startsWith('_'))
const base0 = JSON.parse(readFileSync(path.join(dir, src), 'utf8'))
for (let i = 1; i <= 4; i++) writeFileSync(path.join(dir, `prueba-${i}.json`), JSON.stringify({ ...base0, slug: `prueba-${i}`, brand: `Prueba ${i}`, order: 10 + i, home: false }, null, 2))
const homeOf = () => readdirSync(dir).filter((f) => f.endsWith('.json')).filter((f) => JSON.parse(readFileSync(path.join(dir, f), 'utf8')).home === true).length

const b = await chromium.launch()
const p = await b.newPage({ viewport: { width: 1440, height: 900 } })
const errors = []
p.on('pageerror', (e) => errors.push(e.message))
await p.goto(base, { waitUntil: 'networkidle' })
await p.fill('#password', password)
await p.click('button[type=submit]')
await p.waitForSelector('text=Tu web, en un solo lugar')
await p.goto(`${base}/#/proyectos`, { waitUntil: 'networkidle' })
await p.waitForSelector('text=Mostrar en el inicio')

for (let i = 0; i < 4; i++) {
  await p.locator('main button:visible', { hasText: 'Mostrar en el inicio' }).first().click()
  await p.waitForSelector('[role=status]')
  await p.waitForTimeout(600)
}
check('se marcan 4 para el inicio', homeOf() === 4, `(${homeOf()} en los archivos)`)
const fifth = p.locator('main button:visible', { hasText: 'Mostrar en el inicio' }).first()
check('el 5.º no se puede sumar (botón apagado)', await fifth.isDisabled())
await p.locator('main button:visible', { hasText: 'En el inicio' }).first().click()
await p.waitForTimeout(1200)
check('desmarcar uno libera el lugar', homeOf() === 3 && !(await p.locator('main button:visible', { hasText: 'Mostrar en el inicio' }).first().isDisabled()))
check('el aviso cuenta los elegidos', await p.locator('text=3 de 4 elegidos').count() > 0)
console.log(`${results.filter(Boolean).length}/${results.length} · errores JS:`, errors.length ? errors.join(' | ') : 'ninguno')
await b.close()
