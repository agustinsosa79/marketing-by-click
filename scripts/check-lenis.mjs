// Verifica que Lenis esté vivo y suavizando, emulando "efectos de animación" desactivados (prefers-reduced-motion: reduce).
import { chromium } from 'playwright'
const url = process.argv[2] ?? 'http://localhost:4173/?debug=lenis'
const b = await chromium.launch()
const p = await b.newPage({ viewport: { width: 1920, height: 912 }, reducedMotion: 'reduce' })
await p.goto(url)
await p.waitForTimeout(6000) // preloader completo
await p.mouse.move(960, 450)
await p.mouse.wheel(0, 500)
const r = await p.evaluate(() => new Promise((ok) => {
  const l = window.__lenis
  const samples = []
  const tick = () => {
    samples.push({ y: Math.round(scrollY), v: Math.round(l.velocity * 10) / 10 })
    if (samples.length < 40) requestAnimationFrame(tick)
    else ok({ options: { lerp: l.options.lerp, smoothWheel: l.options.smoothWheel, respectReducedMotion: l.options.respectReducedMotion }, isSmooth: l.isSmooth, stopped: l.isStopped, samples })
  }
  requestAnimationFrame(tick)
}))
const ys = r.samples.map((s) => s.y)
console.log('opciones Lenis:', JSON.stringify(r.options), '| isStopped:', r.stopped)
console.log('scrollY por frame:', ys.join(','))
console.log('velocity por frame:', r.samples.map((s) => s.v).join(','))
console.log(`→ ${new Set(ys).size} posiciones distintas en 40 frames tras 1 giro de rueda`)
await b.close()
