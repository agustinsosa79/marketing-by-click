import type { NewImage } from '../shared/blog.js'
import type { ProjectInput } from '../shared/site.js'
import { guarded, json, readJson, UserError } from '../server/http.js'
import { deleteProject, getProject, moveProject, saveProject } from '../server/projects.js'

/**
 * /api/project
 *   GET    ?slug=…                          → el proyecto completo
 *   POST   { project, images }              → crea
 *   PUT    { project, images }              → edita
 *   PATCH  ?slug=… { action }               → "up" | "down" | "top" (posición en el portfolio)
 *   DELETE ?slug=…                          → elimina
 */
const slugParam = (request: Request) => {
  const slug = new URL(request.url).searchParams.get('slug')
  if (!slug) throw new UserError('Falta el proyecto.')
  return slug
}

export function GET(request: Request) {
  return guarded(request, async () => json({ project: await getProject(slugParam(request)) }))
}

export function POST(request: Request) {
  return guarded(request, async () => {
    const { project, images = [] } = await readJson<{ project: ProjectInput; images?: NewImage[] }>(request)
    return json(await saveProject(project, images, 'create'), 201)
  })
}

export function PUT(request: Request) {
  return guarded(request, async () => {
    const { project, images = [] } = await readJson<{ project: ProjectInput; images?: NewImage[] }>(request)
    return json(await saveProject(project, images, 'update'))
  })
}

export function PATCH(request: Request) {
  return guarded(request, async () => {
    const slug = slugParam(request)
    const { action } = await readJson<{ action?: string }>(request, 1_000)
    if (action === 'up' || action === 'down' || action === 'top') await moveProject(slug, action)
    else throw new UserError('Acción inválida.')
    return json({ ok: true })
  })
}

export function DELETE(request: Request) {
  return guarded(request, async () => {
    await deleteProject(slugParam(request))
    return json({ ok: true })
  })
}
