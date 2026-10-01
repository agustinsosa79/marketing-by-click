/**
 * Optimiza los medios extraídos para producción usando el <canvas> de Chromium (sin sharp/ffmpeg):
 * - Convierte a WebP con ancho máximo por uso.
 * - Recorta el isotipo del logo PNG (detecta el hueco transparente entre isotipo y texto).
 * - Saca fotogramas de los videos de stock (posters y fotos de servicios).
 * - Copia el video de stock elegido a public/media/hero.mp4.
 * Los originales quedan en reference/media-original/.
 *
 * Uso: node scripts/optimize-media.mjs  (el video de stock se descarga si falta)
 */
import { chromium } from 'playwright'
import { mkdir, readFile, writeFile, rename, readdir, copyFile, access } from 'node:fs/promises'
import path from 'node:path'

const ROOT = path.resolve(import.meta.dirname, '..')
const MEDIA = path.join(ROOT, 'public', 'media')
const ORIGINALS = path.join(ROOT, 'reference', 'media-original')
const STOCK = path.join(ROOT, 'reference', 'stock')

// Videos de stock (Mixkit, licencia gratuita: https://mixkit.co/license/#videoFree)
const STOCK_VIDEOS = {
  hero: 4915, // manos escribiendo en un celular — preloader + hero
  desk: 4908, // celular + laptop — foto de Meta Ads
  overhead: 4801, // escritorio cenital con gráficos — foto de Estrategia
}

// [archivo original, salida, ancho máximo, calidad]
const IMAGES = [
  ['founder-ian.jpg', 'founder-ian.webp', 1200, 0.8],
  ['founder-ian-mobile.jpg', 'founder-ian-sm.webp', 600, 0.78],
  ['nuestro-trabajo-videollamada.jpg', 'videollamada.webp', 900, 0.8],
  ['branding-duende-logo-completo.png', 'duende-logo-completo.webp', 800, 0.85],
  ['branding-duende-version-reducida.png', 'duende-version-reducida.webp', 800, 0.85],
  ['branding-duende-mockup-remeras.png', 'duende-mockup.webp', 800, 0.85],
  ['video-hero-ian-poster.jpg', 'ian-video-poster.webp', 832, 0.8],
  ['icono-instagram.png', 'icono-instagram.webp', 128, 0.9],
  ['icono-whatsapp.png', 'icono-whatsapp.webp', 128, 0.9],
  ['logo-marketing-by-clic-blanco.png', 'logo.webp', 640, 0.92],
  ['paso-reunion-inicial.png', 'paso-reunion-inicial.webp', 160, 0.9],
  ['paso-investigacion-estrategia.png', 'paso-investigacion-estrategia.webp', 160, 0.9],
  ['paso-propuesta.png', 'paso-propuesta.webp', 160, 0.9],
  ['paso-planificacion-desarrollo.png', 'paso-planificacion-desarrollo.webp', 160, 0.9],
  ['paso-produccion-contenidos.png', 'paso-produccion-contenidos.webp', 160, 0.9],
  ['paso-aprobacion-piezas.png', 'paso-aprobacion-piezas.webp', 160, 0.9],
  ['paso-publicacion.png', 'paso-publicacion.webp', 160, 0.9],
]

// Se quedan tal cual en public/media (favicons) o se mueven sin convertir
const KEEP = new Set(['favicon-32.png', 'favicon-192.png', 'apple-touch-icon-180.png', 'video-hero-ian.mp4'])

const exists = (p) => access(p).then(() => true, () => false)

async function ensureStock() {
  await mkdir(STOCK, { recursive: true })
  for (const id of Object.values(STOCK_VIDEOS)) {
    const file = path.join(STOCK, `mixkit-${id}-720.mp4`)
    if (await exists(file)) continue
    console.log(`  ↓ mixkit ${id}`)
    const res = await fetch(`https://assets.mixkit.co/videos/${id}/${id}-720.mp4`)
    if (!res.ok) throw new Error(`mixkit ${id}: ${res.status}`)
    await writeFile(file, Buffer.from(await res.arrayBuffer()))
  }
}

