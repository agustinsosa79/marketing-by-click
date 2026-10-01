/**
 * FASE 0 — Extracción de marketingbyclic.com (sitio exportado desde Canva).
 *
 * Particularidades de Canva que este script resuelve:
 * - `networkidle` nunca llega (conexiones abiertas): se usa `load` + esperas.
 * - El scroll no es del documento sino de un div interno con overflow: se scrollea ese contenedor.
 * - Los titulares animados están partidos letra por letra: se toma el textContent del bloque <p>.
 * - Las fuentes tienen nombres ofuscados: se descargan y se lee la tabla `name` del archivo.
 * - Todos los items del menú apuntan a "/" (anclas por JS): se mapean a las <section> en orden.
 *
 * Uso: npx tsx scripts/scrape.ts
 */
import { chromium, type Page, type BrowserContext } from 'playwright'
import { mkdir, writeFile } from 'node:fs/promises'
import { brotliDecompressSync, inflateSync } from 'node:zlib'
import path from 'node:path'

const BASE = 'https://marketingbyclic.com/'
const ROOT = path.resolve(import.meta.dirname, '..')
const REF = path.join(ROOT, 'reference')
const SHOTS = path.join(REF, 'screenshots')
const FONTS = path.join(REF, 'fonts')
const MEDIA = path.join(ROOT, 'public', 'media')

// Nombre descriptivo de cada <section>, en orden de aparición (coincide con el orden del menú).
const SECTION_KEYS = [
  'hero',
  'nosotros',
  'founder',
  'portfolio',
  'servicio',
  'tiempos',
  'planes',
  'branding',
  'asesoria',
  'contacto',
]

// Nombres descriptivos por hash de Canva (identificados revisando cada archivo).
// Lo que no esté acá se guarda como `<seccion>-img-<n>` para revisarlo a mano.
const MEDIA_NAMES: Record<string, string> = {
  '18414dc884ee304e88b4c42720209db3': 'logo-marketing-by-clic-blanco',
  '097e0f354fb79099107543bd31426230': 'icono-instagram',
  '39d77ee3195529fc84b69d113c1553c3': 'icono-whatsapp',
  '5925d07b533fe973be5d071516a02b47': 'video-hero-ian',
  f880556fac5435ca235868f82eedb105: 'founder-ian',
  '70ca564218c5bfbfb17973b2af7604cd': 'nuestro-trabajo-videollamada',
  daa29d086e5e59b117af764c6be2ad9e: 'servicio-meta-ads',
  '229320d9fac0c0098532beeaa092bba8': 'servicio-contenido',
  d16d99de02d1c1509519d05a79804628: 'servicio-estrategia',
  f23fcb2516526234321b0a4e35e27e3f: 'paso-reunion-inicial',
  '98c839896161a118ee226d40948ed1cf': 'paso-investigacion-estrategia',
  '1a9089c2fd7f9566dd981a33d473d04f': 'paso-propuesta',
  '1fc7506331870f4f592aee19a39304a0': 'paso-planificacion-desarrollo',
  bdd3473d3c42e0a87a2cefbda1ff4e7e: 'paso-produccion-contenidos',
  '6cee040e2a2e79b5efaf33b7bf616122': 'paso-aprobacion-piezas',
  '88ca0e22fd7f621ee9daa6d0fe81abda': 'paso-publicacion',
  bee7a471099c06dbfa73eb658eb95bf2: 'favicon-32',
  '0ec71abdd2082453417001166e56fd56': 'favicon-192',
  '2f75b1f4275ef47a8166917d0e55fdd0': 'apple-touch-icon-180',
  '5753974cb017fd05b913f7a36d6118c7': 'logo-marketing-by-clic-claro',
  a6a99001fafe7bcc70a6662f5109f1e6: 'icono-instagram-claro',
  '12116ecb7d51997b242acdbd40709b31': 'icono-whatsapp-claro',
  e4f4db702e742ea2dcc76ab327b2e859: 'video-hero-ian-poster',
  f04af65dcdca990252690e9e09a06d2b: 'founder-ian-mobile',
  '64ff2c57c9a000579385d745eafe5c22': 'nuestro-trabajo-videollamada-mobile',
  '1b2dd9e2e383d2d4de96e29580ca2ec2': 'branding-duende-logo-completo',
  '96352fb2334203d24e3170a958e35407': 'branding-duende-version-reducida',
  c1497a892347b311d888ca8fba28bed3: 'branding-duende-mockup-remeras',
  d199e497928369c6aebd59676f620ad8: 'planes-cinta-mas-elegido',
  c13af0ad0c639fc9bcb2565b74271588: 'cronograma-flecha',
  f0a7e57372ccdc5093c644a7544f69f7: 'ui-canva-sprite-descartar',
}

