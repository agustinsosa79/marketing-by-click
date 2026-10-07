import { clearSessionCookie } from '../server/auth.js'
import { json } from '../server/http.js'

/** POST /api/logout → borra la cookie de sesión. */
export function POST() {
  return json({ ok: true }, 200, { 'set-cookie': clearSessionCookie() })
}
