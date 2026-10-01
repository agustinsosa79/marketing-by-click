/**
 * Loop de verificación del preloader contra reference/preloader-ref.mp4.
 *
 * 1. Abre la página con ?debug=preloader a 1920×912 (la timeline queda en pausa en window.__preloaderTl).
 * 2. Para cada t de la tabla hace seek(label "ref" + t) y saca screenshot.
 * 3. Arma reference/compare/compare-<t>.png: referencia | implementación.
 * 4. Mide ambas con la misma función (scripts/lib/measure-preloader.mjs) y escribe las diferencias.
 *
 * Requisitos: `npm run build && npm run preview` (o `npm run dev`) y los frames de
 * reference/preloader-frames (ver `npm run reference:frames`).
 * Uso: npx tsx scripts/compare-preloader.ts [url]
 */
import { chromium } from 'playwright'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { measureInPage } from './lib/measure-preloader.mjs'

const URL_BASE = process.argv[2] ?? 'http://localhost:4173/'
const ROOT = path.resolve(import.meta.dirname, '..')
const FRAMES = path.join(ROOT, 'reference', 'preloader-frames')
const OUT = path.join(ROOT, 'reference', 'compare')
const TIMES = [0, 0.5, 0.67, 0.83, 1.0, 1.17, 2.0]
// Tramos que no están en la referencia (expansión + handoff): solo implementación
const EXTRA = [2.6, 3.0, 3.6]

type Box = { top: number; bottom: number; left?: number; right?: number } | null
type Metrics = { rect: Box; title: Box; below: Box }

const refFile = (t: number) => path.join(FRAMES, `ref-${t.toFixed(2).padStart(5, '0')}.png`)
const dataUrl = (file: string) => 'data:image/png;base64,' + readFileSync(file).toString('base64')

async function main() {
  mkdirSync(OUT, { recursive: true })
  const browser = await chromium.launch()
  const ctx = await browser.newContext({ viewport: { width: 1920, height: 912 }, deviceScaleFactor: 1 })
  // tsx envuelve funciones con __name(): las que viajan a page.evaluate lo necesitan
  await ctx.addInitScript({ content: 'window.__name = (fn) => fn' })

  const page = await ctx.newPage()
  const url = new URL(URL_BASE)
  url.searchParams.set('debug', 'preloader')
  await page.goto(url.toString(), { waitUntil: 'load' })
  await page.waitForFunction(() => '__preloaderTl' in window, null, { timeout: 15_000 })

  const eases = await page.evaluate(() => {
    const g = (window as unknown as { __gsap: { parseEase: (n: string) => (p: number) => number } }).__gsap
    const sample = (n: string) => [0.25, 0.5, 0.75].map((p) => Math.round(g.parseEase(n)(p) * 100) / 100)
    return { hop: sample('hop'), reveal: sample('reveal'), aperture: sample('aperture'), linear: sample('none') }
  })
  console.log('eases registrados (valores en 25/50/75%):', JSON.stringify(eases))

  const tool = await ctx.newPage()
  await tool.setContent('<body style="margin:0"></body>')

  const report: { t: number; ref: Metrics | null; impl: Metrics }[] = []

  for (const t of [...TIMES, ...EXTRA]) {
    await page.evaluate((t) => {
      const tl = (window as unknown as { __preloaderTl: { seek: (v: number) => void; labels: Record<string, number> } }).__preloaderTl
      tl.seek(tl.labels.ref + t)
    }, t)
    await page.waitForTimeout(250) // un par de frames para que pinte el video
    const shot = await page.screenshot()
    const implUrl = 'data:image/png;base64,' + shot.toString('base64')
    const impl = (await tool.evaluate(measureInPage, implUrl)) as Metrics
    const hasRef = existsSync(refFile(t))
    const ref = hasRef ? ((await tool.evaluate(measureInPage, dataUrl(refFile(t)))) as Metrics) : null
    report.push({ t, ref, impl })

    // Lado a lado con etiquetas
    const composite = await tool.evaluate(
      async ({ refUrl, implUrl, t }) => {
        const load = async (src: string) => {
          const i = new Image()
          i.src = src
          await i.decode()
          return i
        }
        const W = 960
        const H = 456
        const c = document.createElement('canvas')
        c.width = refUrl ? W * 2 + 16 : W
        c.height = H + 40
        const x = c.getContext('2d')!
        x.fillStyle = '#111'
        x.fillRect(0, 0, c.width, c.height)
        x.font = 'bold 20px sans-serif'
        x.fillStyle = '#fff'
        let ox = 0
        if (refUrl) {
          x.drawImage(await load(refUrl), 0, 40, W, H)
          x.fillText(`REFERENCIA  t = ${t.toFixed(2)} s`, 12, 28)
          ox = W + 16
        }
        x.drawImage(await load(implUrl), ox, 40, W, H)
        x.fillText(`IMPLEMENTACIÓN  t = ${t.toFixed(2)} s`, ox + 12, 28)
        return c.toDataURL('image/png')
      },
      { refUrl: hasRef ? dataUrl(refFile(t)) : null, implUrl, t },
    )
    writeFileSync(path.join(OUT, `compare-${t.toFixed(2)}.png`), Buffer.from(composite.split(',')[1], 'base64'))
  }

  // Pasada mobile (390×844): sin referencia, solo capturas para revisar
  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 })
  await mobile.goto(url.toString(), { waitUntil: 'load' })
  await mobile.waitForFunction(() => '__preloaderTl' in window, null, { timeout: 15_000 })
  for (const t of [0, 0.5, 0.83, 1.17, 2.0, 2.7, 3.8]) {
    await mobile.evaluate((t) => {
      const tl = (window as unknown as { __preloaderTl: { seek: (v: number) => void; labels: Record<string, number> } }).__preloaderTl
      tl.seek(tl.labels.ref + t)
    }, t)
    await mobile.waitForTimeout(300)
    writeFileSync(path.join(OUT, `mobile-${t.toFixed(2)}.png`), await mobile.screenshot())
  }

  await browser.close()

  // Reporte numérico
  const f = (b: Box) => (b ? `${b.top}–${b.bottom}` : '—')
  const fx = (b: Box) => (b && b.left !== undefined ? ` x${b.left}–${b.right}` : '')
  const lines = ['t      | video (ref → impl)                    | título (ref → impl)     | debajo (ref → impl)']
  for (const r of report) {
    lines.push(
      `${r.t.toFixed(2)}s  | ${(f(r.ref?.rect ?? null) + fx(r.ref?.rect ?? null)).padEnd(17)} → ${(f(r.impl.rect) + fx(r.impl.rect)).padEnd(17)} | ${f(r.ref?.title ?? null).padEnd(10)} → ${f(r.impl.title).padEnd(10)} | ${f(r.ref?.below ?? null)} → ${f(r.impl.below)}`,
    )
  }
  writeFileSync(path.join(OUT, 'report.json'), JSON.stringify({ eases, report }, null, 2))
  writeFileSync(path.join(OUT, 'report.txt'), lines.join('\n') + '\n')
  console.log(lines.join('\n'))
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
