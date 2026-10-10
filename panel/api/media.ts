import { MEDIA_DIR, MEDIA_URL } from '../shared/blog.js'
import { PROJECTS_MEDIA_DIR, PROJECTS_MEDIA_URL } from '../shared/site.js'
import { guarded, UserError } from '../server/http.js'
import { getStorage } from '../server/storage.js'

const TYPES: Record<string, string> = { webp: 'image/webp', jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png' }
// carpeta pública del sitio → carpeta del repo
const FOLDERS: Record<string, string> = { [MEDIA_URL]: MEDIA_DIR, [PROJECTS_MEDIA_URL]: PROJECTS_MEDIA_DIR }

/**
 * GET /api/media?path=/media/blog/archivo.webp → imagen leída del repo (blog o proyectos).
 * Así el panel muestra las imágenes recién subidas aunque la web todavía no se haya vuelto a publicar.
 * (?name=archivo.webp sigue funcionando para las imágenes del blog.)
 */
export function GET(request: Request) {
  return guarded(request, async () => {
    const params = new URL(request.url).searchParams
    const path = params.get('path') ?? `${MEDIA_URL}/${params.get('name') ?? ''}`
    const match = path.match(/^(\/media\/[a-z]+)\/([a-z0-9-]+\.(webp|jpe?g|png))$/)
    const folder = match ? FOLDERS[match[1]] : undefined
    if (!match || !folder) throw new UserError('Imagen inválida.')
    const bytes = await getStorage().readBinary(`${folder}/${match[2]}`)
    if (!bytes) throw new UserError('Imagen inexistente.', 404)
    return new Response(new Blob([new Uint8Array(bytes)]), { headers: { 'content-type': TYPES[match[3]], 'cache-control': 'private, max-age=300' } })
  })
}
