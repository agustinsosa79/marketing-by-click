import { configProblem, hasSession } from '../server/auth.js'
import { json } from '../server/http.js'

/** GET /api/session → { authenticated } (para saber si mostrar el login). */
export function GET(request: Request) {
  const problem = configProblem()
  if (problem) return json({ authenticated: false, error: problem }, 500)
  try {
    return json({ authenticated: hasSession(request) })
  } catch (error) {
    console.error(error)
    return json({ authenticated: false, error: 'Panel sin configurar.' }, 500)
  }
}
