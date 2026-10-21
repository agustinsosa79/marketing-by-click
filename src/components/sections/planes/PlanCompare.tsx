import { planes } from '../../../data/content'
import { Button } from '../../ui/Button'
import { Check } from '../../ui/Icon'

const PLANS = planes.plans
const C = planes.compare

// El n-ésimo ítem de cada plan habla de lo mismo (análisis, contenido, canales, producción): una fila por posición
const ROWS = Math.max(...PLANS.map((p) => p.features.length))

// Encabezado de cada plan, con el color de su tarjeta
const HEAD: Record<string, string> = {
  light: 'bg-brand-signal text-brand-ink',
  signal: 'bg-brand-deep text-white',
  night: 'bg-brand-night text-white',
}

/**
 * Comparación de los tres planes lado a lado (va dentro de una ventana que se abre desde Planes).
 * En el celular la tabla se desliza de costado con la primera columna fija.
 */
export function PlanCompare() {
  return (
    <div className="flex flex-col gap-6">
      <div className="no-scrollbar -mx-5 overflow-x-auto px-5 md:mx-0 md:px-0">
        <table className="w-full min-w-xl border-separate border-spacing-x-2 text-left">
          <thead>
            <tr>
              <th scope="col" className="sticky left-0 z-10 bg-white">
                <span className="sr-only">{C.label}</span>
              </th>
              {PLANS.map((p) => (
                <th key={p.id} scope="col" className={`rounded-t-2xl px-4 pt-4 pb-3 align-bottom ${HEAD[p.tone]}`}>
                  <span className="block font-label text-label">{p.name}</span>
                  {p.featured && <span className="mt-1 inline-block rounded-full bg-brand-signal px-2 py-0.5 text-xs font-bold text-brand-ink">{planes.badge}</span>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row" className="sticky left-0 z-10 bg-white py-3 pr-3 text-sm font-bold text-brand-deep">
                {C.price}
              </th>
              {PLANS.map((p) => (
                <td key={p.id} className="bg-brand-mist px-4 py-3">
                  <span className="font-display text-4xl">{p.price}</span> <span className="text-sm font-bold text-brand-night/70">{planes.currency}</span>
                </td>
              ))}
            </tr>
            {Array.from({ length: ROWS }, (_, row) => (
              <tr key={row}>
                <th scope="row" className="sticky left-0 z-10 bg-white py-3 pr-3 text-sm font-bold text-brand-deep">
                  {C.rows[row] ?? C.rows[C.rows.length - 1]}
                </th>
                {PLANS.map((p) => (
                  <td key={p.id} className="border-t border-brand-deep/10 bg-brand-mist px-4 py-3 align-top font-medium">
                    {p.features[row] ?? <span className="text-brand-night/40">{C.none}</span>}
                  </td>
                ))}
              </tr>
            ))}
            <tr>
              <th scope="row" className="sticky left-0 z-10 bg-white py-3 pr-3 text-sm font-bold text-brand-deep">
                {PLANS.find((p) => p.highlight)?.highlight?.title}
              </th>
              {PLANS.map((p) => (
                <td key={p.id} className="rounded-b-2xl border-t border-brand-deep/10 bg-brand-mist px-4 py-3">
                  {p.highlight ? (
                    <span className="grid size-7 place-items-center rounded-full bg-brand-signal text-brand-ink">
                      <Check className="size-3.5" />
                    </span>
                  ) : (
                    <span className="text-brand-night/40">{C.none}</span>
                  )}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-brand-night/70">{planes.note}</p>
        <Button href={planes.ctaHref} label={planes.cta} variant="signal" icon="whatsapp" cursor="Escribinos" />
      </div>
    </div>
  )
}
