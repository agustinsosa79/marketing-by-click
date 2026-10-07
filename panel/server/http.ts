import { hasSession } from './auth.js'

/** Respuestas y controles comunes de las funciones del panel. */

export const json = (data: unknown, status = 200, headers: Record<string, string> = {}) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...headers },
  })

export const fail = (message: string, status = 400) => json({ error: message }, status)

/** Pedidos que modifican datos: tienen que venir del mismo origen que el panel (defensa extra contra CSRF). */
function sameOrigin(request: Request) {
  const origin = request.headers.get('origin')
  if (!origin) return false
  return new URL(origin).host === new URL(request.url).host
}

/**
 * Corre el handler solo si hay sesión (y, si modifica datos, si viene del propio panel).
 * Los errores internos no se le muestran al usuario con detalle: van al log de Vercel.
 */
export async function guarded(request: Request, handler: () => Promise<Response>) {
  try {
    if (!hasSession(request)) return fail('Tu sesión venció. Volvé a ingresar.', 401)
    if (request.method !== 'GET' && !sameOrigin(request)) return fail('Origen no permitido.', 403)
    return await handler()
  } catch (error) {
    if (error instanceof UserError) return fail(error.message, error.status)
    console.error(error)
    return fail('Algo salió mal. Probá de nuevo en un momento.', 500)
  }
}

/** Error con un mensaje apto para mostrarle al usuario. */
export class UserError extends Error {
  status: number
  constructor(message: string, status = 400) {
    super(message)
    this.status = status
  }
}

/** Lee el cuerpo JSON con un tope de tamaño (las funciones de Vercel aceptan hasta 4.5 MB). */
export async function readJson<T>(request: Request, maxBytes = 4_400_000): Promise<T> {
  const text = await request.text()
  if (text.length > maxBytes) throw new UserError('El pedido es demasiado grande. Usá imágenes más livianas.', 413)
  try {
    return JSON.parse(text) as T
  } catch {
    throw new UserError('Pedido inválido.')
  }
}

export const clientIp = (request: Request) => request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'local'
