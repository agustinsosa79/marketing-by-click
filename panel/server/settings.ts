import { createHash } from 'node:crypto'
import {
  FAQ_FILE,
  FAQ_LIMITS,
  PLANS,
  PRICE_DETAIL_MAX,
  PRICE_RE,
  PRICES_FILE,
  type FaqItem,
  type PricesInput,
  type Versioned,
} from '../shared/site.js'
import { UserError } from './http.js'
import { getStorage } from './storage.js'

/**
 * Archivos únicos que edita el panel: precios (content/precios.json) y preguntas frecuentes (content/faq.json).
 * Cada lectura devuelve una "versión" (hash del contenido). Al guardar se compara: si alguien cambió el archivo
 * mientras se editaba (otra pestaña, otra persona), no se pisa: se pide recargar.
 */

const hash = (text: string) => createHash('sha256').update(text).digest('hex').slice(0, 16)
const line = (v: unknown) => String(v ?? '').replace(/\s+/g, ' ').trim()

async function readFile<T>(path: string, fallback: T): Promise<Versioned<T>> {
  const source = await getStorage().read(path)
  if (source === null) return { data: fallback, version: 'nuevo' }
  try {
    return { data: JSON.parse(source) as T, version: hash(source) }
  } catch {
    return { data: fallback, version: hash(source) }
  }
}

async function writeFile(path: string, data: unknown, version: string, message: string) {
  const storage = getStorage()
  const current = await storage.read(path)
  const currentVersion = current === null ? 'nuevo' : hash(current)
  if (currentVersion !== version) throw new UserError('Esto se cambió mientras lo editabas (desde otra pestaña o por otra persona). Recargá la página para ver la última versión.', 409)
  const content = `${JSON.stringify(data, null, 2)}\n`
  if (content === current) return { version: currentVersion }
  await storage.commit([{ path, content }], message)
  return { version: hash(content) }
}

// ---------------------------------------------------------------- precios

const EMPTY_PRICES: PricesInput = {
  currency: 'USD',
  plans: { inicial: '', plus: '', premium: '' },
  asesoria: { price: '', detail: '' },
  sesion: { price: '', detail: '' },
}

export async function getPrices(): Promise<Versioned<PricesInput>> {
  const { data, version } = await readFile<Partial<PricesInput>>(PRICES_FILE, EMPTY_PRICES)
  return {
    version,
    data: {
      currency: line(data.currency) || 'USD',
      plans: { inicial: line(data.plans?.inicial), plus: line(data.plans?.plus), premium: line(data.plans?.premium) },
      asesoria: { price: line(data.asesoria?.price), detail: line(data.asesoria?.detail) },
      sesion: { price: line(data.sesion?.price), detail: line(data.sesion?.detail) },
    },
  }
}

export async function savePrices(raw: PricesInput, version: string) {
  if (!raw || typeof raw !== 'object') throw new UserError('Precios inválidos.')
  const prices: PricesInput = {
    // la moneda no se edita desde el panel: todo el sitio está en USD
    currency: 'USD',
    plans: { inicial: line(raw.plans?.inicial), plus: line(raw.plans?.plus), premium: line(raw.plans?.premium) },
    asesoria: { price: line(raw.asesoria?.price), detail: line(raw.asesoria?.detail) },
    sesion: { price: line(raw.sesion?.price), detail: line(raw.sesion?.detail) },
  }
  for (const plan of PLANS) if (!PRICE_RE.test(prices.plans[plan.id])) throw new UserError(`El precio del plan ${plan.name} tiene que ser un número, sin puntos ni símbolos.`)
  if (!PRICE_RE.test(prices.sesion.price)) throw new UserError('El precio de la sesión de fotos tiene que ser un número, sin puntos ni símbolos.')
  if (prices.asesoria.price && !PRICE_RE.test(prices.asesoria.price)) throw new UserError('El precio de la asesoría tiene que ser un número, sin puntos ni símbolos (o dejalo vacío).')
  if ([prices.asesoria.detail, prices.sesion.detail].some((d) => d.length > PRICE_DETAIL_MAX)) throw new UserError(`El detalle de un precio puede tener hasta ${PRICE_DETAIL_MAX} caracteres.`)
  return writeFile(PRICES_FILE, prices, version, 'Precios (panel): actualiza los precios')
}

// ---------------------------------------------------------------- preguntas frecuentes

export async function getFaq(): Promise<Versioned<FaqItem[]>> {
  const { data, version } = await readFile<{ items?: FaqItem[] }>(FAQ_FILE, { items: [] })
  const items = Array.isArray(data.items) ? data.items.map((i) => ({ q: String(i?.q ?? ''), a: String(i?.a ?? '') })) : []
  return { data: items, version }
}

export async function saveFaq(raw: FaqItem[], version: string) {
  if (!Array.isArray(raw)) throw new UserError('Preguntas inválidas.')
  const items = raw.map((i) => ({ q: line(i?.q), a: line(i?.a) })).filter((i) => i.q || i.a)
  if (items.length > FAQ_LIMITS.items) throw new UserError(`Se pueden cargar hasta ${FAQ_LIMITS.items} preguntas.`)
  items.forEach((item, n) => {
    if (!item.q || !item.a) throw new UserError(`A la pregunta ${n + 1} le falta ${item.q ? 'la respuesta' : 'la pregunta'}.`)
    if (item.q.length > FAQ_LIMITS.q) throw new UserError(`La pregunta ${n + 1} es demasiado larga (máximo ${FAQ_LIMITS.q} caracteres).`)
    if (item.a.length > FAQ_LIMITS.a) throw new UserError(`La respuesta ${n + 1} es demasiado larga (máximo ${FAQ_LIMITS.a} caracteres).`)
  })
  return writeFile(FAQ_FILE, { items }, version, `Preguntas frecuentes (panel): ${items.length} preguntas`)
}
