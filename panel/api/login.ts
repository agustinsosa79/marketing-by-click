import { clearFailures, createSessionCookie, loginBlockedFor, registerFailure, verifyPassword } from '../server/auth.js'
import { clientIp, fail, json, readJson } from '../server/http.js'

/** POST /api/login { password } → cookie de sesión. */
export async function POST(request: Request) {
  try {
    const origin = request.headers.get('origin')
    if (!origin || new URL(origin).host !== new URL(request.url).host) return fail('Origen no permitido.', 403)
    const ip = clientIp(request)
    const wait = loginBlockedFor(ip)
    if (wait) return fail(`Demasiados intentos. Probá de nuevo en ${wait} segundos.`, 429)

    const { password } = await readJson<{ password?: string }>(request, 10_000)
    if (typeof password !== 'string' || !password || !verifyPassword(password)) {
      registerFailure(ip)
      // pausa fija: hace más lento probar contraseñas en serie
      await new Promise((r) => setTimeout(r, 700))
      return fail('Contraseña incorrecta.', 401)
    }
    clearFailures(ip)
    return json({ ok: true }, 200, { 'set-cookie': createSessionCookie() })
  } catch (error) {
    console.error(error)
    return fail('No se pudo iniciar sesión.', 500)
  }
}
