/**
 * QA de Testimonios en el panel: agregar uno con foto, guardar (JSON + foto WebP), quitar la foto (se borra
 * el archivo) y que el menú del panel entre en escritorio y celular. Con el panel en `npm run dev` sobre una COPIA.
 * Uso: node scripts/qa-panel-testimonios.mjs <base> <contraseña> <carpeta de la copia>
 */
import { chromium } from 'playwright'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'

const [base = 'http://localhost:5180', password = '', root = ''] = process.argv.slice(2)
const out = process.env.TEMP.split(String.fromCharCode(92)).join('/') + '/qa'
const results = []
const check = (name, ok, extra = '') => {
  results.push(ok)
  console.log(ok ? '✓' : '✗', name, extra)
}
const data = () => JSON.parse(readFileSync(path.join(root, 'content/testimonios.json'), 'utf8')).items
const photos = () => {
  const dir = path.join(root, 'public/media/testimonios')
  return existsSync(dir) ? readdirSync(dir) : []
}

const b = await chromium.launch()
const p = await b.newPage({ viewport: { width: 1280, height: 900 } })
const errors = []
p.on('pageerror', (e) => errors.push(e.message))
await p.goto(base, { waitUntil: 'networkidle' })
await p.fill('#password', password)
await p.click('button[type=submit]')
await p.waitForSelector('text=Tu web, en un solo lugar')
const navOverflow = await p.evaluate(() => {
  const nav = [...document.querySelectorAll('header nav')].find((n) => n.offsetParent)
  return nav ? nav.scrollWidth - nav.clientWidth : -1
})
check('menú del panel entra en 1280 px', navOverflow <= 0, `(${navOverflow})`)

await p.goto(`${base}/#/testimonios`, { waitUntil: 'networkidle' })
await p.waitForSelector('text=Testimonios')
const before = data().length
await p.click('button:has-text("+ Agregar testimonio")')
const last = p.locator('section[aria-label^="Testimonio"]').last()
await last.locator('input[id^="t-name-"]').fill('Cliente de Prueba')
await last.locator('input[id^="t-role-"]').fill('Dueña de un café')
await last.locator('textarea').fill('"Trabajar con el estudio nos ordenó la comunicación y empezamos a recibir más consultas."')
await last.locator('input[type=file]').setInputFiles(path.resolve('public/media/founder-ian-sm.webp'))
await p.waitForTimeout(1200)
await p.screenshot({ path: `${out}/tm-01-editor.png` })
await p.click('button:has-text("Guardar testimonios") >> visible=true')
await p.waitForSelector('[role=status] >> text=Testimonios guardados')
const saved = data()
const added = saved[saved.length - 1]
check('se guarda el testimonio nuevo', saved.length === before + 1 && added.name === 'Cliente de Prueba')
check('las comillas escritas se sacan (las pone la web)', !added.text.startsWith('"') && !added.text.endsWith('"'))
check('la foto se guarda como WebP', Boolean(added.photo) && photos().some((f) => added.photo.src.endsWith(f)), photos().join(','))

await last.locator('button:has-text("Quitar foto")').click()
await p.click('button:has-text("Guardar testimonios") >> visible=true')
await p.waitForTimeout(1500)
check('quitar la foto borra el archivo', data()[data().length - 1].photo === null && photos().length === 0)

const m = await b.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true })
await m.context().addCookies(await p.context().cookies())
await m.goto(`${base}/#/testimonios`, { waitUntil: 'networkidle' })
await m.waitForTimeout(800)
check('celular sin desborde', (await m.evaluate(() => document.documentElement.scrollWidth - innerWidth)) === 0)
await m.screenshot({ path: `${out}/tm-02-celular.png`, fullPage: true })

console.log(`${results.filter(Boolean).length}/${results.length} · errores JS:`, errors.length ? errors.join(' | ') : 'ninguno')
await b.close()
