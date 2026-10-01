/**
 * Recorrido visual de la página: espera el preloader, baja con Lenis por tramos y saca una captura por tramo.
 * Uso: node scripts/qa-sections.mjs [url] [ancho] [alto] [prefijo] [paso en viewports]
 * Salida: %TEMP%/qa/<prefijo>-NN.png + una hoja de contacto <prefijo>-sheet.png
 */
import { chromium } from 'playwright'
import { mkdirSync, readFileSync } from 'node:fs'

const out = process.env.TEMP.split(String.fromCharCode(92)).join('/') + '/qa'
mkdirSync(out, { recursive: true })
const [url = 'http://localhost:4173/?debug=1', w = '1920', h = '912', prefix = 'desk', step = '0.75'] = process.argv.slice(2)

const b = await chromium.launch()
const p = await b.newPage({ viewport: { width: +w, height: +h }, deviceScaleFactor: 1 })
const errors = []
p.on('pageerror', (e) => errors.push(e.message))
p.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
await p.goto(url, { waitUntil: 'load' })
await p.waitForTimeout(7000) // preloader completo

const total = await p.evaluate(() => document.documentElement.scrollHeight)
const vh = +h
const shots = []
let y = 0
let i = 0
while (y < total - vh + 1 && i < 90) {
  await p.evaluate((y) => window.__lenis.scrollTo(y, { duration: 0.6 }), y)
  await p.waitForTimeout(1500)
  const file = `${out}/${prefix}-${String(i).padStart(2, '0')}.png`
  await p.screenshot({ path: file })
  shots.push({ file, y })
  i++
  y = Math.min(total - vh, y + vh * +step)
  if (y === total - vh && shots.at(-1).y === y) break
}

// Hoja de contacto
const cols = +w > 800 ? 3 : 6
const cw = +w > 800 ? 620 : 300
const sheet = await b.newPage({ viewport: { width: cols * (cw + 8) + 8, height: 400 } })
await sheet.setContent(
  `<body style="margin:0;padding:4px;background:#111;display:grid;grid-template-columns:repeat(${cols},${cw}px);gap:8px;font:12px sans-serif;color:#fff">${shots
    .map((s) => `<figure style="margin:0"><img style="width:${cw}px;display:block" src="data:image/png;base64,${readFileSync(s.file).toString('base64')}"><figcaption>${s.file.split('/').pop()} · y=${Math.round(s.y)}</figcaption></figure>`)
    .join('')}</body>`,
)
await sheet.screenshot({ path: `${out}/${prefix}-sheet.png`, fullPage: true })
console.log(`${shots.length} capturas · alto total ${total}px · errores: ${errors.length ? errors.join(' | ') : 'ninguno'}`)
console.log(`${out}/${prefix}-sheet.png`)
await b.close()
