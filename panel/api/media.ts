import { MEDIA_DIR, MEDIA_URL } from '../shared/blog.js'
import { SITE_MEDIA_DIR, SITE_MEDIA_URL } from '../shared/media.js'
import { PROJECTS_MEDIA_DIR, PROJECTS_MEDIA_URL } from '../shared/site.js'
import { guarded, json, readJson, UserError } from '../server/http.js'
import { getSiteMedia, saveSiteMedia, type SaveMediaInput } from '../server/sitemedia.js'
import { getStorage } from '../server/storage.js'

const TYPES: Record<string, string> = { webp: 'image/webp', jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', mp4: 'video/mp4', webm: 'video/webm' }
// carpeta pública del sitio → carpeta del repo ('/media' son los archivos originales del sitio: solo lectura)
const FOLDERS: Record<string, string> = { [MEDIA_URL]: MEDIA_DIR, [PROJECTS_MEDIA_URL]: PROJECTS_MEDIA_DIR, [SITE_MEDIA_URL]: SITE_MEDIA_DIR, '/media': 'public/media' }

/**
 * /api/media
 *   GET ?path=/media/…/archivo.webp → el archivo leído del repo (blog, proyectos, fotos y video de la web)
 *       Así el panel muestra lo recién subido aunque la web todavía no se haya vuelto a publicar.
 *       (?name=archivo.webp sigue funcionando para las imágenes del blog.)
 *   GET (sin path)                  → fotos y video de la web cambiados: { data, version }
 *   PUT { key, version, … }         → cambia o restaura una foto o el video (ver server/sitemedia.ts)
 */
export function GET(request: Request) {
  return guarded(request, async () => {
    const params = new URL(request.url).searchParams
    if (!params.has('path') && !params.has('name')) return json(await getSiteMedia())
    const path = params.get('path') ?? `${MEDIA_URL}/${params.get('name') ?? ''}`
    const match = path.match(/^(\/media(?:\/[a-z]+)?)\/([a-z0-9-]+\.(webp|jpe?g|png|mp4|webm))$/)
    const folder = match ? FOLDERS[match[1]] : undefined
    if (!match || !folder) throw new UserError('Archivo inválido.')
    const bytes = await getStorage().readBinary(`${folder}/${match[2]}`)
    if (!bytes) throw new UserError('Archivo inexistente.', 404)
    return new Response(new Blob([new Uint8Array(bytes)]), { headers: { 'content-type': TYPES[match[3]], 'cache-control': 'private, max-age=300' } })
  })
}

export function PUT(request: Request) {
  return guarded(request, async () => json(await saveSiteMedia(await readJson<SaveMediaInput>(request))))
}
