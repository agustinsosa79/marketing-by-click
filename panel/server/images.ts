import { IMAGE_NAME_RE, LIMITS, type NewImage } from '../shared/blog.js'
import { UserError } from './http.js'

/**
 * Imágenes nuevas que llegan del panel (blog y proyectos): nombre seguro, WebP real
 * (no otro archivo renombrado) y tamaño acotado, por imagen y en total.
 */
export function validateImages(images: NewImage[]) {
  if (!Array.isArray(images)) throw new UserError('Imágenes inválidas.')
  let total = 0
  const names = new Set<string>()
  for (const img of images) {
    if (!IMAGE_NAME_RE.test(img.name) || names.has(img.name)) throw new UserError('Nombre de imagen inválido.')
    names.add(img.name)
    const bytes = Buffer.from(String(img.base64), 'base64')
    total += bytes.length
    const isWebp = bytes.subarray(0, 4).toString('ascii') === 'RIFF' && bytes.subarray(8, 12).toString('ascii') === 'WEBP'
    if (!isWebp) throw new UserError('Las imágenes tienen que ser WebP (el panel las convierte solo).')
    if (bytes.length > LIMITS.image) throw new UserError('Una imagen es demasiado pesada.')
  }
  if (total > LIMITS.imagesTotal) throw new UserError('Las imágenes nuevas pesan demasiado juntas. Guardá con menos imágenes nuevas y sumá el resto en otro guardado.')
}