async function main() {
  await mkdir(ORIGINALS, { recursive: true })
  await ensureStock()

  // si ya se optimizó antes, los originales están en reference/media-original
  const source = async (name) => ((await exists(path.join(MEDIA, name))) ? path.join(MEDIA, name) : path.join(ORIGINALS, name))

  const browser = await chromium.launch()
  const page = await browser.newPage()
  await page.setContent('<body></body>')

  const toWebp = async (buf, mime, maxW, q, crop) =>
    Buffer.from(
      await page.evaluate(
        async ({ b64, mime, maxW, q, crop }) => {
          const img = new Image()
          img.src = `data:${mime};base64,${b64}`
          await img.decode()
          let sx = 0, sw = img.naturalWidth
          const sh = img.naturalHeight
          if (crop === 'isotipo') {
            // primera columna totalmente transparente después del isotipo
            const c = document.createElement('canvas')
            c.width = img.naturalWidth
            c.height = sh
            const x = c.getContext('2d')
            x.drawImage(img, 0, 0)
            const d = x.getImageData(0, 0, c.width, sh).data
            const colHasInk = (col) => {
              for (let y = 0; y < sh; y++) if (d[(y * c.width + col) * 4 + 3] > 8) return true
              return false
            }
            let start = 0
            while (start < c.width && !colHasInk(start)) start++
            let end = start
            while (end < c.width && colHasInk(end)) end++
            sx = start
            sw = end - start
          }
          const scale = Math.min(1, maxW / sw)
          const out = document.createElement('canvas')
          out.width = Math.round(sw * scale)
          out.height = Math.round(sh * scale)
          out.getContext('2d').drawImage(img, sx, 0, sw, sh, 0, 0, out.width, out.height)
          const url = out.toDataURL('image/webp', q)
          return [...atob(url.split(',')[1])].map((ch) => ch.charCodeAt(0))
        },
        { b64: buf.toString('base64'), mime, maxW, q, crop },
      ),
    )

  for (const [from, to, maxW, q] of IMAGES) {
    const src = await source(from)
    const buf = await readFile(src)
    const mime = from.endsWith('.jpg') ? 'image/jpeg' : 'image/png'
    await writeFile(path.join(MEDIA, to), await toWebp(buf, mime, maxW, q))
    if (from === 'logo-marketing-by-clic-blanco.png') {
      await writeFile(path.join(MEDIA, 'isotipo.webp'), await toWebp(buf, mime, 256, 0.92, 'isotipo'))
    }
    console.log(`  ✓ ${to}`)
  }

  // Fotogramas de los videos de stock
  const frame = async (file, t, maxW, q) => {
    const b64 = (await readFile(file)).toString('base64')
    return Buffer.from(
      await page.evaluate(
        async ({ b64, t, maxW, q }) => {
          const v = document.createElement('video')
          v.muted = true
          v.src = `data:video/mp4;base64,${b64}`
          await new Promise((ok) => (v.onloadedmetadata = ok))
          v.currentTime = v.duration * t
          await new Promise((ok) => (v.onseeked = ok))
          const scale = Math.min(1, maxW / v.videoWidth)
          const c = document.createElement('canvas')
          c.width = Math.round(v.videoWidth * scale)
          c.height = Math.round(v.videoHeight * scale)
          c.getContext('2d').drawImage(v, 0, 0, c.width, c.height)
          return [...atob(c.toDataURL('image/webp', q).split(',')[1])].map((ch) => ch.charCodeAt(0))
        },
        { b64, t, maxW, q },
      ),
    )
  }
  const stock = (id) => path.join(STOCK, `mixkit-${id}-720.mp4`)
  await writeFile(path.join(MEDIA, 'hero-poster.webp'), await frame(stock(STOCK_VIDEOS.hero), 0, 1280, 0.72))
  await writeFile(path.join(MEDIA, 'servicio-contenido-foto.webp'), await frame(stock(STOCK_VIDEOS.hero), 0.5, 900, 0.78))
  await writeFile(path.join(MEDIA, 'servicio-meta-ads-foto.webp'), await frame(stock(STOCK_VIDEOS.desk), 0.6, 900, 0.78))
  await writeFile(path.join(MEDIA, 'servicio-estrategia-foto.webp'), await frame(stock(STOCK_VIDEOS.overhead), 0.4, 900, 0.78))
  await copyFile(stock(STOCK_VIDEOS.hero), path.join(MEDIA, 'hero.mp4'))
  console.log('  ✓ hero.mp4 + posters + fotos de servicios')

  await browser.close()

  // Mover originales fuera de public/
  for (const f of await readdir(MEDIA)) {
    if (/\.(png|jpg|jpeg)$/i.test(f) && !KEEP.has(f)) await rename(path.join(MEDIA, f), path.join(ORIGINALS, f))
  }
  console.log('✓ medios optimizados')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
