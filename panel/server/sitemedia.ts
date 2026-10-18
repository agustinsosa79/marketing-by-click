import { createHash, randomBytes } from 'node:crypto'
import {
  cleanMedia,
  filesOf,
  IMAGE_MAX_BYTES,
  MEDIA_FILE,
  MEDIA_SLOT,
  MEDIA_SLOTS,
  SITE_MEDIA_DIR,
  SITE_MEDIA_URL,
  VIDEO_MAX_BYTES,
  type MediaValue,
  type MediaValues,
} from '../shared/media.js'
import type { Versioned } from '../shared/site.js'
import { UserError } from './http.js'
import { getStorage, type FileChange } from './storage.js'

/**
 * Fotos y video de la web (content/medios.json + public/media/sitio/). Cada cambio de un lugar es un commit:
 * los archivos nuevos, el JSON y el borrado de los archivos que ese lugar deja de usar.
 * Los originales (public/media/*.webp|mp4) nunca se tocan: "Restaurar original" vuelve a usarlos.
 */

const hash = (text: string) => createHash('sha256').update(text).digest('hex').slice(0, 16)

async function read() {
  const source = await getStorage().read(MEDIA_FILE)
  let raw: Record<string, unknown> = {}
  try {
    raw = source ? (JSON.parse(source).values ?? {}) : {}
  } catch {
    raw = {}
  }
  const values: MediaValues = {}
  for (const slot of MEDIA_SLOTS) {
    const v = cleanMedia(slot.key, raw[slot.key])
    if (v) values[slot.key] = v
  }
  return { values, version: source === null ? 'nuevo' : hash(source), source }
}

export async function getSiteMedia(): Promise<Versioned<MediaValues>> {
  const { values, version } = await read()
  return { data: values, version }
}

/** Tipo real del archivo por su contenido (no por el nombre). */
function sniff(bytes: Buffer): 'webp' | 'mp4' | 'webm' | null {
  if (bytes.subarray(0, 4).toString('ascii') === 'RIFF' && bytes.subarray(8, 12).toString('ascii') === 'WEBP') return 'webp'
  if (bytes.subarray(4, 8).toString('ascii') === 'ftyp') return 'mp4'
  if (bytes.subarray(0, 4).equals(Buffer.from([0x1a, 0x45, 0xdf, 0xa3]))) return 'webm'
  return null
}

interface Upload {
  base64: string
}

export interface SaveMediaInput {
  key: string
  version: string
  /** Vuelve al archivo original. */
  restore?: boolean
  alt?: string
  width?: number
  height?: number
  duration?: number
  /** main: la foto o el video · small: versión chica (portada) · poster: portada del video */
  files?: { main?: Upload; small?: Upload; poster?: Upload }
}

export async function saveSiteMedia(input: SaveMediaInput) {
  const slot = MEDIA_SLOT[String(input?.key ?? '')]
  if (!slot) throw new UserError('Lugar de la web inválido.')
  const { values, version, source } = await read()
  if (String(input.version ?? '') !== version) throw new UserError('Esto se cambió mientras lo editabas (desde otra pestaña o por otra persona). Recargá la página para ver la última versión.', 409)

  const before: MediaValue | null = values[slot.key] ?? null
  const changes: FileChange[] = []
  const stem = `${slot.key.replace(/[^a-z0-9]+/g, '-')}-${randomBytes(3).toString('hex')}`

  // archivo nuevo: tipo verificado por contenido, tamaño acotado, nombre lo pone el servidor
  const take = (upload: Upload | undefined, kinds: string[], max: number, suffix = '') => {
    if (!upload) return null
    const bytes = Buffer.from(String(upload.base64 ?? ''), 'base64')
    const kind = sniff(bytes)
    if (!kind || !kinds.includes(kind)) throw new UserError(kinds.includes('mp4') ? 'El archivo no es un video válido (MP4 o WebM).' : 'El archivo no es una imagen válida.')
    if (bytes.length > max) throw new UserError(`El archivo pesa ${(bytes.length / 1e6).toFixed(1)} MB; el máximo es ${(max / 1e6).toFixed(1)} MB.`)
    const name = `${stem}${suffix}.${kind}`
    changes.push({ path: `${SITE_MEDIA_DIR}/${name}`, content: upload.base64, encoding: 'base64' })
    return `${SITE_MEDIA_URL}/${name}`
  }

  let next: MediaValue | null = null
  let message: string
  if (input.restore) {
    message = `Fotos y video (panel): vuelve al original «${slot.label}»`
  } else if (slot.kind === 'image') {
    const current = (before ?? slot.default) as Extract<MediaValue, { alt: string }>
    const main = take(input.files?.main, ['webp'], IMAGE_MAX_BYTES)
    const small = slot.smallWidth ? take(input.files?.small, ['webp'], IMAGE_MAX_BYTES, '-sm') : null
    if (main && slot.smallWidth && !small) throw new UserError('Falta la versión chica de la foto. Volvé a elegirla.')
    next = cleanMedia(slot.key, {
      src: main ?? current.src,
      srcSm: small ?? current.srcSm,
      alt: input.alt,
      width: main ? input.width : current.width,
      height: main ? input.height : current.height,
    })
    if (!next) throw new UserError('Revisá la descripción de la foto (mínimo 5 caracteres).')
    message = `Fotos y video (panel): ${main ? 'cambia' : 'edita la descripción de'} «${slot.label}»`
  } else {
    const main = take(input.files?.main, ['mp4', 'webm'], VIDEO_MAX_BYTES)
    const poster = take(input.files?.poster, ['webp'], IMAGE_MAX_BYTES, '-portada')
    if (!main || !poster) throw new UserError('Falta el video o su imagen de portada. Volvé a elegirlo.')
    next = cleanMedia(slot.key, { src: main, poster, duration: input.duration })
    if (!next) throw new UserError('El video no es válido (duración máxima superada).')
    message = `Fotos y video (panel): cambia «${slot.label}»`
  }

  // si queda igual al original, no se guarda nada en el JSON para ese lugar
  const nextValues = { ...values }
  if (next && JSON.stringify(next) !== JSON.stringify(slot.default)) nextValues[slot.key] = next
  else delete nextValues[slot.key]

  // archivos subidos antes y que ahora no usa nadie: se borran (los originales no están en esta carpeta)
  const inUse = new Set(Object.values(nextValues).flatMap(filesOf))
  for (const file of filesOf(before)) {
    if (file.startsWith(`${SITE_MEDIA_URL}/`) && !inUse.has(file)) changes.push({ path: `${SITE_MEDIA_DIR}/${file.slice(SITE_MEDIA_URL.length + 1)}`, content: null })
  }

  const content = `${JSON.stringify({ values: nextValues }, null, 2)}\n`
  if (content !== source) changes.push({ path: MEDIA_FILE, content })
  if (changes.length === 0) return { version, value: nextValues[slot.key] ?? null }
  await getStorage().commit(changes, message)
  return { version: hash(content), value: nextValues[slot.key] ?? null }
}
