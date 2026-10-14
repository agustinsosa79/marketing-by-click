import type { PricesInput } from '../../shared/site'
import { resolveList, resolveText, TOKENS, type TextValues } from '../../shared/texts'

/** Lee los textos de la web como los vería el sitio: el editado si es válido, si no el original. */
export interface TextReader {
  get(key: string): string
  list(key: string): string[]
}

/** "2 horas · 100 USD", igual que en el sitio. */
export const sesionLabel = (prices: PricesInput | null) =>
  prices ? [prices.sesion.detail, /^\d{1,6}$/.test(prices.sesion.price) ? `${prices.sesion.price} ${prices.currency}` : ''].filter(Boolean).join(' · ') : '2 horas · 100 USD'

export function textReader(values: TextValues = {}, prices: PricesInput | null = null): TextReader {
  const sesion = sesionLabel(prices)
  const tokens = (s: string) => s.split(TOKENS.precioSesion).join(sesion)
  return {
    get: (key) => tokens(resolveText(values, key)),
    list: (key) => resolveList(values, key).map(tokens),
  }
}
