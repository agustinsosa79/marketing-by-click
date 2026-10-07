/**
 * QA del panel del blog (correr con el panel en `npm run dev` y PANEL_STORAGE=local apuntando a una copia).
 * Recorre: login → lista → nueva nota con portada → vista previa → publicar → editar → eliminar.
 * Uso: node scripts/qa-panel.mjs [base] [password] [carpeta local] → capturas en %TEMP%/qa/panel-*.png
 */
import { chromium } from 'playwright'
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'

const out = process.env.TEMP.split(String.fromCharCode(92)).join('/') + '/qa'
const [base = 'http://localhost:5180', password = '', root = ''] = process.argv.slice(2)
const image = path.resolve(import.meta.dirname, '..', 'reference/media-original/founder-ian.jpg')
const b = await chromium.launch()
const p = await b.newPage({ viewport: { width: 1440, height: 900 } })
const errors = []
p.on('pageerror', (e) => errors.push(e.message))
p.on('dialog', (d) => d.accept())
const shot = (name, full = false) => p.screenshot({ path: `${out}/panel-${name}.png`, fullPage: full })

await p.goto(base, { waitUntil: 'networkidle' })
await shot('01-login')
await p.fill('#password', 'incorrecta')
await p.click('button[type=submit]')
await p.waitForSelector('[role=alert]')
console.log('login incorrecto:', await p.textContent('[role=alert]'))
await p.fill('#password', password)
await p.click('button[type=submit]')
await p.waitForSelector('text=Notas del blog')
await p.waitForTimeout(800)
await shot('02-lista')

// Nueva nota
await p.click('text=Nueva nota')
await p.fill('#title', 'Cómo medir si tus redes están vendiendo')
await p.fill('#description', 'Tres indicadores simples para saber si tus redes generan ventas y no solo seguidores, y qué hacer con cada uno cada mes.')
await p.click('[role=radio]:has-text("Meta Ads")')
await p.locator('input[type=file]').first().setInputFiles(image)
await p.waitForSelector('text=Cambiar portada')
await p.fill('#coverAlt', 'Ian frente a un lago de la Patagonia')
await p.fill(
  'textarea[aria-label="Texto de la nota"]',
  'Tener muchos seguidores no siempre significa vender. Estos son los tres números que miramos cada mes.\n\n## Consultas por WhatsApp\n\nCuántas personas escriben desde Instagram.\n\n## Ventas atribuidas\n\n- Una lista\n- Con **negrita**\n\n> Más visibilidad, más clientes, más ventas.\n\nMirá nuestro servicio de [Meta Ads](https://marketingbyclic.com/servicios/meta-ads).\n\n<script>alert(1)</script>',
)
await p.waitForTimeout(400)
await shot('03-editor', true)
await p.click('[role=tab]:has-text("Vista previa")')
await p.waitForTimeout(400)
const scripts = await p.locator('.prose script').count()
console.log('vista previa: <script> renderizados =', scripts)
await shot('04-preview', true)
await p.click('button:has-text("Publicar nota")')
await p.waitForSelector('text=¡Nota publicada!')
await p.waitForTimeout(600)
await shot('05-publicada')
const slug = 'como-medir-si-tus-redes-estan-vendiendo'
const md = path.join(root, 'content/blog', `${slug}.md`)
const saved = existsSync(md) ? readFileSync(md, 'utf8') : ''
const cover = saved.match(/cover: (\/media\/blog\/\S+)/)?.[1]
console.log('archivo creado:', existsSync(md), '· portada:', cover, '· imagen en disco:', cover ? existsSync(path.join(root, 'public', cover)) : false)

// Editar
await p.click(`a[href="#/editar/${slug}"] >> nth=1`)
await p.waitForSelector('#title')
await p.fill('#title', 'Cómo medir si tus redes están vendiendo (guía)')
await p.click('button:has-text("Guardar cambios")')
await p.waitForSelector('text=Cambios guardados')
console.log('editada · updated:', /updated: \d{4}-\d{2}-\d{2}/.test(readFileSync(md, 'utf8')))

// Eliminar
await p.waitForTimeout(500)
await p.click(`button[aria-label^="Eliminar Cómo medir"]`)
await p.waitForSelector('dialog[open]')
await shot('06-eliminar')
await p.click('dialog[open] button:has-text("Eliminar")')
await p.waitForSelector('text=Nota eliminada')
console.log('eliminada · archivo:', existsSync(md), '· imagen:', cover ? existsSync(path.join(root, 'public', cover)) : false)

// Celular
const m = await b.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true })
await m.context().addCookies(await p.context().cookies())
await m.goto(base, { waitUntil: 'networkidle' })
await m.waitForTimeout(800)
await m.screenshot({ path: `${out}/panel-07-mobile-lista.png` })
await m.goto(`${base}/#/nueva`, { waitUntil: 'networkidle' })
await m.fill('#title', 'Cómo medir si tus redes están vendiendo')
await m.waitForTimeout(600)
await m.screenshot({ path: `${out}/panel-08-mobile-editor.png` })
const overflow = await m.evaluate(() => document.documentElement.scrollWidth - innerWidth)
console.log('celular · scroll horizontal:', overflow, 'px')

console.log('errores JS:', errors.length ? errors.join(' | ') : 'ninguno')
await b.close()
