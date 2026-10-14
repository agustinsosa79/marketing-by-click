import type { TextValues } from '../shared/texts.js'
import { guarded, json, readJson } from '../server/http.js'
import { getTexts, saveTexts } from '../server/settings.js'

/**
 * /api/texts — textos de la web editables desde el panel (solo los que difieren del original)
 *   GET                       → { data, version }
 *   PUT { data, version }     → guarda (si nadie lo cambió en el medio)
 */
export function GET(request: Request) {
  return guarded(request, async () => json(await getTexts()))
}

export function PUT(request: Request) {
  return guarded(request, async () => {
    const { data, version } = await readJson<{ data: TextValues; version: string }>(request, 200_000)
    return json(await saveTexts(data, String(version ?? '')))
  })
}