/** Medios de marca vistos por red (imágenes y video), incluidos los que Canva desmonta del DOM. */
const networkMedia = new Set<string>()

const VIEWPORTS = {
  desktop: { width: 1440, height: 900, isMobile: false, deviceScaleFactor: 1 },
  mobile: { width: 390, height: 844, isMobile: true, deviceScaleFactor: 2 },
} as const

type Viewport = keyof typeof VIEWPORTS

// ---------- helpers de navegador ----------

async function openPage(ctx: BrowserContext, url: string) {
  const page = await ctx.newPage()
  page.on('response', (res) => {
    if (/\/_assets\/(media|video)\//.test(res.url()) && res.ok()) networkMedia.add(res.url())
  })
  await page.goto(url, { waitUntil: 'load', timeout: 60_000 })
  await page.waitForTimeout(4_000)
  return page
}

/**
 * Canva desmonta links e imágenes que quedan fuera de pantalla, así que se recolectan en cada paso
 * del scroll y se acumulan en `window.__scrape` (por sección).
 */
async function collectVisible(page: Page) {
  await page.evaluate(() => {
    type Store = { links: Record<string, { href: string; section: string; labels: string[]; hasIcon: boolean }>; imgs: Record<string, { url: string; section: string; alt: string; w: number; h: number }> }
    const w = window as unknown as { __scrape?: Store }
    const store = (w.__scrape ??= { links: {}, imgs: {} })
    const clean = (s: string) => s.replace(/ /g, ' ').replace(/\s+/g, ' ').trim()
    document.querySelectorAll<HTMLAnchorElement>('a[href]').forEach((a) => {
      const section = a.closest('section')?.id ?? 'nav'
      const key = `${section}|${a.href}`
      const entry = (store.links[key] ??= { href: a.href, section, labels: [], hasIcon: false })
      // el texto del founder se renderiza como un <a> por letra: usar el párrafo contenedor
      const label = clean((a.closest('p') ?? a).textContent ?? '') || clean(a.getAttribute('aria-label') ?? '')
      if (label && !entry.labels.includes(label)) entry.labels.push(label)
      entry.hasIcon ||= !!a.querySelector('img, svg')
    })
    document.querySelectorAll<HTMLImageElement>('img').forEach((img) => {
      const url = img.currentSrc || img.src
      if (!url || url.startsWith('data:')) return
      store.imgs[url] ??= { url, section: img.closest('section')?.id ?? 'nav', alt: img.alt, w: img.naturalWidth, h: img.naturalHeight }
    })
  })
}

/** Scrollea el contenedor interno de Canva hasta el final para disparar lazy-load y animaciones de entrada. */
async function scrollThrough(page: Page) {
  // Se mueve scrollTop del contenedor directamente: la rueda del mouse no sirve si el puntero
  // queda sobre la navbar (fuera del contenedor).
  const total = await page.evaluate(() => {
    const scroller = [...document.querySelectorAll<HTMLElement>('*')]
      .filter((e) => /(auto|scroll)/.test(getComputedStyle(e).overflowY) && e.scrollHeight > e.clientHeight + 10)
      .sort((a, b) => b.scrollHeight - a.scrollHeight)[0]
    if (!scroller) return 0
    scroller.dataset.scraper = 'scroller'
    return scroller.scrollHeight
  })
  for (let y = 0; y <= total; y += 400) {
    await page.evaluate((top) => {
      const s = document.querySelector<HTMLElement>('[data-scraper="scroller"]')
      if (s) s.scrollTop = top
      else window.scrollTo(0, top)
    }, y)
    await page.waitForTimeout(250)
    await collectVisible(page)
  }
  await page.waitForTimeout(2_500)
  await collectVisible(page)
  // volver arriba
  await page.evaluate(() => {
    document.querySelectorAll<HTMLElement>('*').forEach((e) => {
      if (e.scrollTop > 0) e.scrollTop = 0
    })
  })
  await page.waitForTimeout(800)
}

/**
 * Screenshots full-page con scroll interno: Canva scrollea un div, así que `fullPage` y los
 * screenshots por elemento salen cortados. Se captura el contenedor por tramos, se unen en un
 * <canvas> (en el mismo Chromium) y de esa imagen se recorta cada sección.
 */
async function screenshots(ctx: BrowserContext, page: Page, vp: Viewport, slug: string) {
  const dpr = VIEWPORTS[vp].deviceScaleFactor
  await page.screenshot({ path: path.join(SHOTS, `${slug}-${vp}-nav.png`) })

  const geo = await page.evaluate(() => {
    const scroller = [...document.querySelectorAll<HTMLElement>('*')]
      .filter((e) => /(auto|scroll)/.test(getComputedStyle(e).overflowY) && e.scrollHeight > e.clientHeight + 10)
      .sort((a, b) => b.scrollHeight - a.scrollHeight)[0]
    scroller.dataset.scraper = 'scroller'
    scroller.scrollTop = 0
    const r = scroller.getBoundingClientRect()
    const sections = [...document.querySelectorAll('section')].map((s) => {
      const sr = s.getBoundingClientRect()
      return { top: Math.round(sr.top - r.top), height: Math.round(sr.height) }
    })
    return { x: r.left, y: r.top, width: r.width, height: scroller.clientHeight, total: scroller.scrollHeight, sections }
  })

  const tiles: { y: number; data: string }[] = []
  for (let y = 0; ; y += geo.height) {
    const actual = await page.evaluate((top) => {
      const s = document.querySelector<HTMLElement>('[data-scraper="scroller"]')!
      s.scrollTop = top
      return s.scrollTop
    }, y)
    await page.waitForTimeout(700) // dejar terminar animaciones de entrada
    const buf = await page.screenshot({ clip: { x: geo.x, y: geo.y, width: geo.width, height: geo.height } })
    tiles.push({ y: actual, data: buf.toString('base64') })
    if (actual + geo.height >= geo.total) break
  }

  // Unir tramos y recortar secciones dentro de una página en blanco (canvas)
  const stitchPage = await ctx.newPage()
  const out = await stitchPage.evaluate(
    async ({ tiles, geo, dpr }) => {
      const load = (src: string) =>
        new Promise<HTMLImageElement>((ok, ko) => {
          const img = new Image()
          img.onload = () => ok(img)
          img.onerror = ko
          img.src = src
        })
      // el canvas tiene un alto máximo (~32k px): si no entra, se reduce la escala
      const scale = Math.min(dpr, 32_000 / geo.total)
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(geo.width * scale)
      canvas.height = Math.round(geo.total * scale)
      const c = canvas.getContext('2d')!
      for (const t of tiles) {
        const img = await load(`data:image/png;base64,${t.data}`)
        c.drawImage(img, 0, Math.round(t.y * scale), canvas.width, Math.round(geo.height * scale))
      }
      const full = canvas.toDataURL('image/png')
      // Paleta por píxeles: lo que realmente se ve (texto rasterizado, imágenes de marca, formas).
      // Cuantiza a 5 bits por canal y guarda el color medio de cada bucket.
      const px = c.getImageData(0, 0, canvas.width, canvas.height).data
      const buckets = new Map<number, { n: number; r: number; g: number; b: number }>()
      for (let i = 0; i < px.length; i += 16) {
        const r = px[i], g = px[i + 1], b = px[i + 2]
        const k = ((r >> 3) << 10) | ((g >> 3) << 5) | (b >> 3)
        const e = buckets.get(k) ?? { n: 0, r: 0, g: 0, b: 0 }
        e.n++; e.r += r; e.g += g; e.b += b
        buckets.set(k, e)
      }
      const totalPx = px.length / 16
      const pixels = [...buckets.values()]
        .sort((a, b) => b.n - a.n)
        .slice(0, 24)
        .map((e) => ({
          hex: '#' + [e.r, e.g, e.b].map((v) => Math.round(v / e.n).toString(16).padStart(2, '0')).join(''),
          share: Math.round((e.n / totalPx) * 10000) / 100,
        }))
      const crops = geo.sections.map((s) => {
        const sc = document.createElement('canvas')
        sc.width = canvas.width
        sc.height = Math.round(s.height * scale)
        sc.getContext('2d')!.drawImage(canvas, 0, Math.round(s.top * scale), sc.width, sc.height, 0, 0, sc.width, sc.height)
        return sc.toDataURL('image/png')
      })
      return { full, crops, pixels }
    },
    { tiles, geo, dpr },
  )
  await stitchPage.close()
  await writeFile(path.join(REF, `palette-pixels-${vp}.json`), JSON.stringify(out.pixels, null, 2))

  const save = (file: string, dataUrl: string) => writeFile(path.join(SHOTS, file), Buffer.from(dataUrl.split(',')[1], 'base64'))
  await save(`${slug}-${vp}-full.png`, out.full)
  for (const [i, crop] of out.crops.entries()) {
    await save(`${slug}-${vp}-${String(i + 1).padStart(2, '0')}-${SECTION_KEYS[i] ?? `section-${i + 1}`}.png`, crop)
  }
}

// ---------- extracción en el DOM ----------

interface Block {
  text: string
  tag: string
  role: 'heading' | 'text' | 'link' | 'button'
  fontFamily: string
  fontSize: number
  fontWeight: string
  color: string
  textTransform: string
  top: number
  left: number
  href?: string
}

async function extractDom(page: Page) {
  return page.evaluate(() => {
    const NOISE = [/^\d+(\.\d+)?s$/, /^Toggle mute$/i]
    const clean = (s: string) => s.replace(/ /g, ' ').replace(/\s+/g, ' ').trim()
    const isNoise = (t: string) => !t || NOISE.some((r) => r.test(t))
    const visible = (e: Element) => {
      const r = e.getBoundingClientRect()
      const s = getComputedStyle(e)
      return r.width > 0 && r.height > 0 && s.display !== 'none' && s.visibility !== 'hidden'
    }

    const toBlock = (e: HTMLElement, origin: number) => {
      const s = getComputedStyle(e)
      const r = e.getBoundingClientRect()
      const fontSize = parseFloat(s.fontSize)
      const a = e.closest('a')
      return {
        text: clean(e.textContent ?? ''),
        tag: e.tagName.toLowerCase(),
        role: a ? 'link' : fontSize >= 36 ? 'heading' : 'text',
        fontFamily: s.fontFamily,
        fontSize: Math.round(fontSize * 10) / 10,
        fontWeight: s.fontWeight,
        color: s.color,
        textTransform: s.textTransform,
        top: Math.round(r.top - origin),
        left: Math.round(r.left),
        href: a?.href,
      }
    }

    // El texto de Canva vive en <p>; los titulares animados tienen un <span> por letra.
    const sections = [...document.querySelectorAll<HTMLElement>('section')].map((sec) => {
      const origin = sec.getBoundingClientRect().top
      const blocks = [...sec.querySelectorAll<HTMLElement>('p, h1, h2, h3, h4, li')]
        .filter((e) => !e.parentElement?.closest('p, li'))
        .filter(visible)
        .map((e) => toBlock(e, origin))
        .filter((b) => !isNoise(b.text))
        // orden visual: arriba→abajo, izquierda→derecha (Canva posiciona en absoluto)
        .sort((a, b) => (Math.abs(a.top - b.top) < 12 ? a.left - b.left : a.top - b.top))
      return {
        id: sec.id,
        height: Math.round(sec.getBoundingClientRect().height),
        background: getComputedStyle(sec).backgroundColor,
        blocks,
      }
    })

    // Navegación (fuera de las secciones)
    const navLinks = [...document.querySelectorAll<HTMLAnchorElement>('a')]
      .filter((a) => !a.closest('section'))
      .map((a) => ({ text: clean(a.textContent ?? ''), href: a.href, aria: a.getAttribute('aria-label') }))

    // Links e imágenes acumulados durante el scroll (ver collectVisible)
    type Store = { links: Record<string, { href: string; section: string; labels: string[]; hasIcon: boolean }>; imgs: Record<string, { url: string; section: string; alt: string; w: number; h: number }> }
    const store = (window as unknown as { __scrape?: Store }).__scrape ?? { links: {}, imgs: {} }
    const links = Object.values(store.links).map((l) => ({
      text: l.labels.join(' / '),
      href: l.href,
      section: l.section,
      // Canva usa a veces un ícono (img/svg) como contenido del link
      hasIcon: l.hasIcon,
    }))

    // Medios
    const media: { kind: string; url: string; section: string; alt?: string; w?: number; h?: number; poster?: string }[] = []
    Object.values(store.imgs).forEach((img) => media.push({ kind: 'img', ...img }))
    document.querySelectorAll<HTMLVideoElement>('video').forEach((v) => {
      const src = v.currentSrc || v.src || v.querySelector('source')?.src
      if (src) media.push({ kind: 'video', url: src, section: v.closest('section')?.id ?? 'nav', poster: v.poster || undefined })
    })
    document.querySelectorAll<HTMLElement>('*').forEach((e) => {
      const bg = getComputedStyle(e).backgroundImage
      for (const m of bg.matchAll(/url\(["']?([^"')]+)["']?\)/g)) {
        media.push({ kind: 'bg', url: new URL(m[1], location.href).href, section: e.closest('section')?.id ?? 'nav' })
      }
    })
    document.querySelectorAll<HTMLLinkElement>('link[rel*="icon"], link[rel="preload"][as="image"]').forEach((l) => {
      media.push({ kind: 'icon', url: l.href, section: 'head' })
    })

    // Paleta y tipografía (frecuencia sobre elementos visibles)
    const tally = (map: Record<string, number>, k: string) => (map[k] = (map[k] ?? 0) + 1)
    const color: Record<string, number> = {}
    const background: Record<string, number> = {}
    const border: Record<string, number> = {}
    const svgFill: Record<string, number> = {}
    const family: Record<string, number> = {}
    const weight: Record<string, number> = {}
    const size: Record<string, number> = {}
    const transparent = (c: string) => c === 'rgba(0, 0, 0, 0)' || c === 'transparent'
    // Canva duplica todo el texto en una capa oculta para lectores de pantalla (Times New Roman 10px):
    // sirve para el contenido, pero se excluye de paleta y tipografía.
    const isA11yLayer = (s: CSSStyleDeclaration) => s.fontFamily.includes('Times New Roman')
    document.querySelectorAll<HTMLElement | SVGElement>('body *').forEach((e) => {
      if (!visible(e)) return
      const s = getComputedStyle(e)
      const hasOwnText = [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent!.trim())
      if (hasOwnText && !isA11yLayer(s)) {
        tally(color, s.color)
        tally(family, s.fontFamily)
        tally(weight, s.fontWeight)
        // Canva escala el texto con transform en ancestros: tamaño efectivo = font-size × escala
        const html = e as HTMLElement
        const scale = html.offsetWidth ? e.getBoundingClientRect().width / html.offsetWidth : 1
        tally(size, `${Math.round(parseFloat(s.fontSize) * scale)}px`)
      }
      if (!transparent(s.backgroundColor)) tally(background, s.backgroundColor)
      if (parseFloat(s.borderTopWidth) > 0 && !transparent(s.borderTopColor)) tally(border, s.borderTopColor)
      // Las formas de Canva son SVG con fill por CSS: usar el valor computado
      if (e instanceof SVGGeometryElement) {
        if (s.fill && s.fill !== 'none' && !s.fill.startsWith('url')) tally(svgFill, s.fill)
        if (s.stroke && s.stroke !== 'none' && parseFloat(s.strokeWidth) > 0) tally(svgFill, `stroke ${s.stroke}`)
      }
    })

    // @font-face declarados (para mapear nombre ofuscado → archivo)
    const fontFaces: { family: string; src: string; weight: string; style: string }[] = []
    for (const sheet of [...document.styleSheets]) {
      let rules: CSSRuleList
      try {
        rules = sheet.cssRules
      } catch {
        continue
      }
      for (const rule of [...rules]) {
        if (rule instanceof CSSFontFaceRule) {
          const st = rule.style
          const src = st.getPropertyValue('src').match(/url\(["']?([^"')]+)["']?\)/)?.[1]
          if (src)
            fontFaces.push({
              family: st.getPropertyValue('font-family').replace(/["']/g, '').trim(),
              src: new URL(src, sheet.href ?? location.href).href,
              weight: st.getPropertyValue('font-weight'),
              style: st.getPropertyValue('font-style'),
            })
        }
      }
    }

    return {
      title: document.title,
      meta: Object.fromEntries(
        [...document.querySelectorAll('meta')]
          .map((m) => [m.getAttribute('name') ?? m.getAttribute('property'), m.getAttribute('content')])
          .filter(([k, v]) => k && v),
      ),
      sections,
      navLinks,
      links,
      media,
      palette: { color, background, border, svgFill },
      typography: { family, weight, size },
      fontFaces,
    }
  })
}

// ---------- fuentes: leer el nombre real de la tabla `name` ----------

function readUIntBase128(buf: Buffer, o: { p: number }) {
  let acc = 0
  for (let i = 0; i < 5; i++) {
    const b = buf[o.p++]
    acc = (acc << 7) | (b & 0x7f)
    if (!(b & 0x80)) return acc
  }
  return acc
}

/** Devuelve el buffer sfnt (ttf/otf) a partir de woff2/woff/ttf. Para woff2 solo lo justo para leer `name`. */
function fontTables(buf: Buffer): Map<string, Buffer> {
  const sig = buf.toString('latin1', 0, 4)
  const tables = new Map<string, Buffer>()
  if (sig === 'wOF2') {
    const KNOWN = 'cmap head hhea hmtx maxp name OS/2 post cvt  fpgm glyf loca prep CFF  VORG EBDT EBLC gasp hdmx kern LTSH PCLT VDMX vhea vmtx BASE GDEF GPOS GSUB EBSC JSTF MATH CBDT CBLC COLR CPAL SVG  sbix acnt avar bdat bloc bsln cvar fdsc feat fmtx fvar gvar hsty just lcar mort morx opbd prop trak Zapf Silf Glat Gloc Feat Sill'.match(/.{4}/g)!.map((t) => t)
    const numTables = buf.readUInt16BE(12)
    const compressedSize = buf.readUInt32BE(20)
    const o = { p: 48 }
    const dir: { tag: string; len: number }[] = []
    for (let i = 0; i < numTables; i++) {
      const flags = buf[o.p++]
      const idx = flags & 0x3f
      let tag: string
      if (idx === 0x3f) {
        tag = buf.toString('latin1', o.p, o.p + 4)
        o.p += 4
      } else tag = KNOWN[idx]
      const transform = (flags >> 6) & 0x03
      const origLength = readUIntBase128(buf, o)
      let len = origLength
      const transformed = tag === 'glyf' || tag === 'loca' ? transform === 0 : transform !== 0
      if (transformed) len = readUIntBase128(buf, o)
      dir.push({ tag, len })
    }
    const data = brotliDecompressSync(buf.subarray(o.p, o.p + compressedSize))
    let off = 0
    for (const t of dir) {
      tables.set(t.tag, data.subarray(off, off + t.len))
      off += t.len
    }
  } else if (sig === 'wOFF') {
    const numTables = buf.readUInt16BE(12)
    for (let i = 0; i < numTables; i++) {
      const e = 44 + i * 20
      const tag = buf.toString('latin1', e, e + 4)
      const offset = buf.readUInt32BE(e + 4)
      const compLength = buf.readUInt32BE(e + 8)
      const origLength = buf.readUInt32BE(e + 12)
      const raw = buf.subarray(offset, offset + compLength)
      tables.set(tag, compLength < origLength ? inflateSync(raw) : raw)
    }
  } else {
    const numTables = buf.readUInt16BE(4)
    for (let i = 0; i < numTables; i++) {
      const e = 12 + i * 16
      tables.set(buf.toString('latin1', e, e + 4), buf.subarray(buf.readUInt32BE(e + 8), buf.readUInt32BE(e + 8) + buf.readUInt32BE(e + 12)))
    }
  }
  return tables
}

function fontNames(buf: Buffer) {
  try {
    const name = fontTables(buf).get('name')
    if (!name) return null
    const count = name.readUInt16BE(2)
    const strOffset = name.readUInt16BE(4)
    const out: Record<number, string> = {}
    for (let i = 0; i < count; i++) {
      const r = 6 + i * 12
      const platform = name.readUInt16BE(r)
      const nameId = name.readUInt16BE(r + 6)
      const length = name.readUInt16BE(r + 8)
      const offset = name.readUInt16BE(r + 10)
      if (![1, 2, 4, 6, 16, 17].includes(nameId) || out[nameId]) continue
      const raw = name.subarray(strOffset + offset, strOffset + offset + length)
      out[nameId] = platform === 3 || platform === 0 ? raw.swap16().toString('utf16le') : raw.toString('latin1')
    }
    return {
      family: out[16] ?? out[1],
      subfamily: out[17] ?? out[2],
      fullName: out[4],
      postscript: out[6],
    }
  } catch (err) {
    return { error: (err as Error).message }
  }
}

// ---------- descargas ----------

async function download(url: string) {
  const res = await fetch(url, { headers: { 'user-agent': 'Mozilla/5.0 (scrape marketingbyclic redesign)' } })
  if (!res.ok) throw new Error(`${res.status} ${url}`)
  return Buffer.from(await res.arrayBuffer())
}

function extFrom(url: string, type: string | null) {
  const fromUrl = path.extname(new URL(url).pathname).slice(1)
  if (fromUrl) return fromUrl
  if (type?.includes('svg')) return 'svg'
  if (type?.includes('png')) return 'png'
  if (type?.includes('jpeg')) return 'jpg'
  if (type?.includes('webp')) return 'webp'
  if (type?.includes('mp4')) return 'mp4'
  return 'bin'
}

// ---------- utilidades de color ----------

function toHex(c: string) {
  const m = c.match(/rgba?\(([^)]+)\)/)
  if (!m) return c
  const [r, g, b, a] = m[1].split(',').map((x) => parseFloat(x))
  const hex = '#' + [r, g, b].map((n) => Math.round(n).toString(16).padStart(2, '0')).join('')
  return a !== undefined && a < 1 ? `${hex} @${a}` : hex
}

function rank(map: Record<string, number>, conv: (k: string) => string = (k) => k) {
  const merged: Record<string, number> = {}
  for (const [k, v] of Object.entries(map)) merged[conv(k)] = (merged[conv(k)] ?? 0) + v
  return Object.entries(merged)
    .sort((a, b) => b[1] - a[1])
    .map(([value, count]) => ({ value, count }))
}

// ---------- main ----------

async function main() {
  for (const dir of [REF, SHOTS, FONTS, MEDIA]) await mkdir(dir, { recursive: true })

  const browser = await chromium.launch()
  const results: Record<string, Awaited<ReturnType<typeof extractDom>>> = {}

  // Páginas a recorrer: home + internas que aparezcan en el menú (en Canva suelen ser anclas a "/").
  const pages = new Map<string, string>([[BASE, 'home']])

  for (const vp of Object.keys(VIEWPORTS) as Viewport[]) {
    const ctx = await browser.newContext({
      viewport: { width: VIEWPORTS[vp].width, height: VIEWPORTS[vp].height },
      isMobile: VIEWPORTS[vp].isMobile,
      hasTouch: VIEWPORTS[vp].isMobile,
      deviceScaleFactor: VIEWPORTS[vp].deviceScaleFactor,
      locale: 'es-AR',
    })
    // tsx/esbuild envuelve funciones con __name(); las funciones que viajan a page.evaluate lo necesitan.
    await ctx.addInitScript({ content: 'window.__name = (fn) => fn' })
    for (const [url, slug] of [...pages]) {
      console.log(`→ ${vp} ${url}`)
      const page = await openPage(ctx, url)
      await scrollThrough(page)
      const data = await extractDom(page)
      if (vp === 'desktop') {
        results[slug] = data
        // descubrir páginas internas reales (distinto pathname, mismo dominio)
        for (const l of data.links) {
          const u = new URL(l.href)
          if (u.origin === new URL(BASE).origin && u.pathname !== '/' && !pages.has(u.origin + u.pathname)) {
            pages.set(u.origin + u.pathname, u.pathname.replace(/\W+/g, '-').replace(/^-|-$/g, ''))
          }
        }
      } else {
        results[`${slug}@mobile`] = data
      }
      await screenshots(ctx, page, vp, slug)
      await page.close()
    }
    await ctx.close()
  }
  await browser.close()

  const home = results.home
  const mobile = results['home@mobile']
  const sectionKey = (id: string) => {
    const i = home.sections.findIndex((s) => s.id === id)
    return i >= 0 ? (SECTION_KEYS[i] ?? `section-${i + 1}`) : id
  }

  // ---- content.json
  const menu = home.navLinks.filter((l) => l.text && !/^marketing by clic$/i.test(l.text)).map((l) => l.text)
  const content = {
    source: BASE,
    scrapedAt: new Date().toISOString(),
    title: home.title,
    meta: home.meta,
    nav: {
      brand: home.navLinks.find((l) => /marketing by clic/i.test(l.text))?.text ?? null,
      menu: menu.map((label, i) => ({ label, target: SECTION_KEYS[i + 1] ?? null })),
    },
    sections: home.sections.map((s, i) => ({
      key: SECTION_KEYS[i] ?? `section-${i + 1}`,
      id: s.id,
      background: toHex(s.background),
      blocks: s.blocks.map(({ text, role, fontSize, fontWeight, color, href }) => ({
        text,
        role,
        fontSize,
        fontWeight,
        color: toHex(color),
        ...(href ? { href } : {}),
      })),
    })),
    // El layout mobile de Canva es otro árbol; se guarda el texto plano para comparar.
    mobileTextBySection: mobile?.sections.map((s, i) => ({
      key: SECTION_KEYS[i] ?? `section-${i + 1}`,
      text: s.blocks.map((b) => b.text),
    })),
  }
  await writeFile(path.join(REF, 'content.json'), JSON.stringify(content, null, 2))

  // ---- links.json
  const classify = (href: string) => {
    if (/wa\.me|whatsapp/i.test(href)) return 'whatsapp'
    if (/^mailto:/i.test(href)) return 'email'
    if (/^tel:/i.test(href)) return 'phone'
    if (/instagram|facebook|tiktok|linkedin|youtube|twitter|x\.com|behance|pinterest/i.test(href)) return 'social'
    if (href.startsWith(BASE) || new URL(href).hostname.endsWith('marketingbyclic.com')) return 'internal'
    return 'external'
  }
  // Desktop y mobile son árboles distintos (ids de sección distintos): se deduplica por destino + sección lógica.
  const mobileKey = (id: string) => {
    const i = mobile?.sections.findIndex((s) => s.id === id) ?? -1
    return i >= 0 ? (SECTION_KEYS[i] ?? `section-${i + 1}`) : id
  }
  const byKey = new Map<string, { href: string; section: string; labels: string[]; hasIcon: boolean; viewports: string[] }>()
  const addLinks = (list: typeof home.links, vp: string, keyOf: (id: string) => string) => {
    for (const l of list) {
      const section = l.section === 'nav' ? 'nav' : keyOf(l.section)
      const k = `${section}|${l.href}`
      const e = byKey.get(k) ?? { href: l.href, section, labels: [], hasIcon: false, viewports: [] }
      for (const t of l.text.split(' / ')) if (t && !e.labels.includes(t)) e.labels.push(t)
      e.hasIcon ||= l.hasIcon
      if (!e.viewports.includes(vp)) e.viewports.push(vp)
      byKey.set(k, e)
    }
  }
  addLinks(home.links, 'desktop', sectionKey)
  if (mobile) addLinks(mobile.links, 'mobile', mobileKey)
  const links = [...byKey.values()].map((l) => ({ ...l, type: classify(l.href) }))
  const grouped = Object.groupBy(links, (l) => l.type)
  await writeFile(
    path.join(REF, 'links.json'),
    JSON.stringify(
      {
        note: 'Los items del menú de Canva apuntan todos a "/" y hacen scroll por JS a la sección; `target` indica a qué sección van.',
        menu: content.nav.menu,
        ...grouped,
      },
      null,
      2,
    ),
  )

  // ---- media → public/media
  const mediaLog: { file: string; source: string; section: string; kind: string; size?: string }[] = []
  const done = new Set<string>()
  const perSectionCount: Record<string, number> = {}
  // lo que pasó por red y no quedó en el DOM (Canva desmonta lo que sale de pantalla)
  const fromNetwork = [...networkMedia].map((url) => ({ kind: /\/video\//.test(url) ? 'video' : 'img', url, section: 'extra' }))
  const all = [
    ...home.media.map((m) => ({ ...m, section: ['nav', 'head'].includes(m.section) ? m.section : sectionKey(m.section) })),
    ...(mobile?.media ?? []).map((m) => ({ ...m, section: ['nav', 'head'].includes(m.section) ? m.section : mobileKey(m.section) })),
    ...fromNetwork,
  ]
  for (const m of all) {
    // blob: = video por MediaSource (mobile); el mp4 real ya se baja en desktop
    if (done.has(m.url) || m.url.startsWith('blob:') || m.url.startsWith('data:')) continue
    done.add(m.url)
    const sec = m.section
    const n = (perSectionCount[`${sec}-${m.kind}`] = (perSectionCount[`${sec}-${m.kind}`] ?? 0) + 1)
    try {
      const res = await fetch(m.url)
      if (!res.ok) throw new Error(String(res.status))
      const buf = Buffer.from(await res.arrayBuffer())
      const ext = extFrom(m.url, res.headers.get('content-type'))
      const label = m.kind === 'video' ? 'video' : m.kind === 'icon' ? 'favicon' : m.kind === 'bg' ? 'bg' : 'img'
      const hash = path.basename(new URL(m.url).pathname, `.${ext}`)
      const file = `${MEDIA_NAMES[hash] ?? `${sec}-${label}-${n}`}.${ext}`
      await writeFile(path.join(MEDIA, file), buf)
      mediaLog.push({ file: `media/${file}`, source: m.url, section: sec, kind: m.kind, size: m.w ? `${m.w}x${m.h}` : undefined })
      if (m.poster) {
        const p = await download(m.poster)
        const pf = `${sec}-video-${n}-poster.${extFrom(m.poster, null)}`
        await writeFile(path.join(MEDIA, pf), p)
        mediaLog.push({ file: `media/${pf}`, source: m.poster, section: sec, kind: 'poster' })
      }
    } catch (err) {
      console.warn(`  ! media ${m.url.slice(0, 80)}: ${(err as Error).message}`)
    }
  }
  await writeFile(path.join(REF, 'media.json'), JSON.stringify(mediaLog, null, 2))

  // ---- fuentes
  const fontMap: Record<string, unknown> = {}
  for (const ff of home.fontFaces) {
    if (fontMap[`${ff.family}|${ff.weight}|${ff.style}`]) continue
    try {
      const buf = await download(ff.src)
      const ext = extFrom(ff.src, null)
      await writeFile(path.join(FONTS, `${ff.family}-${ff.weight || 'normal'}.${ext}`), buf)
      fontMap[`${ff.family}|${ff.weight}|${ff.style}`] = { ...ff, ...fontNames(buf) }
    } catch (err) {
      fontMap[`${ff.family}|${ff.weight}|${ff.style}`] = { ...ff, error: (err as Error).message }
    }
  }
  const realName = (fam: string) => {
    const first = fam.split(',')[0].replace(/["']/g, '').trim()
    const hit = Object.values(fontMap).find((f) => (f as { family: string }).family === first) as { family: string; fullName?: string } | undefined
    const resolved = hit && (hit as Record<string, string>)
    return resolved?.fullName ? `${first} → ${resolved.fullName}` : first
  }

  // ---- palette.json / typography.json
  await writeFile(
    path.join(REF, 'palette.json'),
    JSON.stringify(
      {
        sectionBackgrounds: home.sections.map((s, i) => ({ key: SECTION_KEYS[i], background: toHex(s.background) })),
        color: rank(home.palette.color, toHex),
        backgroundColor: rank(home.palette.background, toHex),
        borderColor: rank(home.palette.border, toHex),
        svgFill: rank(home.palette.svgFill, (c) => (c.startsWith('#') ? c.toLowerCase() : toHex(c))),
      },
      null,
      2,
    ),
  )
  await writeFile(
    path.join(REF, 'typography.json'),
    JSON.stringify(
      {
        fontFaces: fontMap,
        fontFamily: rank(home.typography.family, realName),
        fontWeight: rank(home.typography.weight),
        fontSize: rank(home.typography.size).sort((a, b) => parseFloat(b.value) - parseFloat(a.value)),
        mobileFontSize: mobile ? rank(mobile.typography.size).sort((a, b) => parseFloat(b.value) - parseFloat(a.value)) : [],
      },
      null,
      2,
    ),
  )

  console.log(`✓ ${home.sections.length} secciones · ${links.length} links · ${mediaLog.length} medios · ${Object.keys(fontMap).length} fuentes`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
