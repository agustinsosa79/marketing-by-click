/**
 * QA de microinteracciones (desktop 1920×912): navbar, cursor, servicios (abrir/cerrar), video de Ian y menú.
 * Capturas en %TEMP%/qa/int-*.png
 * Uso: node scripts/qa-interactions.mjs [url]
 */
import { chromium } from 'playwright'

const out = process.env.TEMP.split(String.fromCharCode(92)).join('/') + '/qa'
const url = process.argv[2] ?? 'http://localhost:4173/?debug=1'
const b = await chromium.launch()
const p = await b.newPage({ viewport: { width: 1920, height: 912 } })
const errors = []
p.on('pageerror', (e) => errors.push(e.message))
await p.goto(url, { waitUntil: 'load' })
await p.waitForTimeout(7000)
const shot = (name) => p.screenshot({ path: `${out}/int-${name}.png` })
const scrollToEl = async (sel, offset = 0) => {
  await p.evaluate(({ sel, offset }) => window.__lenis.scrollTo(document.querySelector(sel), { offset, immediate: true }), { sel, offset })
  await p.waitForTimeout(900)
}
const dotState = () =>
  p.evaluate(() => {
    const d = document.querySelector('.z-100')
    const cs = getComputedStyle(d)
    return { opacity: +(+cs.opacity).toFixed(2), visibility: cs.visibility }
  })

// 1) Navbar: siempre visible al bajar
await p.mouse.move(960, 500)
await scrollToEl('#historia', 0)
await p.mouse.wheel(0, 700)
await p.waitForTimeout(900)
const navBottom = await p.evaluate(() => document.querySelector('header > div').getBoundingClientRect().bottom)
console.log(`navbar al bajar: bottom=${Math.round(navBottom)}px (> 0 = visible)`)
await shot('01-navbar')

// 2) Cursor: pasar por un botón con etiqueta y salir a una zona vacía
await scrollToEl('#contacto', 0)
const btn = await p.$('#contacto a[data-cursor]')
let box = await btn.boundingBox()
await p.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 8 })
await p.waitForTimeout(600)
const onButton = await dotState()
await p.mouse.move(200, 120, { steps: 10 })
await p.waitForTimeout(700)
const afterLeave = await dotState()
console.log(`cursor: sobre botón con etiqueta ${JSON.stringify(onButton)} → al salir ${JSON.stringify(afterLeave)} (debe volver a opacity 1)`)
await shot('02-cursor-after')

// 3) Servicios: hover, abrir y cerrar
await scrollToEl('#servicios [data-service-item]', -200)
const rows = await p.$$('#servicios [data-service-item] > button')
box = await rows[1].boundingBox()
await p.mouse.move(box.x + 300, box.y + box.height / 2, { steps: 8 })
await p.mouse.move(box.x + 700, box.y + box.height / 2, { steps: 12 })
await p.waitForTimeout(700)
await shot('03-servicios-hover')
await p.mouse.down()
await p.mouse.up()
await p.waitForTimeout(1400)
await shot('04-servicios-abierto')
box = await rows[1].boundingBox()
await p.mouse.click(box.x + 400, box.y + box.height / 2)
await p.waitForTimeout(200)
await shot('05-servicios-cerrando')
const midOpacity = await p.evaluate(() => getComputedStyle(document.querySelector('[data-service-panel="1"] [data-panel-card]')).opacity)
await p.waitForTimeout(1200)
const closed = await p.evaluate(() => document.querySelector('[data-service-panel="1"]').hidden)
console.log(`servicios: a los 200 ms del clic de cierre opacity=${(+midOpacity).toFixed(2)} (se desvanece, no corta) · después hidden=${closed}`)
await shot('06-servicios-cerrado')

// 4) Video de Ian
await scrollToEl('#founder video', -150)
const v = await p.$('#founder video')
box = await v.boundingBox()
await p.mouse.click(box.x + box.width / 2, box.y + box.height / 2)
await p.waitForTimeout(2200)
const state = await p.evaluate(() => {
  const v = document.querySelector('#founder video')
  return { paused: v.paused, muted: v.muted, t: Math.round(v.currentTime * 10) / 10 }
})
await shot('07-video')
console.log('video de Ian tras click:', JSON.stringify(state))

// 5) Menú
await p.click('button[aria-controls="menu-panel"]')
await p.waitForTimeout(2200)
await shot('08-menu')
await p.keyboard.press('Escape')
await p.waitForTimeout(1600)

console.log('errores JS:', errors.length ? errors.join(' | ') : 'ninguno')
await b.close()
