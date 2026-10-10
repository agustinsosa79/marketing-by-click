/**
 * QA de las funciones generales del panel (correr con el panel en `npm run dev`, PANEL_STORAGE=local
 * apuntando a una COPIA de content/ y public/media/): inicio, precios, preguntas y proyectos
 * (crear con imágenes, ordenar, destacar, editar, eliminar), en computadora y celular.
 * Uso: node scripts/qa-panel-general.mjs <base> <contraseña> <carpeta de la copia> → %TEMP%/qa/pg-*.png
 */
import { chromium } from 'playwright'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'

const out = process.env.TEMP.split(String.fromCharCode(92)).join('/') + '/qa'
const [base = 'http://localhost:5180', password = '', root = ''] = process.argv.slice(2)
const media = (f) => path.resolve(import.meta.dirname, '..', 'reference/media-original', f)
const json = (f) => JSON.parse(readFileSync(path.join(root, f), 'utf8'))
const log = (...a) => console.log('·', ...a)

const b = await chromium.launch()
const p = await b.newPage({ viewport: { width: 1440, height: 900 } })
const errors = []
p.on('pageerror', (e) => errors.push(e.message))
p.on('dialog', (d) => d.accept())
const shot = (name, full = false) => p.screenshot({ path: `${out}/pg-${name}.png`, fullPage: full })
const toastGone = () => p.locator('[role=status] button[aria-label="Cerrar aviso"]').click().catch(() => {})

// Ingreso + inicio
await p.goto(base, { waitUntil: 'networkidle' })
await p.fill('#password', password)
await p.click('button[type=submit]')
await p.waitForSelector('text=Tu web, en un solo lugar')
await p.waitForTimeout(1200)
await shot('01-inicio')

// Precios
await p.click('nav >> text=Precios')
await p.waitForSelector('#p-plus')
await p.fill('#p-plus', '14a0')
await p.waitForTimeout(300)
await shot('02-precios-planes')
await p.fill('#p-asesoria', '50')
await p.fill('#d-asesoria', 'por sesión')
await p.waitForTimeout(300)
await shot('03-precios-asesoria')
await p.click('button:has-text("Guardar precios") >> visible=true')
await p.waitForSelector('text=Precios guardados')
const precios = json('content/precios.json')
log('precios:', precios.plans.plus === '140' && precios.asesoria.price === '50' ? 'ok' : 'MAL', JSON.stringify(precios.plans), JSON.stringify(precios.asesoria))
await toastGone()

// Preguntas
await p.click('nav >> text=Preguntas')
await p.waitForSelector('text=Preguntas frecuentes')
const before = json('content/faq.json').items.length
await p.click('text=+ Agregar pregunta')
const last = p.locator('section[aria-label^="Pregunta"]').last()
await last.locator('input').fill('¿Trabajan con negocios de otras ciudades?')
await last.locator('textarea').fill('Sí. Trabajamos a distancia, con videollamadas y todo el seguimiento por WhatsApp.')
await last.locator('button[aria-label="Subir"]').click()
await p.waitForTimeout(400)
await shot('04-preguntas')
await p.click('button:has-text("Guardar preguntas") >> visible=true')
await p.waitForSelector('text=Preguntas guardadas')
const faq = json('content/faq.json').items
log('preguntas:', faq.length === before + 1 && faq[before - 1].q.startsWith('¿Trabajan') ? 'ok' : 'MAL', `${before} → ${faq.length}`)
await toastGone()

