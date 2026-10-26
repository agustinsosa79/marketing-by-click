import { priceLabel, type PricesInput } from '../../shared/site'
import { resolveList, resolveText, TOKENS, type TextValues } from '../../shared/texts'

/** Lee los textos de la web como los vería el sitio: el editado si es válido, si no el original. */
export interface TextReader {
  get(key: string): string
  list(key: string): string[]
}

/** "2 horas · 100 USD", igual que en el sitio. */
export const sesionLabel = (prices: PricesInput | null) => (prices ? priceLabel(prices.sesion, prices.currency) : '2 horas · 100 USD')

export function textReader(values: TextValues = {}, prices: PricesInput | null = null): TextReader {
  const sesion = sesionLabel(prices)
  // sin precio de la sesión: "…opcional: {precio_sesion}" queda "…opcional" (igual que en la web)
  const tokens = (s: string) => (sesion ? s.split(TOKENS.precioSesion).join(sesion) : s.replace(new RegExp(`:?\\s*${TOKENS.precioSesion}`, 'g'), ''))
  return {
    get: (key) => tokens(resolveText(values, key)),
    list: (key) => resolveList(values, key).map(tokens),
  }
}
