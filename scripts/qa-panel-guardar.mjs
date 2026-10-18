/**
 * QA del botón de guardar del panel: arranca apagado ("Sin cambios"), se prende solo si algo difiere de lo
 * guardado, se vuelve a apagar si se deshace el cambio; la barra del celular aparece y se va igual;
 * al guardar sale el aviso emergente. Con el panel en `npm run dev` sobre una COPIA de content/.
 * Uso: node scripts/qa-panel-guardar.mjs <base> <contraseña> → %TEMP%/qa/gd-*.png
 */
import { chromium } from 'playwright'

const out = process.env.TEMP.split(String.fromCharCode(92)).join('/') + '/qa'
const [base = 'http://localhost:5180', password = ''] = process.argv.slice(2)
const b = await chromium.launch()
const p = await b.newPage({ viewport: { width: 1440, height: 900 } })
const errors = []
p.on('pageerror', (e) => errors.push(e.message))
const results = []
const check = (name, ok) => {
  results.push(ok)
  console.log(ok ? '✓' : '✗', name)
}
const btn = (label) => p.locator(`main button:visible`, { hasText: label }).last()
const state = async (re) => {
  const el = p.locator('main button:visible').filter({ hasText: re }).last()
  return { text: (await el.textContent())?.trim(), disabled: await el.isDisabled() }
}

await p.goto(base, { waitUntil: 'networkidle' })
await p.fill('#password', password)
await p.click('button[type=submit]')
await p.waitForSelector('text=Tu web, en un solo lugar')

// Precios
await p.goto(`${base}/#/precios`, { waitUntil: 'networkidle' })
await p.waitForSelector('#p-plus')
const original = await p.inputValue('#p-plus')
let s = await state(/Sin cambios|Guardar precios/)
check('precios: arranca "Sin cambios" y apagado', s.text === 'Sin cambios' && s.disabled)
await p.fill('#p-plus', '199')
s = await state(/Sin cambios|Guardar precios/)
check('precios: al cambiar se prende', s.text === 'Guardar precios' && !s.disabled)
await p.fill('#p-plus', original)
s = await state(/Sin cambios|Guardar precios/)
check('precios: al deshacer vuelve a "Sin cambios"', s.text === 'Sin cambios' && s.disabled)
await p.fill('#p-plus', '199')
await btn('Guardar precios').click()
await p.waitForSelector('[role=status] >> text=Precios guardados')
await p.waitForTimeout(500)
await p.screenshot({ path: `${out}/gd-01-aviso.png` })
s = await state(/Sin cambios|Guardar precios/)
check('precios: después de guardar, "Sin cambios"', s.text === 'Sin cambios' && s.disabled)
await p.fill('#p-plus', original)
await btn('Guardar precios').click()
await p.locator('main button:visible', { hasText: 'Sin cambios' }).last().waitFor()

// Textos (restaurar = no hay cambio)
await p.goto(`${base}/#/textos`, { waitUntil: 'networkidle' })
await p.waitForSelector('text=Textos de la web')
await p.click('nav[aria-label="Secciones de la web"] >> text=Preguntas')
s = await state(/Sin cambios|Guardar textos/)
check('textos: arranca apagado', s.disabled)
await p.fill('[id="t-faq.text"]', '¿Otra duda? Escribinos.')
s = await state(/Sin cambios|Guardar textos/)
check('textos: al cambiar se prende', !s.disabled)
await p.click('button:text-is("Restaurar original")')
s = await state(/Sin cambios|Guardar textos/)
check('textos: "Restaurar original" lo vuelve a apagar', s.disabled)

// Proyecto existente y nota existente
await p.goto(`${base}/#/proyectos/editar/hostel-el-duende-errante`, { waitUntil: 'networkidle' })
await p.waitForSelector('#brand')
s = await state(/Sin cambios|Guardar cambios/)
check('proyecto: arranca apagado', s.disabled)
const brand = await p.inputValue('#brand')
await p.fill('#brand', brand + ' X')
s = await state(/Sin cambios|Guardar cambios/)
check('proyecto: al cambiar se prende', !s.disabled)
await p.fill('#brand', brand)
s = await state(/Sin cambios|Guardar cambios/)
check('proyecto: al deshacer se apaga', s.disabled)

// Preguntas: agregar una vacía y quitarla
await p.goto(`${base}/#/preguntas`, { waitUntil: 'networkidle' })
await p.waitForSelector('text=Preguntas frecuentes')
await p.click('text=+ Agregar pregunta')
s = await state(/Sin cambios|Guardar preguntas/)
check('preguntas: agregar una se prende', !s.disabled)
await p.locator('section[aria-label^="Pregunta"]').last().locator('button[aria-label^="Borrar"]').click()
s = await state(/Sin cambios|Guardar preguntas/)
check('preguntas: quitarla lo vuelve a apagar', s.disabled)

// Celular: la barra solo aparece con cambios
const m = await b.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true })
await m.context().addCookies(await p.context().cookies())
await m.goto(`${base}/#/precios`, { waitUntil: 'networkidle' })
await m.waitForSelector('#p-plus')
const bar = () => m.locator('text=Tenés cambios sin guardar').evaluate((el) => getComputedStyle(el.parentElement).opacity)
await m.waitForTimeout(500)
check('celular: sin cambios, la barra no se ve', (await bar()) === '0')
await m.fill('#p-plus', '199')
await m.waitForTimeout(500)
check('celular: con cambios, aparece', (await bar()) === '1')
await m.screenshot({ path: `${out}/gd-02-celular.png` })

console.log(`${results.filter(Boolean).length}/${results.length} · errores JS:`, errors.length ? errors.join(' | ') : 'ninguno')
await b.close()
