import { VIDEO_MAX_BYTES, VIDEO_MAX_SECONDS } from '../../shared/media'

/**
 * Prepara un video en el navegador antes de subirlo:
 *  - lee la duración y arma la imagen de portada (un cuadro del video, en WebP);
 *  - lo convierte siempre a WebM (VP9 + Opus, máx. 1280 px de lado, con su sonido);
 *  - en la misma pasada graba un MP4 de respaldo para iPhones que no reproducen WebM (si el navegador puede).
 * Usa las herramientas del propio navegador: la conversión tarda lo mismo que dura el video.
 */

export interface PreparedVideo {
  /** WebM: el formato principal */
  base64: string
  /** para verlo en el panel antes de guardar */
  url: string
  duration: number
  size: number
  /** MP4 de respaldo (si el navegador pudo grabarlo) */
  fallback: { base64: string; size: number } | null
  poster: { base64: string; url: string }
}

const toBase64 = (blob: Blob) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result).split(',')[1])
    reader.onerror = () => reject(new Error('No se pudo leer el archivo.'))
    reader.readAsDataURL(blob)
  })

function load(src: string) {
  return new Promise<HTMLVideoElement>((resolve, reject) => {
    const v = document.createElement('video')
    v.preload = 'auto'
    v.playsInline = true
    v.muted = true
    v.onloadedmetadata = () => resolve(v)
    v.onerror = () => reject(new Error('No se pudo leer el video. Probá con un MP4 grabado con el celular.'))
    v.src = src
  })
}

const seek = (v: HTMLVideoElement, t: number) =>
  new Promise<void>((resolve) => {
    v.onseeked = () => resolve()
    v.currentTime = t
  })

async function makePoster(v: HTMLVideoElement, duration: number) {
  await seek(v, Math.min(1, duration / 3))
  const scale = Math.min(1, 832 / v.videoWidth)
  const c = document.createElement('canvas')
  c.width = Math.round(v.videoWidth * scale)
  c.height = Math.round(v.videoHeight * scale)
  c.getContext('2d')!.drawImage(v, 0, 0, c.width, c.height)
  const blob = await new Promise<Blob | null>((r) => c.toBlob(r, 'image/webp', 0.8))
  if (!blob || blob.type !== 'image/webp') throw new Error('Tu navegador no pudo armar la portada del video. Probá con Chrome.')
  const base64 = await toBase64(blob)
  return { base64, url: `data:image/webp;base64,${base64}` }
}

const supported = (list: string[]) => (typeof MediaRecorder === 'undefined' ? undefined : list.find((m) => MediaRecorder.isTypeSupported(m)))
const WEBM = ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm']
const MP4 = ['video/mp4;codecs=avc1.42E01E,mp4a.40.2', 'video/mp4']

/** Bitrate de video para que el archivo entre en `bytes` según la duración (el audio va a 96 kbps). */
const videoBits = (bytes: number, duration: number) => Math.max(200_000, Math.min(2_500_000, Math.floor((bytes * 8 * 0.85) / duration) - 96_000))

async function convert(v: HTMLVideoElement, duration: number, onProgress: (p: number) => void) {
  const webmType = supported(WEBM)
  if (!webmType) throw new Error('Este navegador no puede convertir el video a WebM. Usá Chrome, Edge o Firefox en la computadora.')
  const mp4Type = supported(MP4)

  const scale = Math.min(1, 1280 / Math.max(v.videoWidth, v.videoHeight))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round((v.videoWidth * scale) / 2) * 2
  canvas.height = Math.round((v.videoHeight * scale) / 2) * 2
  const ctx = canvas.getContext('2d')!
  const stream = canvas.captureStream(30)

  // el sonido pasa por los grabadores sin sonar en los parlantes
  const audio = new AudioContext()
  const source = audio.createMediaElementSource(v)
  const dest = audio.createMediaStreamDestination()
  source.connect(dest)
  dest.stream.getAudioTracks().forEach((t) => stream.addTrack(t))

  // los dos archivos comparten el tope del guardado: WebM 55 %, MP4 de respaldo 40 %
  const record = (mimeType: string, share: number) => {
    const rec = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: videoBits(VIDEO_MAX_BYTES * share, duration), audioBitsPerSecond: 96_000 })
    const chunks: Blob[] = []
    rec.ondataavailable = (e) => e.data.size && chunks.push(e.data)
    const done = new Promise<Blob>((r) => (rec.onstop = () => r(new Blob(chunks, { type: mimeType.split(';')[0] }))))
    return { rec, done }
  }
  const webm = record(webmType, mp4Type ? 0.55 : 0.95)
  const mp4 = mp4Type ? record(mp4Type, 0.4) : null

  let running = true
  const draw = () => {
    if (!running) return
    ctx.drawImage(v, 0, 0, canvas.width, canvas.height)
    onProgress(Math.min(0.99, v.currentTime / duration))
    if ('requestVideoFrameCallback' in v) v.requestVideoFrameCallback(draw)
    else requestAnimationFrame(draw)
  }

  await seek(v, 0)
  v.muted = false
  await audio.resume()
  webm.rec.start(1000)
  mp4?.rec.start(1000)
  draw()
  await v.play()
  await new Promise<void>((r) => (v.onended = () => r()))
  running = false
  webm.rec.stop()
  mp4?.rec.stop()
  const [webmBlob, mp4Blob] = await Promise.all([webm.done, mp4?.done ?? null])
  await audio.close()
  return { webm: webmBlob, mp4: mp4Blob }
}

export async function prepareVideo(file: File, onProgress: (p: number) => void = () => {}): Promise<PreparedVideo> {
  if (!file.type.startsWith('video/')) throw new Error('El archivo no es un video.')
  const original = URL.createObjectURL(file)
  try {
    const v = await load(original)
    const duration = v.duration
    if (!Number.isFinite(duration) || duration <= 0) throw new Error('No se pudo leer la duración del video. Probá con un MP4.')
    if (duration > VIDEO_MAX_SECONDS + 0.5) throw new Error(`El video dura ${Math.round(duration)} segundos; el máximo es ${VIDEO_MAX_SECONDS}. Recortalo y volvé a elegirlo.`)
    const poster = await makePoster(v, duration)
    const { webm, mp4 } = await convert(v, duration, onProgress)
    if (webm.size > VIDEO_MAX_BYTES) throw new Error('El video sigue pesando demasiado. Probá con uno más corto.')
    // el respaldo solo viaja si entra junto con el WebM en el tope del guardado
    const keepMp4 = mp4 && mp4.size > 0 && webm.size + mp4.size <= VIDEO_MAX_BYTES
    onProgress(1)
    return {
      base64: await toBase64(webm),
      url: URL.createObjectURL(webm),
      duration: Math.round(duration),
      size: webm.size,
      fallback: keepMp4 ? { base64: await toBase64(mp4), size: mp4.size } : null,
      poster,
    }
  } finally {
    URL.revokeObjectURL(original)
  }
}
