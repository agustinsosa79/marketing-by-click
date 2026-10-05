/**
 * Cuadros del preloader "by Clic" en momentos fijos (timeline en pausa con ?debug=preloader).
 * Uso: node scripts/qa-preloader-frames.mjs [base] → %TEMP%/qa/pl-<d|m>-<t>.png + pl-sheet.png
 */
import { chromium } from 'playwright'
import { readFileSync } from 'node:fs'

const out = process.env.TEMP.split(String.fromCharCode(92)).join('/') + '/qa'
const base = process.argv[2] ?? 'http://localhost:4173'
const T = [0.5, 1.2, 1.6, 1.95, 2.2, 2.6, 3.2, 3.9, 4.3, 4.7, 5.3, 6.5]
const b = await chromium.launch()
const rows = []
for (const [w, h, pre] of [[1440, 900, 'd'], [390, 844, 'm']]) {
  const p = await b.newPage({ viewport: { width: w, height: h } })
  await p.goto(`${base}/?debug=preloader`, { waitUntil: 'load' })
  for (let i = 0; i < 40 && !(await p.evaluate(() => !!window.__preloaderTl)); i++) await p.waitForTimeout(250)
  const files = []
  for (const t of T) {
    await p.evaluate((t) => {
      window.__preloaderTl.seek(t, false)
    }, t)
    await p.waitForTimeout(120)
    const file = `${out}/pl-${pre}-${t}.png`
    await p.screenshot({ path: file })
    files.push({ file, t })
  }
  rows.push({ files, w: pre === 'd' ? 300 : 150 })
  await p.close()
}
const sheet = await b.newPage({ viewport: { width: 1840, height: 600 } })
await sheet.setContent(
  `<body style="margin:0;background:#111;color:#fff;font:11px sans-serif">${rows
    .map((r) => `<div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:6px">${r.files.map((f) => `<figure style="margin:0"><img style="width:${r.w}px;display:block" src="data:image/png;base64,${readFileSync(f.file).toString('base64')}"><figcaption>${f.t}s</figcaption></figure>`).join('')}</div>`)
    .join('')}</body>`,
)
await sheet.screenshot({ path: `${out}/pl-sheet.png`, fullPage: true })
console.log(`${out}/pl-sheet.png`)
await b.close()
