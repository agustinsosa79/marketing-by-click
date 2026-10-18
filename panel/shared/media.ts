/**
 * Fotos y video de la web editables desde el panel (sección "Fotos y video").
 * El blog y los proyectos tienen sus propias imágenes en sus secciones: acá va el resto.
 * Única fuente de verdad: qué se puede cambiar, con qué medidas y cuál es el archivo original.
 * La usan el sitio (src/data/content.ts), el panel y el servidor.
 *
 * Los archivos nuevos van a public/media/sitio/. En content/medios.json se guarda solo lo que cambió;
 * si un valor falta o no es válido, el sitio usa el original (que nunca se borra).
 *
 * ⚠️ Este archivo lo importa también el sitio: no puede importar nada.
 */

export const SITE_MEDIA_DIR = 'public/media/sitio'
export const SITE_MEDIA_URL = '/media/sitio'
export const MEDIA_FILE = 'content/medios.json'

/** Tope por archivo de video ya comprimido: cada guardado del panel viaja en un solo pedido (límite de Vercel 4,5 MB). */
export const VIDEO_MAX_BYTES = 3_100_000
export const VIDEO_MAX_SECONDS = 60
export const IMAGE_MAX_BYTES = 1_500_000

export interface MediaImage {
  src: string
  alt: string
  width: number
  height: number
  /** Versión chica (solo la portada, para celulares). */
  srcSm?: string
}

export interface MediaVideo {
  src: string
  poster: string
  /** Segundos (se muestra como "0:25"). */
  duration: number
}

interface SlotBase {
  key: string
  label: string
  section: string
  /** Dónde se ve, en palabras del cliente. */
  where: string
  hint: string
}

export type MediaSlot =
  | (SlotBase & { kind: 'image'; default: MediaImage; maxWidth: number; minWidth: number; smallWidth?: number; aspect: string; round?: boolean })
  | (SlotBase & { kind: 'video'; default: MediaVideo })

export const MEDIA_SLOTS: MediaSlot[] = [
  {
    key: 'hero.photo',
    kind: 'image',
    label: 'Foto principal',
    section: 'Inicio (portada)',
    where: 'Portada del inicio y la imagen que aparece al compartir el link de la web.',
    hint: 'Vertical (3:4), nítida y sin texto encima. Es lo primero que se ve: conviene una foto real de Ian o del equipo.',
    aspect: 'aspect-3/4',
    maxWidth: 1200,
    smallWidth: 600,
    minWidth: 900,
    default: {
      src: '/media/founder-ian.webp',
      srcSm: '/media/founder-ian-sm.webp',
      alt: 'Ian, fundador de Marketing by Clic, frente a un lago de la Patagonia',
      width: 1200,
      height: 1600,
    },
  },
  {
    key: 'nosotros.video',
    kind: 'video',
    label: 'Video de presentación',
    section: 'Nosotros',
    where: 'Sección Nosotros. El botón “Conocé a Ian” del inicio lo reproduce y muestra su duración.',
    hint: `Vertical u horizontal, de hasta ${VIDEO_MAX_SECONDS} segundos, con sonido. El panel lo comprime y arma la imagen de portada sola.`,
    default: { src: '/media/video-hero-ian.mp4', poster: '/media/ian-video-poster.webp', duration: 25 },
  },
  {
    key: 'asesoria.photo',
    kind: 'image',
    label: 'Foto de la asesoría',
    section: 'Asesoría 1:1',
    where: 'Tarjeta de la asesoría 1:1, debajo de los planes.',
    hint: 'Vertical. Se recorta al centro según el tamaño de pantalla: que lo importante esté en el medio.',
    aspect: 'aspect-9/16',
    maxWidth: 900,
    minWidth: 600,
    default: { src: '/media/videollamada.webp', alt: 'Ian en una videollamada, en la pantalla de una laptop', width: 900, height: 1600 },
  },
  {
    key: 'blog.author',
    kind: 'image',
    label: 'Foto del autor',
    section: 'Notas del blog',
    where: 'Foto redonda de Ian como autor, arriba y al final de cada nota.',
    hint: 'Primer plano de la cara. Se muestra chica y recortada en círculo.',
    aspect: 'aspect-square',
    maxWidth: 600,
    minWidth: 300,
    round: true,
    default: { src: '/media/founder-ian-sm.webp', alt: 'Ian, fundador de Marketing by Clic', width: 600, height: 800 },
  },
]

