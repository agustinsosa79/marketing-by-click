import { LIMITS, SITE_URL } from '../../shared/blog'
import { headings, wordCount } from '../lib/markdown'

interface Props {
  slug: string
  title: string
  description: string
  coverAlt: string
  hasCover: boolean
  body: string
}

const cut = (text: string, max: number) => (text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text)

/**
 * Cómo se va a ver la nota en Google + una revisión simple de lo que más pesa para posicionar.
 * Son recomendaciones: no bloquean la publicación.
 */
export function SeoPanel({ slug, title, description, coverAlt, hasCover, body }: Props) {
  const words = wordCount(body)
  const subtitles = headings(body).length
  const internalLink = /\]\((https:\/\/marketingbyclic\.com)?\/(servicios|blog)\//.test(body)
  const checks = [
    { ok: title.length >= 30 && title.length <= LIMITS.title.seoMax, text: `Título de 30 a ${LIMITS.title.seoMax} caracteres (tiene ${title.length})` },
    { ok: description.length >= LIMITS.description.seoMin && description.length <= LIMITS.description.seoMax, text: `Resumen de ${LIMITS.description.seoMin} a ${LIMITS.description.seoMax} caracteres (tiene ${description.length})` },
    { ok: hasCover && coverAlt.length > 5, text: 'Portada con descripción' },
    { ok: subtitles >= 2, text: `Al menos 2 subtítulos (tiene ${subtitles})` },
    { ok: words >= 300, text: `Al menos 300 palabras (tiene ${words})` },
    { ok: internalLink, text: 'Un enlace a un servicio o a otra nota' },
  ]
  const done = checks.filter((c) => c.ok).length

  return (
    <section className="flex flex-col gap-4 rounded-2xl bg-white p-5 ring-1 ring-brand-deep/10" aria-label="Google">
      <div>
        <p className="text-xs font-bold tracking-widest text-brand-deep/60 uppercase">Así se vería en Google</p>
        <div className="mt-3 font-[Arial,sans-serif]">
          <p className="truncate text-xs text-[#202124]">
            marketingbyclic.com <span className="text-[#5f6368]">› blog › {slug || 'direccion-de-la-nota'}</span>
          </p>
          <p className="mt-1 text-lg leading-snug text-[#1a0dab]">{cut(title || 'Título de la nota', 62)} | Blog de Marketing by Clic</p>
          <p className="mt-1 text-sm leading-snug text-[#4d5156]">{cut(description || 'El resumen de la nota aparece acá.', 160)}</p>
        </div>
      </div>

      <div className="border-t border-brand-deep/10 pt-4">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold tracking-widest text-brand-deep/60 uppercase">Revisión</p>
          <p className={`text-xs font-bold ${done === checks.length ? 'text-emerald-700' : 'text-amber-700'}`}>
            {done} de {checks.length}
          </p>
        </div>
        <ul className="mt-3 flex flex-col gap-2">
          {checks.map((c) => (
            <li key={c.text} className="flex items-start gap-2 text-sm">
              <span aria-hidden="true" className={`mt-0.5 grid size-4 shrink-0 place-items-center rounded-full text-[0.6rem] font-black ${c.ok ? 'bg-emerald-600 text-white' : 'bg-amber-100 text-amber-800'}`}>
                {c.ok ? '✓' : '!'}
              </span>
              <span className={c.ok ? 'text-brand-night/70' : 'font-semibold text-brand-night'}>{c.text}</span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs leading-relaxed text-brand-night/50">
          Recomendaciones para aparecer mejor en Google. No impiden publicar. Ejemplo de enlace: {SITE_URL}/servicios/meta-ads
        </p>
      </div>
    </section>
  )
}
