/**
 * Genera los íconos y el logo raster de Clic Studio desde los trazos vectoriales (src/components/ui/logoPaths.ts):
 *   public/media/favicon.svg, favicon-32.png, favicon-192.png, apple-touch-icon-180.png, logo-clic-studio.png
 *   panel/public/logo-clic-studio.svg (logo del panel)
 * Uso: node scripts/brand-icons.mjs
 */
import { chromium } from 'playwright'
import { readFileSync, writeFileSync } from 'node:fs'

const src = readFileSync('src/components/ui/logoPaths.ts', 'utf8')
const LOGO = JSON.parse(src.slice(src.indexOf('{'), src.lastIndexOf('}') + 1))
const LOGO_BLUE = '#2673bf' // el logo va en el azul Clic (celeste del manual); el naranja queda para las acciones

const iso = (bubble, letters) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${LOGO.iso.viewBox}"><path d="${LOGO.iso.bubble}" fill="${bubble}"/><path d="${LOGO.iso.text}" fill="${letters}"/></svg>`
const full = (bubble, letters) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${LOGO.full.viewBox}"><path d="${LOGO.full.bubble}" fill="${bubble}"/><path d="${LOGO.full.text}" fill="${letters}"/></svg>`

writeFileSync('public/media/favicon.svg', iso(LOGO_BLUE, '#ffffff'))
writeFileSync('panel/public/logo-clic-studio.svg', full(LOGO_BLUE, '#ffffff'))

const b = await chromium.launch()
const shot = async (html, size, path, h = size) => {
  const p = await b.newPage({ viewport: { width: size, height: h } })
  await p.setContent(`<body style="margin:0;background:transparent">${html}</body>`)
  await p.screenshot({ path, omitBackground: true })
  await p.close()
}
const fit = (svg, pad = 0) => `<div style="width:100%;height:100vh;display:grid;place-items:center;box-sizing:border-box;padding:${pad}%">${svg.replace('<svg ', '<svg style="width:100%;height:100%" ')}</div>`

await shot(fit(iso(LOGO_BLUE, '#ffffff')), 32, 'public/media/favicon-32.png')
await shot(fit(iso(LOGO_BLUE, '#ffffff'), 4), 192, 'public/media/favicon-192.png')
// iOS no respeta transparencias: fondo blanco con el isotipo azul
await shot(`<div style="background:#ffffff;width:100%;height:100vh">${fit(iso(LOGO_BLUE, '#ffffff'), 16)}</div>`, 180, 'public/media/apple-touch-icon-180.png')
await shot(fit(full(LOGO_BLUE, '#ffffff')), 600, 'public/media/logo-clic-studio.png', 463)
await b.close()
console.log('listo')
