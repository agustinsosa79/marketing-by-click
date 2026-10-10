import { guarded, json } from '../server/http.js'
import { listProjects } from '../server/projects.js'

/** GET /api/projects → la lista de proyectos (resumen), en el orden del portfolio. */
export function GET(request: Request) {
  return guarded(request, async () => json({ projects: await listProjects() }))
}