export const MEDIA_SLOT: Record<string, MediaSlot> = Object.fromEntries(MEDIA_SLOTS.map((s) => [s.key, s]))

export type MediaValue = MediaImage | MediaVideo
export type MediaValues = Record<string, MediaValue>

// ---------------------------------------------------------------- validación (servidor y sitio)

const FILE_RE = new RegExp(`^${SITE_MEDIA_URL}/[a-z0-9-]+\\.(webp|mp4|webm)$`)
/** Archivo subido desde el panel, o el original de ese lugar (para cambiar solo la descripción). */
const isFile = (v: unknown, ext: RegExp, original?: string) => typeof v === 'string' && (v === original || (FILE_RE.test(v) && ext.test(v)))
const plain = (v: unknown, max: number) =>
  String(v ?? '')
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max)

export const ALT_MAX = 160

/** Valor guardado válido para su lugar, normalizado; o null (el sitio usa el original). */
export function cleanMedia(key: string, raw: unknown): MediaValue | null {
  const slot = MEDIA_SLOT[key]
  if (!slot || !raw || typeof raw !== 'object') return null
  const v = raw as Record<string, unknown>
  if (slot.kind === 'image') {
    const width = Math.round(Number(v.width))
    const height = Math.round(Number(v.height))
    const alt = plain(v.alt, ALT_MAX)
    const d = slot.default
    if (!isFile(v.src, /\.webp$/, d.src) || !(width > 0 && width <= 6000 && height > 0 && height <= 6000) || alt.length < 5) return null
    if (slot.smallWidth && !isFile(v.srcSm, /\.webp$/, d.srcSm)) return null
    return { src: String(v.src), alt, width, height, ...(slot.smallWidth ? { srcSm: String(v.srcSm) } : {}) }
  }
  const duration = Math.round(Number(v.duration))
  const d = slot.default
  if (!isFile(v.src, /\.(mp4|webm)$/, d.src) || !isFile(v.poster, /\.webp$/, d.poster) || !(duration > 0 && duration <= VIDEO_MAX_SECONDS + 1)) return null
  return { src: String(v.src), poster: String(v.poster), duration }
}

/** Lo que usa el sitio para un lugar: el guardado si es válido, si no el original. */
export function resolveImage(values: Record<string, unknown> | undefined, key: string): MediaImage {
  const slot = MEDIA_SLOT[key]
  if (!slot || slot.kind !== 'image') throw new Error(`Imagen inexistente: ${key}`)
  return (cleanMedia(key, values?.[key]) as MediaImage | null) ?? slot.default
}

export function resolveVideo(values: Record<string, unknown> | undefined, key: string): MediaVideo {
  const slot = MEDIA_SLOT[key]
  if (!slot || slot.kind !== 'video') throw new Error(`Video inexistente: ${key}`)
  return (cleanMedia(key, values?.[key]) as MediaVideo | null) ?? slot.default
}

/** 25 → "0:25" */
export const formatDuration = (s: number) => `${Math.floor(s / 60)}:${String(Math.round(s) % 60).padStart(2, '0')}`

/** Archivos que usa un valor (para borrar los que quedan sin uso al reemplazar). */
export const filesOf = (v: MediaValue | null | undefined): string[] =>
  !v ? [] : 'poster' in v ? [v.src, v.poster] : [v.src, ...(v.srcSm ? [v.srcSm] : [])]
