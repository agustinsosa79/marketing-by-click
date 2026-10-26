import type { TestimonialItem } from '../shared/site.js'
import { guarded, json, readJson } from '../server/http.js'
import { getTestimonials, saveTestimonials } from '../server/settings.js'

/**
 * /api/testimonials
 *   GET                               → { data: [{ name, role, text, photo }], version }
 *   PUT { data, version, photos }     → guarda los testimonios y las fotos nuevas (si nadie lo cambió en el medio)
 */
export function GET(request: Request) {
  return guarded(request, async () => json(await getTestimonials()))
}

export function PUT(request: Request) {
  return guarded(request, async () => {
    const { data, version, photos = [] } = await readJson<{ data: TestimonialItem[]; version: string; photos?: { name: string; base64: string }[] }>(request, 4_000_000)
    return json(await saveTestimonials(data, String(version ?? ''), photos))
  })
}
