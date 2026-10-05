/**
 * QA del blog: /blog, una nota (arriba y en el medio del texto), filtro por categoría, 404 y el paso blog → inicio (/#planes).
 * Uso: node scripts/qa-blog.mjs [base] [ancho] [alto] [prefijo]
 * Capturas en %TEMP%/qa/<prefijo>-blog-*.png
 */
import { chromium } from 'playwright'

const out = process.env.TEMP.split(String.fromCharCode(92)).join('/') + '/qa'
const [base = 'http://localhost:4173', w = '1440', h = '900', prefix = 'desk'] = process.argv.slice(2)
const b = await chromium.launch()
const p = await b.newPage({ viewport: { width: +w, height: +h }, isMobile: +w < 800, hasTouch: +w < 800 })
const errors = []
p.on('pageerror', (e) => errors.push(e.message))
p.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
const shot = (name) => p.screenshot({ path: `${out}/${prefix}-blog-${name}.png` })

// /blog
await p.goto(`${base}/blog/?debug=1`, { waitUntil: 'load' })
await p.waitForTimeout(2000)
await shot('01-index')
await p.evaluate(() => window.__lenis.scrollTo(innerHeight * 0.9, { immediate: true }))
await p.waitForTimeout(1500)
await shot('02-index-grid')
// filtro
await p.evaluate(() => window.__lenis.scrollTo(0, { immediate: true }))
await p.waitForTimeout(500)
await p.click('button[aria-pressed]:has-text("Branding")')
await p.waitForTimeout(1400)
await shot('03-filtro')
const visibles = await p.$$eval('[data-post-card]', (els) => els.length)
console.log(`filtro Branding: ${visibles} tarjeta(s)`)

// nota
await p.goto(`${base}/blog/branding-hostel-el-duende-errante/?debug=1`, { waitUntil: 'load' })
await p.waitForTimeout(2000)
const route = await p.$eval('#root', (el) => el.dataset.route)
console.log(`nota: data-route=${route} · h1="${await p.$eval('h1', (el) => el.textContent)}"`)
await shot('04-nota')
await p.evaluate(() => window.__lenis.scrollTo(document.querySelector('.prose h2'), { offset: -200, immediate: true }))
await p.waitForTimeout(1600)
await shot('05-nota-texto')
await p.evaluate(() => window.__lenis.scrollTo(document.querySelector('#seguir-leyendo'), { offset: -150, immediate: true }))
await p.waitForTimeout(1600)
await shot('06-nota-relacionadas')
const ld = await p.$$eval('script[type="application/ld+json"]', (els) => els.map((e) => JSON.parse(e.textContent)['@type']))
console.log('datos estructurados:', ld.join(', '))

// 404
await p.goto(`${base}/404.html`, { waitUntil: 'load' })
await p.waitForTimeout(1500)
await shot('07-404')

// blog → Planes del inicio (sin preloader completo, baja a la sección)
await p.goto(`${base}/blog/?debug=1`, { waitUntil: 'load' })
await p.waitForTimeout(1500)
await p.click('header a[href="/#planes"]')
await p.waitForTimeout(3500)
const planes = await p.evaluate(() => Math.round(document.getElementById('planes').getBoundingClientRect().top))
console.log(`blog → /#planes: la sección quedó a ${planes}px del borde superior`)
await shot('08-vuelta-planes')

console.log('errores JS:', errors.length ? errors.join(' | ') : 'ninguno')
await b.close()
