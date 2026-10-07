import { createHash, createHmac, timingSafeEqual } from 'node:crypto'

/**
 * Autenticación del panel (un solo usuario: el cliente).
 *  - La contraseña está en la variable PANEL_PASSWORD del servidor (Vercel las guarda cifradas;
 *    ahí mismo vive el token de GitHub, que es más delicado). Nunca llega al navegador.
 *  - La sesión es un token firmado con HMAC-SHA256 en una cookie httpOnly + Secure + SameSite=Strict:
 *    el JavaScript de la página no la puede leer y no viaja en pedidos desde otros sitios.
 *  - La clave que firma se deriva de la contraseña y del token: si cambia cualquiera de los dos,
 *    todas las sesiones abiertas se cierran solas.
 */

const COOKIE = 'mbc_panel'
const SESSION_DAYS = 7
const MIN_PASSWORD = 12

/** Qué falta configurar (null si está todo). Lo muestra el panel para saber qué corregir en Vercel. */
export function configProblem() {
  const password = process.env.PANEL_PASSWORD ?? ''
  if (!password) return 'Falta la variable PANEL_PASSWORD en Vercel.'
  if (password.length < MIN_PASSWORD) return `PANEL_PASSWORD tiene que tener al menos ${MIN_PASSWORD} caracteres.`
  if (process.env.PANEL_STORAGE !== 'local' && !process.env.GITHUB_TOKEN) return 'Falta la variable GITHUB_TOKEN en Vercel.'
  return null
}

function assertConfigured() {
  const problem = configProblem()
  if (problem) throw new Error(problem)
}

const digest = (text: string) => createHash('sha256').update(text).digest()

/** Compara en tiempo constante (sobre los hashes, así el largo no da pistas). */
export function verifyPassword(password: string) {
  assertConfigured()
  return timingSafeEqual(digest(password), digest(process.env.PANEL_PASSWORD!))
}

const secret = () => {
  assertConfigured()
  return digest(`mbc-panel-session:${process.env.PANEL_PASSWORD}:${process.env.GITHUB_TOKEN ?? ''}`)
}

const b64url = (data: string | Buffer) => Buffer.from(data).toString('base64url')
const sign = (payload: string) => createHmac('sha256', secret()).update(payload).digest('base64url')

export function createSessionCookie() {
  const exp = Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000
  const payload = b64url(JSON.stringify({ exp }))
  const token = `${payload}.${sign(payload)}`
  return `${COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${SESSION_DAYS * 24 * 60 * 60}`
}

export const clearSessionCookie = () => `${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`

/** true si el pedido trae una sesión válida y vigente. */
export function hasSession(request: Request) {
  const cookie = request.headers.get('cookie') ?? ''
  const token = cookie
    .split(';')
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${COOKIE}=`))
    ?.slice(COOKIE.length + 1)
  if (!token) return false
  const [payload, signature] = token.split('.')
  if (!payload || !signature) return false
  const expected = Buffer.from(sign(payload))
  const actual = Buffer.from(signature)
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return false
  try {
    const { exp } = JSON.parse(Buffer.from(payload, 'base64url').toString()) as { exp: number }
    return typeof exp === 'number' && exp > Date.now()
  } catch {
    return false
  }
}

/**
 * Freno a los intentos de adivinar la contraseña: después de 5 fallos desde la misma IP,
 * espera creciente. Vive en la memoria de cada instancia de la función (es un freno, no un muro:
 * la defensa principal es una contraseña larga).
 */
const failures = new Map<string, { count: number; until: number }>()

export function loginBlockedFor(ip: string) {
  const entry = failures.get(ip)
  return entry && entry.until > Date.now() ? Math.ceil((entry.until - Date.now()) / 1000) : 0
}

export function registerFailure(ip: string) {
  const entry = failures.get(ip) ?? { count: 0, until: 0 }
  entry.count += 1
  if (entry.count >= 5) entry.until = Date.now() + Math.min(15 * 60_000, 30_000 * 2 ** (entry.count - 5))
  failures.set(ip, entry)
}

export const clearFailures = (ip: string) => failures.delete(ip)
