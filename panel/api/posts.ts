import { guarded, json } from '../server/http.js'
import { listPosts } from '../server/posts.js'

/** GET /api/posts → lista de notas (sin el cuerpo). */
export function GET(request: Request) {
  return guarded(request, async () => json({ posts: await listPosts() }))
}
