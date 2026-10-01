/**
 * QA como usuario real: primeros fotogramas, scroll con rueda (pasa por Lenis), suavidad del scroll
 * y barrido de elementos que quedaron invisibles.
 * Uso: node scripts/qa-full.mjs <url> <reduce|no-preference> [ancho]
 */
import { chromium } from 'playwright'

const out = process.env.TEMP.split(String.fromCharCode(92)).join('/') + '/qa'
const [url = 'http://localhost:4173/', motion = 'no-preference', width = '1920'] = process.argv.slice(2)
const tag = `${motion === 'reduce' ? 'rm' : 'full'}-${new URL(url).port}`

const b = await chromium.launch()
const p = await b.newPage({ viewport: { width: +width, height: 1000 }, reducedMotion: motion })
const errors = []
p.on('pageerror', (e) => errors.push(e.message))

// 1) primeros fotogramas
await p.goto(url, { waitUntil: 'commit' })
for (let i = 0; i < 8; i++) {
  await p.screenshot({ path: `${out}/${tag}-early-${String(i * 80).padStart(4, '0')}.png` })
  await p.waitForTimeout(80)
}

// 2) preloader: fotogramas espaciados
const t0 = Date.now()
for (const t of [1200, 2200, 3200, 4500, 6000, 7500]) {
  await p.waitForTimeout(Math.max(0, t - (Date.now() - t0)))
  await p.screenshot({ path: `${out}/${tag}-pre-${String(t).padStart(5, '0')}.png` })
}
await p.waitForTimeout(2500)

// 3) suavidad: un solo evento de rueda y muestreo de scrollY por frame
await p.mouse.move(+width / 2, 500)
await p.mouse.wheel(0, 400)
const samples = await p.evaluate(
  () =>
    new Promise((ok) => {
      const s = []
      const tick = () => {
        s.push(Math.round(scrollY))
        if (s.length < 30) requestAnimationFrame(tick)
        else ok(s)
      }
      requestAnimationFrame(tick)
    }),
)
const distinct = new Set(samples).size

// 4) recorrer toda la página con la rueda
const total = await p.evaluate(() => document.documentElement.scrollHeight)
let shot = 0
while ((await p.evaluate(() => scrollY + innerHeight)) < total - 5) {
  for (let i = 0; i < 4; i++) {
    await p.mouse.wheel(0, 250)
    await p.waitForTimeout(90)
  }
  await p.waitForTimeout(500)
  if (shot % 3 === 0) await p.screenshot({ path: `${out}/${tag}-scroll-${String(shot).padStart(2, '0')}.png` })
  shot++
  if (shot > 80) break
}
await p.waitForTimeout(1500)

// 5) barrido: elementos con contenido que quedaron invisibles
const invisible = await p.evaluate(() => {
  const bad = []
  for (const el of document.querySelectorAll('main *, footer *')) {
    if (el.closest('[hidden], [aria-hidden="true"], #menu-panel')) continue
    const hasContent = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()) || el.tagName === 'IMG'
    if (!hasContent) continue
    let node = el
    let hiddenBy = null
    while (node && node !== document.body) {
      const s = getComputedStyle(node)
      if (s.visibility === 'hidden' || parseFloat(s.opacity) < 0.05) {
        hiddenBy = `${node.tagName.toLowerCase()}${node.dataset ? Object.keys(node.dataset).map((k) => `[data-${k}]`).join('') : ''} opacity=${s.opacity} vis=${s.visibility}`
        break
      }
      node = node.parentElement
    }
    if (hiddenBy) bad.push(`${(el.textContent || el.getAttribute('alt') || '').trim().slice(0, 40)} ← ${hiddenBy}`)
  }
  return [...new Set(bad)]
})

console.log(`[${tag}] scroll suave: ${distinct} posiciones distintas en 30 frames tras 1 evento de rueda (${samples.slice(0, 10).join(',')}…)`)
console.log(`[${tag}] elementos invisibles: ${invisible.length}`)
invisible.slice(0, 15).forEach((x) => console.log('   ✗', x))
console.log(`[${tag}] errores JS: ${errors.length ? errors.join(' | ') : 'ninguno'}`)
await b.close()
