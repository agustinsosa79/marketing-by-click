/**
 * QA de las funciones nuevas: pestañas de servicios, diagnóstico rápido, preguntas frecuentes,
 * onda de clic en botones, cursor de Contacto y páginas de servicio (/servicios/<slug>).
 * Uso: node scripts/qa-features.mjs [base] → capturas en %TEMP%/qa/feat-*.png
 */
import { chromium } from 'playwright'

const out = process.env.TEMP.split(String.fromCharCode(92)).join('/') + '/qa'
const base = process.argv[2] ?? 'http://localhost:4173'
const b = await chromium.launch()
const p = await b.newPage({ viewport: { width: 1440, height: 900 } })
const errors = []
p.on('pageerror', (e) => errors.push(e.message))
const shot = (name) => p.screenshot({ path: `${out}/feat-${name}.png` })
const goTo = async (id) => {
  await p.evaluate((id) => window.__lenis.scrollTo(document.getElementById(id), { immediate: true }), id)
  await p.waitForTimeout(1500)
}

await p.goto(`${base}/?debug=1`, { waitUntil: 'load' })
await p.waitForTimeout(7000)

// Servicios: pestaña Meta Ads
await goTo('servicios')
await p.click('#servicios [role="tab"]:has-text("Meta Ads")')
await p.waitForTimeout(1800)
console.log('servicios: pestaña activa =', await p.$eval('#servicios [role="tab"][aria-selected="true"]', (el) => el.textContent.trim()))
await shot('01-servicios-meta-ads')
await p.click('#servicios [role="tab"]:has-text("Branding")')
await p.waitForTimeout(1800)
await shot('02-servicios-branding')

// Diagnóstico: B (algunas campañas) → C (todas las redes) → A (sin llamadas) = Premium
await goTo('diagnostico')
await shot('03-diagnostico-inicio')
for (const letter of ['B', 'C', 'A']) {
  await p.click(`#diagnostico button:has(span:text-is("${letter}"))`)
  await p.waitForTimeout(900)
}
const result = await p.$eval('#diagnostico .font-display.text-title', (el) => el.textContent)
const wa = await p.$eval('#diagnostico a[href*="wa.me"]', (el) => decodeURIComponent(el.href))
console.log(`diagnóstico: recomienda "${result}" · WhatsApp: ${wa}`)
await shot('04-diagnostico-resultado')

// Preguntas: abrir la segunda
await goTo('preguntas')
await p.click('#faq-q-1')
await p.waitForTimeout(900)
console.log('faq: segunda abierta =', await p.$eval('#faq-q-1', (el) => el.getAttribute('aria-expanded')), '· primera =', await p.$eval('#faq-q-0', (el) => el.getAttribute('aria-expanded')))
await shot('05-faq')

// Onda de clic en un botón
const btn = await p.$('#preguntas a[data-cursor]:visible')
const box = await btn.boundingBox()
await p.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
await p.mouse.down()
await p.waitForTimeout(150)
console.log('onda de clic: anillos en el botón =', await btn.evaluate((el) => el.querySelectorAll('span.rounded-full.border-2').length))
await p.mouse.up()
await p.keyboard.press('Escape')

// Contacto: el cursor de la firma hace clic en el botón
await goTo('contacto')
await p.waitForTimeout(1200)
await shot('06-contacto-cursor')

// Página de servicio
const sp = await b.newPage({ viewport: { width: 1440, height: 900 } })
sp.on('pageerror', (e) => errors.push(e.message))
await sp.goto(`${base}/servicios/meta-ads/?debug=1`, { waitUntil: 'load' })
await sp.waitForTimeout(2500)
console.log('servicio: h1 =', await sp.$eval('h1', (el) => el.textContent), '· data-route =', await sp.$eval('#root', (el) => el.dataset.route))
console.log('servicio: datos estructurados =', (await sp.$$eval('script[type="application/ld+json"]', (els) => els.map((e) => JSON.parse(e.textContent)['@type']))).join(', '))
await sp.screenshot({ path: `${out}/feat-07-servicio.png` })
await sp.evaluate(() => window.__lenis.scrollTo(document.getElementById('incluye'), { offset: -120, immediate: true }))
await sp.waitForTimeout(1500)
await sp.screenshot({ path: `${out}/feat-08-servicio-incluye.png` })

const m = await b.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true })
m.on('pageerror', (e) => errors.push(e.message))
await m.goto(`${base}/servicios/branding/?debug=1`, { waitUntil: 'load' })
await m.waitForTimeout(2500)
await m.screenshot({ path: `${out}/feat-09-servicio-mobile.png` })

console.log('errores JS:', errors.length ? errors.join(' | ') : 'ninguno')
await b.close()
