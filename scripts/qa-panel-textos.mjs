/**
 * QA de la sección "Textos" del panel (con el panel en `npm run dev`, PANEL_STORAGE=local sobre una COPIA de content/):
 * editar texto y lista, restaurar original, error de largo, guardar, archivo resultante y celular.
 * Uso: node scripts/qa-panel-textos.mjs <base> <contraseña> <carpeta de la copia> → %TEMP%/qa/tx-*.png
 */
import { chromium } from 'playwright'
import { readFileSync } from 'node:fs'
import path from 'node:path'

const out = process.env.TEMP.split(String.fromCharCode(92)).join('/') + '/qa'
const [base = 'http://localhost:5180', password = '', root = ''] = process.argv.slice(2)
// textos que el cliente ya había cambiado antes de la prueba (no cuentan como cambios de esta prueba)
const before = () => Object.keys(JSON.parse(readFileSync(path.join(root, 'content/textos.json'), 'utf8')).values)
const initial = before()
const log = (...a) => console.log('·', ...a)
const b = await chromium.launch()
const p = await b.newPage({ viewport: { width: 1440, height: 900 } })
const errors = []
let native = 0
p.on('pageerror', (e) => errors.push(e.message))
p.on('dialog', (d) => {
  native++
  d.dismiss()
})

await p.goto(base, { waitUntil: 'networkidle' })
await p.fill('#password', password)
await p.click('button[type=submit]')
await p.waitForSelector('text=Tu web, en un solo lugar')
await p.click('nav >> text=Textos')
await p.waitForSelector('text=Textos de la web')
await p.waitForTimeout(800)
await p.screenshot({ path: `${out}/tx-01-servicios.png` })

// Planes: editar "Para quién es" del Plus, un ítem del Premium y forzar un error
await p.click('nav[aria-label="Secciones de la web"] >> text=Planes')
await p.fill('[id="t-planes.plus.for"]', 'Para vender más con anuncios.')
await p.fill('textarea[aria-label="Qué incluye, ítem 4"] >> nth=2', '8 posteos, 12 historias y 10 reels al mes')
await p.fill('[id="t-planes.badge"]', 'El más elegido por nuestros clientes')
await p.waitForTimeout(300)
const tooLong = await p.locator('text=Muy largo: máximo 16 caracteres.').count()
log('error de largo visible:', tooLong > 0)
await p.click('button:has-text("Guardar textos") >> visible=true')
await p.waitForTimeout(400)
log('guardado bloqueado con error:', (await p.locator('[role=alert]').first().textContent())?.includes('Etiqueta del plan destacado'))
await p.locator('[id="t-planes.badge"]').locator('xpath=ancestor::div[contains(@class,"gap-1.5")][1]').locator('text=Restaurar original').click()
log('restaurado al original:', (await p.inputValue('[id="t-planes.badge"]')) === 'Más elegido')
await p.waitForTimeout(400)
await p.screenshot({ path: `${out}/tx-02-planes.png` })
const preview = await p.locator('aside[aria-label="Vista previa"]').textContent()
log('vista previa actualizada:', preview.includes('Para vender más con anuncios.') && preview.includes('10 reels'))

// Servicios: quitar un ítem de la lista de Diseño
await p.click('nav[aria-label="Secciones de la web"] button >> text=/^Servicios\d*$/')
await p.locator('section[aria-label="Diseño"] button[aria-label="Quitar el ítem 5"]').click()
// Nosotros: misión
await p.click('nav[aria-label="Secciones de la web"] >> text=Nosotros')
await p.fill('[id="t-nosotros.missionLead"]', 'Hola, soy Ian. Ayudo a marcas con buen producto a ordenar su comunicación y vender más en redes.')
await p.screenshot({ path: `${out}/tx-03-nosotros.png` })
await p.click('button:has-text("Guardar textos") >> visible=true')
await p.waitForSelector('text=Textos guardados')
const saved = JSON.parse(readFileSync(path.join(root, 'content/textos.json'), 'utf8')).values
log('archivo:', Object.keys(saved).sort().join(', '))
log('solo cambios (sin el badge restaurado):', !('planes.badge' in saved) && Object.keys(saved).filter((k) => !initial.includes(k)).length === 4)

// Sección bloqueada
await p.click('nav[aria-label="Secciones de la web"] >> text=Inicio (portada)')
await p.waitForTimeout(400)
log('portada sin campos editables:', (await p.locator('section[aria-label="Textos bloqueados"] li').count()) === 4 && (await p.locator('main input, main textarea').count()) === 0)
await p.screenshot({ path: `${out}/tx-04-portada.png` })

// Celular
const m = await b.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true })
await m.context().addCookies(await p.context().cookies())
await m.goto(`${base}/#/textos`, { waitUntil: 'networkidle' })
await m.waitForTimeout(900)
await m.selectOption('select', 'diagnostico')
await m.waitForTimeout(400)
log('celular desborde:', await m.evaluate(() => document.documentElement.scrollWidth - innerWidth), 'px')
await m.screenshot({ path: `${out}/tx-05-celular.png`, fullPage: true })

console.log('avisos nativos:', native, '· errores JS:', errors.length ? errors.join(' | ') : 'ninguno')
await b.close()
