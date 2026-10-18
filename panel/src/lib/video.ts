import { VIDEO_MAX_BYTES, VIDEO_MAX_SECONDS } from '../../shared/media'

/**
 * Prepara un video en el navegador antes de subirlo:
 *  - lee la duración y arma la imagen de portada (un cuadro del video, en WebP);
 *  - si pesa más de lo que admite un guardado (o no es MP4/WebM), lo vuelve a grabar más liviano
 *    (máx. 1280 px de lado, con su sonido) usando las herramientas del propio navegador.
 * La grabación tarda lo mismo que dura el video.
 */

export interface PreparedVideo {
  base64: string
  /** para verlo en el panel antes de guardar */
  url: string
  duration: number
  size: number
  compressed: boolean
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
    v.crossOrigin = 'anonymous'
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

const MIME = ['video/mp4;codecs=avc1.42E01E,mp4a.40.2', 'video/mp4', 'video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm']

async function reencode(v: HTMLVideoElement, duration: number, onProgress: (p: number) => void): Promise<Blob> {
  const mimeType = typeof MediaRecorder !== 'undefined' ? MIME.find((m) => MediaRecorder.isTypeSupported(m)) : undefined
  if (!mimeType) throw new Error('Este navegador no puede comprimir el video. Probá con Chrome o subí un video de menos de 3 MB.')

  const scale = Math.min(1, 1280 / Math.max(v.videoWidth, v.videoHeight))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round((v.videoWidth * scale) / 2) * 2
  canvas.height = Math.round((v.videoHeight * scale) / 2) * 2
  const ctx = canvas.getContext('2d')!
  const stream = canvas.captureStream(30)

  // el sonido pasa por el grabador sin sonar en los parlantes
  const audio = new AudioContext()
  const source = audio.createMediaElementSource(v)
  const dest = audio.createMediaStreamDestination()
  source.connect(dest)
  dest.stream.getAudioTracks().forEach((t) => stream.addTrack(t))

  // bitrate según la duración, para entrar en el tope de un guardado
  const total = Math.floor((VIDEO_MAX_BYTES * 8 * 0.85) / duration)
  const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: Math.max(250_000, Math.min(2_500_000, total - 96_000)), audioBitsPerSecond: 96_000 })
  const chunks: Blob[] = []
  recorder.ondataavailable = (e) => e.data.size && chunks.push(e.data)
  const stopped = new Promise<void>((r) => (recorder.onstop = () => r()))

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
  recorder.start(1000)
  draw()
  await v.play()
  await new Promise<void>((r) => (v.onended = () => r()))
  running = false
  recorder.stop()
  await stopped
  await audio.close()
  return new Blob(chunks, { type: mimeType.split(';')[0] })
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

    const usable = file.size <= VIDEO_MAX_BYTES && /^video\/(mp4|webm)$/.test(file.type)
    const blob = usable ? file : await reencode(v, duration, onProgress)
    if (blob.size > VIDEO_MAX_BYTES) throw new Error('El video sigue pesando demasiado. Probá con uno más corto.')
    onProgress(1)
    return { base64: await toBase64(blob), url: URL.createObjectURL(blob), duration: Math.round(duration), size: blob.size, compressed: !usable, poster }
  } finally {
    URL.revokeObjectURL(original)
  }
}
