/**
 * QA de "Fotos y video" del panel (con el panel en `npm run dev`, PANEL_STORAGE=local sobre una COPIA de content/ y public/media/):
 * cambiar la foto de la portada (dos tamaños), cambiar solo una descripción, restaurar, subir un video chico
 * (sin comprimir) y uno pesado (se comprime en el navegador), archivos resultantes y celular.
 * Uso: node scripts/qa-panel-fotos.mjs <base> <contraseña> <carpeta de la copia> → %TEMP%/qa/fv-*.png
 */
import { chromium } from 'playwright'
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import path from 'node:path'

const out = process.env.TEMP.split(String.fromCharCode(92)).join('/') + '/qa'
const [base = 'http://localhost:5180', password = '', root = ''] = process.argv.slice(2)
const repo = path.resolve(import.meta.dirname, '..')
const log = (...a) => console.log('·', ...a)
const media = () => JSON.parse(readFileSync(path.join(root, 'content/medios.json'), 'utf8')).values
const siteFiles = () => (existsSync(path.join(root, 'public/media/sitio')) ? readdirSync(path.join(root, 'public/media/sitio')) : [])
const onDisk = (src) => existsSync(path.join(root, 'public', src))

// el sonido del video tiene que poder reproducirse para comprimirlo (en uso real lo habilita el clic del usuario)
const b = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] })
const p = await b.newPage({ viewport: { width: 1440, height: 900 } })
const errors = []
let native = 0
p.on('pageerror', (e) => errors.push(e.message))
p.on('dialog', (d) => {
  native++
  d.dismiss()
})
const card = (label) => p.locator(`section[aria-label="${label}"]`)

await p.goto(base, { waitUntil: 'networkidle' })
await p.fill('#password', password)
await p.click('button[type=submit]')
await p.waitForSelector('text=Tu web, en un solo lugar')
await p.click('nav >> text=Fotos')
await p.waitForSelector('text=Fotos y video')
await p.waitForTimeout(1200)
await p.screenshot({ path: `${out}/fv-01.png`, fullPage: true })

// 1. Portada: foto nueva → dos tamaños
await card('Foto principal').locator('input[type=file]').setInputFiles(path.join(repo, 'reference/media-original/nuestro-trabajo-videollamada.jpg'))
await card('Foto principal').locator('text=Nueva ·').waitFor()
await card('Foto principal').locator('input:not([type=file])').fill('Ian trabajando en una videollamada con un cliente')
await p.screenshot({ path: `${out}/fv-02-portada.png` })
await card('Foto principal').locator('button:has-text("Publicar foto")').click()
await p.waitForSelector('text=Foto publicada')
const hero = media()['hero.photo']
log('portada guardada:', Boolean(hero && onDisk(hero.src) && onDisk(hero.srcSm)), hero && `${hero.width}x${hero.height}`)

// 2. Asesoría: solo la descripción (sin archivo nuevo)
await card('Foto de la asesoría').locator('input:not([type=file])').fill('Ian en una videollamada de asesoría')
await card('Foto de la asesoría').locator('button:has-text("Guardar descripción")').click()
await p.waitForSelector('text=Foto publicada >> nth=0')
await p.waitForTimeout(400)
const ases = media()['asesoria.photo']
log('solo descripción:', ases?.src === '/media/videollamada.webp' && ases?.alt === 'Ian en una videollamada de asesoría')

// 3. Restaurar la portada → se borran sus archivos
const heroFiles = [hero.src, hero.srcSm]
await card('Foto principal').locator('button:has-text("Restaurar original")').click()
await p.waitForSelector('dialog[open]')
await p.screenshot({ path: `${out}/fv-03-restaurar.png` })
await p.click('dialog[open] button:has-text("Restaurar original")')
await p.waitForSelector('text=Foto original restaurada')
log('restaurada y archivos borrados:', !media()['hero.photo'] && heroFiles.every((f) => !onDisk(f)))

// 4. Video chico (2,6 MB): se sube tal cual
const video = card('Video de presentación')
await video.locator('input[type=file]').setInputFiles(path.join(repo, 'public/media/video-hero-ian.mp4'))
await video.locator('text=Nuevo ·').waitFor({ timeout: 30000 })
log('video chico:', await video.locator('text=Nuevo ·').textContent())
await video.locator('button:has-text("Publicar video")').click()
await p.waitForSelector('text=Video publicado')
const v1 = media()['nosotros.video']
log('video guardado:', Boolean(v1 && onDisk(v1.src) && onDisk(v1.poster)), `duración ${v1?.duration}s`)

// 5. Video pesado (4,6 MB): se comprime en el navegador
const t0 = Date.now()
await video.locator('input[type=file]').setInputFiles(path.join(repo, 'reference/stock/mixkit-4915-720.mp4'))
await video.locator('text=Comprimiendo').waitFor({ timeout: 20000 })
await p.screenshot({ path: `${out}/fv-04-comprimiendo.png` })
await video.locator('text=Nuevo ·').waitFor({ timeout: 120000 })
log('video comprimido:', await video.locator('text=Nuevo ·').textContent(), `en ${Math.round((Date.now() - t0) / 1000)} s`)
await video.locator('button:has-text("Publicar video")').click()
await p.waitForSelector('text=Video publicado >> nth=0')
await p.waitForTimeout(500)
const v2 = media()['nosotros.video']
const bytes = readFileSync(path.join(root, 'public', v2.src))
const kind = bytes.subarray(4, 8).toString('ascii') === 'ftyp' ? 'mp4' : bytes[0] === 0x1a ? 'webm' : '?'
log('video pesado guardado:', `${(statSync(path.join(root, 'public', v2.src)).size / 1e6).toFixed(2)} MB ${kind}`, '· anterior borrado:', !onDisk(v1.src))
await p.screenshot({ path: `${out}/fv-05-video.png`, fullPage: true })
log('archivos en media/sitio:', siteFiles().join(', '))

// Celular
const m = await b.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true })
await m.context().addCookies(await p.context().cookies())
await m.goto(`${base}/#/fotos`, { waitUntil: 'networkidle' })
await m.waitForTimeout(1000)
log('celular desborde:', await m.evaluate(() => document.documentElement.scrollWidth - innerWidth), 'px')
await m.screenshot({ path: `${out}/fv-06-celular.png`, fullPage: true })

console.log('avisos nativos:', native, '· errores JS:', errors.length ? errors.join(' | ') : 'ninguno')
await b.close()
