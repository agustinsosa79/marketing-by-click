/**
 * QA de microinteracciones (desktop 1440×900): navbar, cursor sobre cada fondo, tarjetas de servicio,
 * planes, video de Ian y menú a pantalla completa.
 * Capturas en %TEMP%/qa/int-*.png
 * Uso: node scripts/qa-interactions.mjs [url]
 */
import { chromium } from 'playwright'

const out = process.env.TEMP.split(String.fromCharCode(92)).join('/') + '/qa'
const url = process.argv[2] ?? 'http://localhost:4173/?debug=1'
const b = await chromium.launch()
const p = await b.newPage({ viewport: { width: 1440, height: 900 } })
const errors = []
p.on('pageerror', (e) => errors.push(e.message))
await p.goto(url, { waitUntil: 'load' })
await p.waitForTimeout(6500)
const shot = (name, clip) => p.screenshot({ path: `${out}/int-${name}.png`, clip })
const goTo = async (sel, offset = 0) => {
  await p.evaluate(({ sel, offset }) => window.__lenis.scrollTo(document.querySelector(sel), { offset, immediate: true }), { sel, offset })
  await p.waitForTimeout(1200)
}
const cursorState = () =>
  p.evaluate(() => {
    const [ring, dot, bubble] = [...document.querySelectorAll('.z-100')]
    const s = (el) => +(+getComputedStyle(el).opacity).toFixed(2)
    return { dot: s(dot), ring: s(ring), bubble: getComputedStyle(bubble).transform }
  })

// 1) Navbar: siempre visible al bajar; hover en "Planes"
await p.mouse.move(700, 500)
await goTo('#servicios')
const nav = await p.evaluate(() => Math.round(document.querySelector('header > div').getBoundingClientRect().bottom))
console.log(`navbar: bottom=${nav}px (visible)`)
const link = await p.$('header a[href="#planes"]')
let box = await link.boundingBox()
await p.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 6 })
await p.waitForTimeout(700)
await shot('01-navbar-hover', { x: 420, y: 0, width: 600, height: 100 })

// 2) Cursor visible sobre cada fondo (papel, azul noche, azul Clic)
for (const [id, x, y] of [
  ['servicios', 1200, 160],
  ['nosotros', 300, 830],
  ['proceso', 1300, 860],
]) {
  await goTo(`#${id}`)
  await p.mouse.move(x - 40, y - 20)
  await p.mouse.move(x, y, { steps: 5 })
  await p.waitForTimeout(500)
  console.log(`cursor sobre ${id}:`, JSON.stringify(await cursorState()))
  await shot(`02-cursor-${id}`, { x: x - 60, y: y - 60, width: 120, height: 120 })
}

// 3) Cursor con etiqueta: entra en el botón de contacto, sale a una zona vacía (no debe quedar pegado)
await goTo('#contacto')
const btn = await p.$('#contacto a[data-cursor]')
box = await btn.boundingBox()
await p.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 8 })
await p.waitForTimeout(700)
const onButton = await cursorState()
await shot('03-cursor-label', { x: box.x - 80, y: box.y - 80, width: box.width + 160, height: box.height + 160 })
await p.mouse.move(300, 820, { steps: 10 })
await p.waitForTimeout(700)
console.log(`cursor: sobre botón ${JSON.stringify(onButton)} → al salir ${JSON.stringify(await cursorState())}`)

// 4) Servicios: elegir otro servicio (el panel y su animación cambian)
await goTo('#servicios')
await p.click('#servicios [role="tab"]:has-text("Contenido")')
await p.waitForTimeout(1600)
await shot('04-servicio-hover')

// 5) Planes: hover en una tarjeta (luz que sigue al puntero)
await goTo('#planes')
const plan = (await p.$$('[data-plan-card]'))[0]
box = await plan.boundingBox()
await p.mouse.move(box.x + box.width * 0.7, box.y + box.height * 0.3, { steps: 8 })
await p.waitForTimeout(900)
await shot('05-plan-hover')

// 6) Video de Ian: click en el CTA central → arranca con sonido
await goTo('#nosotros')
const play = await p.$('#nosotros button[data-cursor]')
await play.click()
await p.waitForTimeout(2000)
const state = await p.evaluate(() => {
  const v = document.querySelector('#nosotros video')
  return { paused: v.paused, muted: v.muted, t: Math.round(v.currentTime * 10) / 10 }
})
await shot('06-video')
console.log('video de Ian tras click:', JSON.stringify(state))

// 7) Menú a pantalla completa: abrir, hover en un link, cerrar con Escape
await p.mouse.move(1380, 48)
await p.click('button[aria-controls="menu-panel"]')
await p.waitForTimeout(400)
await shot('07-menu-abriendo')
await p.waitForTimeout(1800)
const item = (await p.$$('[data-menu-item] a'))[2]
box = await item.boundingBox()
await p.mouse.move(box.x + 120, box.y + box.height / 2, { steps: 6 })
await p.waitForTimeout(900)
await shot('08-menu')
const navHidden = await p.evaluate(() => getComputedStyle(document.querySelector('header > div')).opacity)
console.log(`navbar con el menú abierto: opacity ${navHidden} (debe ser 0)`)
// ciclo cerrar/abrir otra vez: el contacto no debe quedar borroso
await p.keyboard.press('Escape')
await p.waitForTimeout(2200)
await p.click('button[aria-controls="menu-panel"]')
await p.waitForTimeout(2600)
const blur = await p.evaluate(() => [...document.querySelectorAll('[data-menu-secondary]')].map((el) => getComputedStyle(el).filter))
console.log('filtros del contacto al reabrir:', JSON.stringify(blur))
await shot('09-menu-reabierto')
await p.click('#menu-panel button[aria-label]')
await p.waitForTimeout(1800)
const closed = await p.evaluate(() => getComputedStyle(document.getElementById('menu-panel')).visibility)
console.log(`menú cerrado: panel ${closed}`)

console.log('errores JS:', errors.length ? errors.join(' | ') : 'ninguno')
await b.close()
