// Mide todos los fotogramas de la referencia (extraídos a 30fps) → reference/preloader-measurements.json
import { chromium } from 'playwright'
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { measureInPage } from './lib/measure-preloader.mjs'

const dir = process.argv[2]
const files = readdirSync(dir).filter((f) => f.endsWith('.png')).sort()
const b = await chromium.launch()
const p = await b.newPage()
await p.setContent('<body></body>')
const rows = []
for (const [i, f] of files.entries()) {
  const m = await p.evaluate(measureInPage, 'data:image/png;base64,' + readFileSync(path.join(dir, f)).toString('base64'))
  rows.push({ t: Math.round((i / 30) * 1000) / 1000, ...m })
}
await b.close()
writeFileSync('reference/preloader-measurements.json', JSON.stringify(rows, null, 1))
for (const r of rows) {
  const f = (o) => (o ? `${o.top}–${o.bottom}` : '—')
  console.log(`${r.t.toFixed(2)}s  título ${f(r.title).padEnd(11)} video ${r.rect ? `${r.rect.top}–${r.rect.bottom} (x ${r.rect.left}–${r.rect.right})` : '—'}`.padEnd(70) + `  abajo ${f(r.below)}`)
}
