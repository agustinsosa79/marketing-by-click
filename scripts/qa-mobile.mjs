/**
 * QA responsive en celulares: captura cada sección completa (no solo la pantalla) y detecta
 * desborde horizontal (elementos más anchos que el viewport) y texto que se sale de su caja.
 * Uso: node scripts/qa-mobile.mjs [base] [ancho] [alto] [prefijo] → %TEMP%/qa/<prefijo>-*.png
 */
import { chromium } from 'playwright'

const out = process.env.TEMP.split(String.fromCharCode(92)).join('/') + '/qa'
const [base = 'http://localhost:4173', w = '390', h = '844', prefix = 'm390'] = process.argv.slice(2)
const b = await chromium.launch()
const ctx = await b.newContext({ viewport: { width: +w, height: +h }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 })
const errors = []

async function audit(p, label) {
  const issues = await p.evaluate((vw) => {
    const found = []
    for (const el of document.querySelectorAll('main *, header *, footer *')) {
      const r = el.getBoundingClientRect()
      if (!r.width || getComputedStyle(el).visibility === 'hidden') continue
      // fuera del viewport por la derecha (ignora carruseles con scroll propio y elementos ocultos por overflow del padre)
      if (r.right > vw + 1 && !el.closest('.no-scrollbar, [data-preloader], #menu-panel')) {
        let clipped = false
        for (let p = el.parentElement; p; p = p.parentElement) {
          const o = getComputedStyle(p).overflowX
          if (o === 'hidden' || o === 'clip' || o === 'auto') {
            if (p.getBoundingClientRect().right <= vw + 1) clipped = true
            break
          }
        }
        if (!clipped) found.push(`desborde → ${el.tagName.toLowerCase()}.${String(el.className).slice(0, 60)} (${Math.round(r.right)}px)`)
      }
    }
    return [...new Set(found)].slice(0, 8)
  }, +w)
  const docW = await p.evaluate(() => document.documentElement.scrollWidth)
  console.log(`${label}: ancho documento ${docW}px${docW > +w ? ' ✗ SCROLL HORIZONTAL' : ''}${issues.length ? '\n   ' + issues.join('\n   ') : ''}`)
}

// Inicio: cada sección completa
const p = await ctx.newPage()
p.on('pageerror', (e) => errors.push(e.message))
await p.goto(`${base}/?debug=1`, { waitUntil: 'load' })
await p.waitForTimeout(7000)
await audit(p, 'inicio')
const ids = ['inicio', 'servicios', 'caso', 'proceso', 'diagnostico', 'planes', 'preguntas', 'nosotros', 'contacto']
for (const [i, id] of ids.entries()) {
  await p.evaluate((id) => window.__lenis.scrollTo(document.getElementById(id), { immediate: true }), id)
  await p.waitForTimeout(1800)
  const el = await p.$(`#${id}`)
  await el.screenshot({ path: `${out}/${prefix}-${String(i).padStart(2, '0')}-${id}.png` })
}
await p.evaluate(() => window.__lenis.scrollTo(document.documentElement.scrollHeight, { immediate: true }))
await p.waitForTimeout(2000)
await (await p.$('footer')).screenshot({ path: `${out}/${prefix}-10-footer.png` })

// Otras páginas
for (const [name, path] of [
  ['blog', '/blog/'],
  ['nota', '/blog/branding-hostel-el-duende-errante/'],
  ['servicio', '/servicios/meta-ads/'],
]) {
  const q = await ctx.newPage()
  q.on('pageerror', (e) => errors.push(e.message))
  await q.goto(`${base}${path}?debug=1`, { waitUntil: 'load' })
  await q.waitForTimeout(2500)
  await audit(q, name)
  await q.screenshot({ path: `${out}/${prefix}-p-${name}.png`, fullPage: true })
  await q.close()
}
console.log('errores JS:', errors.length ? errors.join(' | ') : 'ninguno')
await b.close()
