import type { PricesInput } from '../shared/site.js'
import { guarded, json, readJson } from '../server/http.js'
import { getPrices, savePrices } from '../server/settings.js'

/**
 * /api/prices
 *   GET                       → { data, version }
 *   PUT { data, version }     → guarda (si nadie lo cambió en el medio)
 */
export function GET(request: Request) {
  return guarded(request, async () => json(await getPrices()))
}

export function PUT(request: Request) {
  return guarded(request, async () => {
    const { data, version } = await readJson<{ data: PricesInput; version: string }>(request, 20_000)
    return json(await savePrices(data, String(version ?? '')))
  })
}
