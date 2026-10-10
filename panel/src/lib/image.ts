import { LIMITS } from '../../shared/blog'

/**
 * Prepara una imagen en el navegador antes de subirla: la achica (máx. 1600 px de ancho) y la convierte a WebP.
 * Así el sitio sigue rápido aunque el cliente suba fotos de 10 MB del celular.
 */
export interface PreparedImage {
  name: string
  base64: string
  /** para mostrarla en el panel antes de guardar */
  url: string
  /** medidas finales (el sitio las usa para reservar el lugar de la imagen mientras carga) */
  width: number
  height: number
}

const rand = () => Math.random().toString(36).slice(2, 8)

export async function prepareImage(file: File, baseName: string, maxWidth = 1600): Promise<PreparedImage> {
  if (!file.type.startsWith('image/')) throw new Error('El archivo no es una imagen.')
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, maxWidth / bitmap.width)
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close()

  let blob: Blob | null = null
  for (const quality of [0.82, 0.7, 0.55]) {
    blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/webp', quality))
    if (blob && blob.size <= LIMITS.image * 0.6) break
  }
  if (!blob || blob.type !== 'image/webp') throw new Error('Tu navegador no pudo convertir la imagen. Probá con otra.')
  if (blob.size > LIMITS.image) throw new Error('La imagen es demasiado grande, incluso comprimida.')

  const url = await new Promise<string>((resolve) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.readAsDataURL(blob)
  })
  const base = (baseName || 'imagen').slice(0, 50).replace(/-$/, '')
  return { name: `${base}-${rand()}.webp`, base64: url.split(',')[1], url, width: canvas.width, height: canvas.height }
}
