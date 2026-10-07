import type { NewImage, PostInput } from '../shared/blog.js'
import { guarded, json, readJson, UserError } from '../server/http.js'
import { deletePost, getPost, savePost } from '../server/posts.js'

/**
 * /api/post
 *   GET    ?slug=…            → la nota completa
 *   POST   { post, images }   → crea
 *   PUT    { post, images }   → edita
 *   DELETE ?slug=…            → elimina
 */
const slugParam = (request: Request) => {
  const slug = new URL(request.url).searchParams.get('slug')
  if (!slug) throw new UserError('Falta la nota.')
  return slug
}

export function GET(request: Request) {
  return guarded(request, async () => json({ post: await getPost(slugParam(request)) }))
}

export function POST(request: Request) {
  return guarded(request, async () => {
    const { post, images = [] } = await readJson<{ post: PostInput; images?: NewImage[] }>(request)
    return json(await savePost(post, images, 'create'), 201)
  })
}

export function PUT(request: Request) {
  return guarded(request, async () => {
    const { post, images = [] } = await readJson<{ post: PostInput; images?: NewImage[] }>(request)
    return json(await savePost(post, images, 'update'))
  })
}

export function DELETE(request: Request) {
  return guarded(request, async () => {
    await deletePost(slugParam(request))
    return json({ ok: true })
  })
}
