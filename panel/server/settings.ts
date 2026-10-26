import { createHash } from 'node:crypto'
import {
  FAQ_FILE,
  FAQ_LIMITS,
  PLANS,
  PRICE_DETAIL_MAX,
  PRICE_RE,
  PRICES_FILE,
  SERVICE_PRICES,
  type FaqItem,
  type PricesInput,
  TEXTS_FILE,
  TESTIMONIAL_LIMITS as TL,
  TESTIMONIAL_PHOTO_RE,
  TESTIMONIALS_FILE,
  TESTIMONIALS_MEDIA_DIR,
  TESTIMONIALS_MEDIA_URL,
  type TestimonialItem,
  type Versioned,
} from '../shared/site.js'
import { cleanTexts, TEXT_FIELDS, type TextValues } from '../shared/texts.js'
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
  ...(Object.fromEntries(SERVICE_PRICES.map((s) => [s.id, { price: '', detail: '' }])) as Record<(typeof SERVICE_PRICES)[number]['id'], { price: string; detail: string }>),
}
const serviceFields = (raw: Partial<PricesInput> | undefined) =>
  Object.fromEntries(SERVICE_PRICES.map((s) => [s.id, { price: line(raw?.[s.id]?.price), detail: line(raw?.[s.id]?.detail) }])) as Omit<PricesInput, 'currency' | 'plans'>

export async function getPrices(): Promise<Versioned<PricesInput>> {
  const { data, version } = await readFile<Partial<PricesInput>>(PRICES_FILE, EMPTY_PRICES)
  return {
    version,
    data: {
      currency: line(data.currency) || 'USD',
      plans: { inicial: line(data.plans?.inicial), plus: line(data.plans?.plus), premium: line(data.plans?.premium) },
      ...serviceFields(data),
    },
  }
}

export async function savePrices(raw: PricesInput, version: string) {
  if (!raw || typeof raw !== 'object') throw new UserError('Precios inválidos.')
  const prices: PricesInput = {
    // la moneda no se edita desde el panel: todo el sitio está en USD
    currency: 'USD',
    plans: { inicial: line(raw.plans?.inicial), plus: line(raw.plans?.plus), premium: line(raw.plans?.premium) },
    ...serviceFields(raw),
  }
  for (const plan of PLANS) if (!PRICE_RE.test(prices.plans[plan.id])) throw new UserError(`El precio del plan ${plan.name} tiene que ser un número, sin puntos ni símbolos.`)
  // servicios: el precio es opcional (vacío = la web no lo muestra)
  for (const s of SERVICE_PRICES) {
    if (prices[s.id].price && !PRICE_RE.test(prices[s.id].price)) throw new UserError(`El precio de «${s.name}» tiene que ser un número, sin puntos ni símbolos (o dejalo vacío).`)
    if (prices[s.id].detail.length > PRICE_DETAIL_MAX) throw new UserError(`El detalle del precio de «${s.name}» puede tener hasta ${PRICE_DETAIL_MAX} caracteres.`)
  }
  return writeFile(PRICES_FILE, prices, version, 'Precios (panel): actualiza los precios')
}

// ---------------------------------------------------------------- textos de la web

/** Textos cambiados respecto del original (lo que no está, se ve con su texto original). */
export async function getTexts(): Promise<Versioned<TextValues>> {
  const { data, version } = await readFile<{ values?: unknown }>(TEXTS_FILE, { values: {} })
  // al leer se limpia igual que al guardar: un archivo editado a mano no rompe el panel
  return { data: cleanTexts(data.values).values, version }
}

