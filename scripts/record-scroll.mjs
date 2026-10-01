/**
 * Graba el recorrido completo como lo haría una persona: preloader + scroll con la rueda (pasa por Lenis).
 * Salida: reference/recordings/<nombre>.webm
 * Uso: node scripts/record-scroll.mjs [url] [ancho] [alto] [nombre]
 */
import { chromium } from 'playwright'
import { mkdirSync, renameSync } from 'node:fs'
import path from 'node:path'

const [url = 'http://localhost:4173/', w = '1920', h = '912', name = 'desktop'] = process.argv.slice(2)
const dir = path.resolve(import.meta.dirname, '..', 'reference', 'recordings')
mkdirSync(dir, { recursive: true })

const scale = +w > 1000 ? 0.6667 : 1
const size = { width: Math.round(+w * scale), height: Math.round(+h * scale) }
const b = await chromium.launch()
const ctx = await b.newContext({ viewport: { width: +w, height: +h }, recordVideo: { dir, size } })
const p = await ctx.newPage()
const errors = []
p.on('pageerror', (e) => errors.push(e.message))
await p.goto(url, { waitUntil: 'load' })
await p.waitForTimeout(6500) // preloader completo

await p.mouse.move(+w / 2, +h / 2)
const total = await p.evaluate(() => document.documentElement.scrollHeight)
let guard = 0
while ((await p.evaluate(() => scrollY + innerHeight)) < total - 4 && guard < 900) {
  await p.mouse.wheel(0, +h > 900 ? 120 : 100)
  await p.waitForTimeout(45)
  guard++
}
await p.waitForTimeout(2500)

const video = p.video()
await ctx.close()
const out = path.join(dir, `${name}.webm`)
renameSync(await video.path(), out)
await b.close()
console.log(`${out} · ${guard} pasos de rueda · errores: ${errors.length ? errors.join(' | ') : 'ninguno'}`)
