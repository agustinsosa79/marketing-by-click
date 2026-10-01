// Extrae los frames de reference/preloader-ref.mp4 en los tiempos de la tabla (ffmpeg-static).
import { execFileSync } from 'node:child_process'
import { mkdirSync } from 'node:fs'
import ffmpeg from 'ffmpeg-static'

const TIMES = [0, 0.5, 0.67, 0.83, 1.0, 1.17, 2.0, 2.6, 3.2]
mkdirSync('reference/preloader-frames', { recursive: true })
for (const t of TIMES) {
  const out = `reference/preloader-frames/ref-${t.toFixed(2).padStart(5, '0')}.png`
  execFileSync(ffmpeg, ['-hide_banner', '-loglevel', 'error', '-y', '-ss', String(t), '-i', 'reference/preloader-ref.mp4', '-frames:v', '1', out])
  console.log('✓', out)
}