export async function saveTexts(raw: TextValues, version: string) {
  const { values, errors } = cleanTexts(raw)
  if (errors.length) {
    const field = TEXT_FIELDS[errors[0].key]
    throw new UserError(`«${field?.label ?? errors[0].key}»: ${errors[0].message}`)
  }
  const changed = Object.keys(values).length
  return writeFile(TEXTS_FILE, { values }, version, `Textos (panel): ${changed} texto${changed === 1 ? '' : 's'} distinto${changed === 1 ? '' : 's'} del original`)
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

// ---------------------------------------------------------------- testimonios

export async function getTestimonials(): Promise<Versioned<TestimonialItem[]>> {
  const { data, version } = await readFile<{ items?: TestimonialItem[] }>(TESTIMONIALS_FILE, { items: [] })
  const items = (Array.isArray(data.items) ? data.items : []).map((t) => ({
    name: line(t?.name),
    role: line(t?.role),
    text: line(t?.text),
    photo: t?.photo && typeof t.photo.src === 'string' ? { src: t.photo.src, alt: line(t.photo.alt) } : null,
  }))
  return { data: items, version }
}

/**
 * Guarda los testimonios y sus fotos en un solo commit: el JSON, las fotos nuevas (WebP del panel)
 * y el borrado de las fotos que ya no usa ninguno.
 */
export async function saveTestimonials(raw: TestimonialItem[], version: string, photos: { name: string; base64: string }[]) {
  if (!Array.isArray(raw)) throw new UserError('Testimonios inválidos.')
  const items: TestimonialItem[] = raw
    .map((t) => ({
      name: line(t?.name),
      role: line(t?.role),
      // las comillas las pone la web: se sacan si vienen escritas
      text: line(t?.text).replace(/^["“”«»]+|["“”«»]+$/g, '').trim(),
      photo: t?.photo && typeof t.photo.src === 'string' ? { src: String(t.photo.src), alt: line(t.photo.alt) } : null,
    }))
    .filter((t) => t.name || t.text || t.role)
  if (items.length > TL.items) throw new UserError(`Se pueden cargar hasta ${TL.items} testimonios.`)
  items.forEach((t, n) => {
    if (t.name.length < TL.name.min || t.name.length > TL.name.max) throw new UserError(`Testimonio ${n + 1}: el nombre tiene que tener entre ${TL.name.min} y ${TL.name.max} caracteres.`)
    if (t.role.length > TL.role.max) throw new UserError(`Testimonio ${n + 1}: la descripción puede tener hasta ${TL.role.max} caracteres.`)
    if (t.text.length < TL.text.min || t.text.length > TL.text.max) throw new UserError(`Testimonio ${n + 1}: el texto tiene que tener entre ${TL.text.min} y ${TL.text.max} caracteres.`)
  })

  // fotos: las nuevas tienen que ser WebP reales y chicas; cada foto usada tiene que existir o llegar ahora
  if (!Array.isArray(photos) || photos.length > TL.items) throw new UserError('Fotos inválidas.')
  const incoming = new Map<string, Buffer>()
  for (const p of photos) {
    if (!TESTIMONIAL_PHOTO_RE.test(p?.name ?? '')) throw new UserError('Nombre de foto inválido.')
    const bytes = Buffer.from(String(p.base64), 'base64')
    const isWebp = bytes.subarray(0, 4).toString('ascii') === 'RIFF' && bytes.subarray(8, 12).toString('ascii') === 'WEBP'
    if (!isWebp) throw new UserError('Las fotos tienen que ser WebP (el panel las convierte solo).')
    if (bytes.length > TL.photoBytes) throw new UserError('Una foto es demasiado pesada.')
    incoming.set(p.name, bytes)
  }
  const storage = getStorage()
  const available = new Set((await storage.list(TESTIMONIALS_MEDIA_DIR)).map((f) => f.split('/').pop()!))
  const used = new Set<string>()
  for (const t of items) {
    if (!t.photo) continue
    const name = t.photo.src.startsWith(`${TESTIMONIALS_MEDIA_URL}/`) ? t.photo.src.slice(TESTIMONIALS_MEDIA_URL.length + 1) : ''
    if (!TESTIMONIAL_PHOTO_RE.test(name) || (!available.has(name) && !incoming.has(name))) throw new UserError('Falta una foto. Volvé a subirla.')
    t.photo = { src: `${TESTIMONIALS_MEDIA_URL}/${name}`, alt: t.photo.alt || t.name }
    used.add(name)
  }

  const current = await storage.read(TESTIMONIALS_FILE)
  const currentVersion = current === null ? 'nuevo' : hash(current)
  if (currentVersion !== version) throw new UserError('Esto se cambió mientras lo editabas (desde otra pestaña o por otra persona). Recargá la página para ver la última versión.', 409)
  const content = `${JSON.stringify({ items }, null, 2)}\n`
  const changes = [
    ...[...incoming].filter(([name]) => used.has(name)).map(([name, bytes]) => ({ path: `${TESTIMONIALS_MEDIA_DIR}/${name}`, content: bytes.toString('base64'), encoding: 'base64' as const })),
    ...[...available].filter((name) => !used.has(name)).map((name) => ({ path: `${TESTIMONIALS_MEDIA_DIR}/${name}`, content: null })),
  ]
  if (content === current && changes.length === 0) return { version: currentVersion }
  await storage.commit([...changes, { path: TESTIMONIALS_FILE, content }], `Testimonios (panel): ${items.length} testimonio${items.length === 1 ? '' : 's'}`)
  return { version: hash(content) }
}
