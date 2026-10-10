import type { FaqItem } from '../shared/site.js'
import { guarded, json, readJson } from '../server/http.js'
import { getFaq, saveFaq } from '../server/settings.js'

/**
 * /api/faq
 *   GET                       → { data: [{ q, a }], version }
 *   PUT { data, version }     → guarda (si nadie lo cambió en el medio)
 */
export function GET(request: Request) {
  return guarded(request, async () => json(await getFaq()))
}

export function PUT(request: Request) {
  return guarded(request, async () => {
    const { data, version } = await readJson<{ data: FaqItem[]; version: string }>(request, 100_000)
    return json(await saveFaq(data, String(version ?? '')))
  })
}