// Proyecto nuevo con imágenes
await p.click('nav >> text=Proyectos')
await p.waitForSelector('text=El orden de esta lista')
await shot('05-proyectos-lista')
await p.click('text=+ Nuevo proyecto')
await p.waitForSelector('#brand')
await p.fill('#brand', 'Café de Prueba')
await p.fill('#title', 'Contenido y anuncios para llenar el salón')
await p.fill('#summary', 'Proyecto de prueba del panel: estrategia, contenido mensual y campañas en Meta Ads para un café de la ciudad.')
await p.click('button[aria-pressed]:has-text("Contenido")')
await p.click('button[aria-pressed]:has-text("Meta Ads")')
await p.fill('#sector', 'Gastronomía')
await p.fill('#year', '2026')
await p.locator('input[type=file]').nth(0).setInputFiles(media('founder-ian.jpg'))
await p.waitForFunction(() => document.querySelector('#coverAlt') && !document.querySelector('#coverAlt').disabled)
await p.fill('#coverAlt', 'Foto de prueba')
await p.fill('textarea[aria-label="El desafío"]', 'Tenían buen producto pero las redes no traían clientes.\n\nNecesitaban constancia y una forma de medir.')
for (const [i, file] of [media('servicio-contenido.png'), media('servicio-meta-ads.png')].entries()) {
  await p.click('text=+ Agregar paso')
  await p.fill(`input[aria-label="Título del paso ${i + 1}"]`, i ? 'Campañas' : 'Contenido mensual')
  await p.fill(`textarea[aria-label="Texto del paso ${i + 1}"]`, 'Texto de prueba del paso.')
  const step = p.locator('div.bg-brand-paper:has(input[aria-label="Título del paso ' + (i + 1) + '"])')
  await step.locator('input[type=file]').setInputFiles(file)
  await p.waitForSelector(`input[aria-label="Descripción de la imagen del paso ${i + 1}"]`)
  await p.fill(`input[aria-label="Descripción de la imagen del paso ${i + 1}"]`, `Imagen del paso ${i + 1}`)
}
await p.fill('textarea[aria-label="El resultado"]', 'Resultado de prueba.')
await p.locator('input[type=file][multiple]').setInputFiles([media('servicio-estrategia.png'), media('paso-propuesta.png')])
await p.waitForSelector('input[aria-label="Descripción de la imagen 2"]')
await p.fill('input[aria-label="Descripción de la imagen 1"]', 'Pieza 1')
await p.fill('input[aria-label="Descripción de la imagen 2"]', 'Pieza 2')
await p.evaluate(() => scrollTo(0, 0))
await p.waitForTimeout(400)
await shot('06-proyecto-editor')
await shot('06b-proyecto-editor-full', true)
await p.click('[role=tab]:has-text("Vista previa de la página")')
await p.waitForTimeout(600)
await shot('07-proyecto-vista-previa', true)
await p.click('button:has-text("Publicar proyecto") >> visible=true')
await p.waitForSelector('text=¡Proyecto publicado!')
const nuevo = json('content/proyectos/cafe-de-prueba.json')
const files = readdirSync(path.join(root, 'public/media/proyectos'))
const refs = [nuevo.cover, ...nuevo.process.map((s) => s.image), ...nuevo.gallery].map((i) => i.src.split('/').pop())
log('proyecto creado:', refs.every((r) => files.includes(r)) ? 'ok' : 'MAL', `${refs.length} imágenes · orden ${nuevo.order} · ${nuevo.cover.width}x${nuevo.cover.height}`)
await toastGone()

// Lista: el nuevo pasa al principio (y por lo tanto al inicio)
await p.waitForSelector('text=Café de Prueba')
await p.click('li:has-text("Café de Prueba") >> button:has-text("Al principio")')
await p.waitForSelector('text=Café de Prueba pasó al principio')
await p.waitForTimeout(1200)
const orden = [json('content/proyectos/cafe-de-prueba.json').order, json('content/proyectos/hostel-el-duende-errante.json').order]
log('orden:', orden[0] < orden[1] ? 'ok' : 'MAL', orden.join(' / '))
await shot('08-proyectos-lista-2')

// Editar: sacar una imagen de la galería → el archivo se borra
await p.click('a[href="#/proyectos/editar/cafe-de-prueba"] >> nth=1')
await p.waitForSelector('#brand')
const quitada = json('content/proyectos/cafe-de-prueba.json').gallery[1].src.split('/').pop()
await p.click('button[aria-label="Quitar la imagen 2"]')
await p.click('button:has-text("Guardar cambios") >> visible=true')
await p.waitForSelector('text=Cambios guardados')
log('imagen quitada borrada:', existsSync(path.join(root, 'public/media/proyectos', quitada)) ? 'MAL (sigue)' : 'ok')
await toastGone()

// Eliminar
await p.click('button[aria-label="Eliminar Café de Prueba"]')
await p.click('dialog[open] button:has-text("Eliminar")')
await p.waitForSelector('text=Proyecto eliminado')
const quedan = readdirSync(path.join(root, 'public/media/proyectos'))
log('proyecto eliminado:', !existsSync(path.join(root, 'content/proyectos/cafe-de-prueba.json')) && !quedan.some((f) => f.startsWith('cafe-de-prueba')) ? 'ok' : 'MAL', `${quedan.length} imágenes quedan`)

// Celular
const m = await b.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true })
await m.context().addCookies(await p.context().cookies())
for (const [name, hash] of [
  ['09-m-inicio', '#/'],
  ['10-m-precios', '#/precios'],
  ['11-m-proyecto-nuevo', '#/proyectos/nuevo'],
]) {
  await m.goto(`${base}/${hash}`, { waitUntil: 'networkidle' })
  await m.waitForTimeout(700)
  await m.screenshot({ path: `${out}/pg-${name}.png` })
  const overflow = await m.evaluate(() => document.documentElement.scrollWidth - innerWidth)
  log(`celular ${hash}: desborde ${overflow}px`)
}

console.log('errores JS:', errors.length ? errors.join(' | ') : 'ninguno')
await b.close()
