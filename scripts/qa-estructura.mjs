/**
 * QA de la estructura nueva del inicio: ventanas (comparar planes y diagnóstico), barra fija de WhatsApp en el celular
 * y segunda visita sin preloader.
 * Uso: node scripts/qa-estructura.mjs [base] → %TEMP%/qa/es-*.png
 */
import { chromium } from 'playwright'

const out = process.env.TEMP.split(String.fromCharCode(92)).join('/') + '/qa'
const base = process.argv[2] ?? 'http://127.0.0.1:5190'
const b = await chromium.launch()
const results = []
const errors = []
const check = (name, ok, extra = '') => {
  results.push(ok)
  console.log(ok ? '✓' : '✗', name, extra)
}
const goTo = (p, id) => p.evaluate((id) => window.__lenis.scrollTo(document.getElementById(id), { immediate: true, force: true }), id)
// baja hasta un botón (centrado en pantalla) para que ya haya hecho su entrada
const toButton = (p, text) =>
  p.evaluate((text) => {
    const el = [...document.querySelectorAll('button')].find((b) => b.textContent.includes(text))
    window.__lenis.scrollTo(el, { immediate: true, force: true, offset: -innerHeight / 2 })
  }, text)

// --- Desktop: ventanas
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } })
const p = await ctx.newPage()
p.on('pageerror', (e) => errors.push(e.message))
await p.goto(`${base}/?debug=1`, { waitUntil: 'load' })
await p.waitForTimeout(5000)
check('preloader dura menos de 5 s', !(await p.evaluate(() => !!document.querySelector('[data-preloader]'))))
await toButton(p, 'Comparar planes')
await p.waitForTimeout(1500)

await p.click('button:has-text("Comparar planes")')
await p.waitForTimeout(700)
check('comparar: se abre', await p.locator('dialog[open]:has-text("Compará los tres planes")').isVisible())
check('comparar: tabla con los 3 planes', (await p.locator('dialog[open] thead th').count()) === 4)
check('comparar: el fondo no scrollea (Lenis detenido)', await p.evaluate(() => window.__lenis.isStopped))
await p.mouse.move(700, 420)
await p.waitForTimeout(150)
await p.mouse.move(720, 440)
await p.waitForTimeout(500)
check('cursor propio por encima de la ventana', await p.evaluate(() => document.querySelector('[popover]')?.matches(':popover-open') ?? false))
await p.screenshot({ path: `${out}/es-comparar.png` })
await p.screenshot({ path: `${out}/es-cursor.png`, clip: { x: 640, y: 360, width: 160, height: 160 } })
await p.keyboard.press('Escape')
await p.waitForTimeout(500)
check('comparar: Escape cierra y Lenis vuelve', (await p.locator('dialog[open]').count()) === 0 && !(await p.evaluate(() => window.__lenis.isStopped)))

await p.click('button:has-text("¿No sabés cuál elegir?")')
await p.waitForTimeout(1800)
check('"¿No sabés cuál elegir?" baja a la sección', await p.evaluate(() => Math.abs(document.getElementById('diagnostico').getBoundingClientRect().top) < 200))
for (let i = 0; i < 3; i++) {
  await p.locator('#diagnostico ul button').last().click()
  await p.waitForTimeout(700)
}
check('diagnóstico: llega al resultado (Premium)', await p.locator('#diagnostico:has-text("Te recomendamos el plan"):has-text("Premium")').isVisible())
check('diagnóstico: WhatsApp con el plan', ((await p.locator('#diagnostico a[href*="wa.me"], #diagnostico a[href*="whatsapp"]').first().getAttribute('href')) ?? '').includes('Premium'))
await p.screenshot({ path: `${out}/es-diagnostico.png` })

// anclas que siguen existiendo (navbar y menú)
for (const id of ['diagnostico', 'asesoria', 'preguntas', 'nosotros', 'proceso', 'contacto']) check(`ancla #${id}`, (await p.locator(`#${id}`).count()) === 1)
await ctx.close()

// --- Segunda visita: sin preloader
const ctx2 = await b.newContext({ viewport: { width: 1440, height: 900 } })
const p2 = await ctx2.newPage()
await p2.goto(`${base}/`, { waitUntil: 'load' })
await p2.waitForTimeout(5500)
await p2.goto(`${base}/`, { waitUntil: 'load' })
await p2.waitForTimeout(400)
check('segunda visita: el preloader vuelve a correr', !(await p2.evaluate(() => document.documentElement.hasAttribute('data-from-site'))))
await ctx2.close()

// --- Celular: barra fija
const ctx3 = await b.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true })
const m = await ctx3.newPage()
m.on('pageerror', (e) => errors.push(e.message))
await m.goto(`${base}/?debug=1`, { waitUntil: 'load' })
await m.waitForTimeout(5000)
const bar = () => m.locator('text=Escribinos por WhatsApp').evaluate((el) => getComputedStyle(el.closest('div.fixed')).opacity)
check('celular: arriba de todo no hay barra', (await bar()) === '0')
await goTo(m, 'servicios')
await m.waitForTimeout(1200)
check('celular: después del inicio aparece', (await bar()) === '1')
await m.screenshot({ path: `${out}/es-barra.png` })
await toButton(m, 'Comparar planes')
await m.waitForTimeout(1200)
await m.screenshot({ path: `${out}/es-planes-m.png` })
await m.click('button:has-text("Comparar planes")')
await m.waitForTimeout(700)
await m.screenshot({ path: `${out}/es-comparar-m.png` })
check('celular: la barra se va con la ventana abierta', (await bar()) === '1' ? false : true)
await m.keyboard.press('Escape')
await goTo(m, 'contacto')
await m.waitForTimeout(1200)
check('celular: en Contacto se va', (await bar()) === '0')
check('celular: sin scroll horizontal', (await m.evaluate(() => document.documentElement.scrollWidth - innerWidth)) === 0)
await ctx3.close()

console.log(`${results.filter(Boolean).length}/${results.length} · errores JS:`, errors.length ? errors.join(' | ') : 'ninguno')
await b.close()
