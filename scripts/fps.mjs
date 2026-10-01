/**
 * Mide la fluidez real del scroll: recorre la página con la rueda (pasa por Lenis) y registra la duración
 * de cada frame. CPU ralentizada ×2 para parecerse a una notebook común.
 * Uso: node scripts/fps.mjs [url] [ancho] [alto] [cpu]
 */
import { chromium } from 'playwright'

const [url = 'http://localhost:4173/', w = '1920', h = '912', cpu = '2'] = process.argv.slice(2)
const b = await chromium.launch()
const p = await b.newPage({ viewport: { width: +w, height: +h } })
const cdp = await p.context().newCDPSession(p)
await cdp.send('Emulation.setCPUThrottlingRate', { rate: +cpu })
await p.goto(url, { waitUntil: 'load' })
await p.waitForTimeout(7000)
await p.mouse.move(+w / 2, +h / 2)

await p.evaluate(() => {
  window.__frames = []
  let last = performance.now()
  const tick = (t) => {
    window.__frames.push(t - last)
    last = t
    window.__raf = requestAnimationFrame(tick)
  }
  window.__raf = requestAnimationFrame(tick)
})
const total = await p.evaluate(() => document.documentElement.scrollHeight)
let guard = 0
while ((await p.evaluate(() => scrollY + innerHeight)) < total - 4 && guard < 400) {
  await p.mouse.wheel(0, 140)
  await p.waitForTimeout(40)
  guard++
}
await p.waitForTimeout(800)
const f = await p.evaluate(() => {
  cancelAnimationFrame(window.__raf)
  return window.__frames.slice(2)
})
const avg = f.reduce((a, x) => a + x, 0) / f.length
const sorted = [...f].sort((a, x) => a - x)
const p95 = sorted[Math.floor(sorted.length * 0.95)]
const jank = f.filter((x) => x > 33.4).length
console.log(`frames: ${f.length} · FPS promedio: ${(1000 / avg).toFixed(1)} · p95: ${p95.toFixed(1)} ms · frames > 33 ms: ${jank} (${((jank / f.length) * 100).toFixed(1)}%)`)
await b.close()
