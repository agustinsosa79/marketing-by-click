import { MEDIA_DIR } from '../shared/blog.js'
import { guarded, UserError } from '../server/http.js'
import { getStorage } from '../server/storage.js'

const TYPES: Record<string, string> = { webp: 'image/webp', jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png' }

/**
 * GET /api/media?name=archivo.webp → imagen del blog leída del repo.
 * Así el panel muestra las imágenes recién subidas aunque la web todavía no se haya vuelto a publicar.
 */
export function GET(request: Request) {
  return guarded(request, async () => {
    const name = new URL(request.url).searchParams.get('name') ?? ''
    const ext = name.split('.').pop() ?? ''
    if (!/^[a-z0-9-]+\.(webp|jpe?g|png)$/.test(name)) throw new UserError('Imagen inválida.')
    const bytes = await getStorage().readBinary(`${MEDIA_DIR}/${name}`)
    if (!bytes) throw new UserError('Imagen inexistente.', 404)
    return new Response(new Blob([new Uint8Array(bytes)]), { headers: { 'content-type': TYPES[ext], 'cache-control': 'private, max-age=300' } })
  })
}
