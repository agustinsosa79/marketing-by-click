import { useState } from 'react'
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

const rowLabel = (row: number) => C.rows[row] ?? C.rows[C.rows.length - 1]

/**
 * Celular: una tabla de tres columnas no entra, así que se elige el plan con un selector y se ve su ficha
 * completa (mismas filas que la tabla). Al cambiar de plan, las filas quedan en el mismo lugar para comparar.
 */
function MobileCompare() {
  const [active, setActive] = useState(PLANS.findIndex((p) => p.featured) >= 0 ? PLANS.findIndex((p) => p.featured) : 0)
  const p = PLANS[active]
  const highlightTitle = PLANS.find((x) => x.highlight)?.highlight?.title
  return (
    <div className="flex flex-col gap-4 md:hidden">
      <div role="tablist" aria-label={C.label} className="grid grid-cols-3 gap-1 rounded-full bg-brand-mist p-1">
        {PLANS.map((x, i) => (
          <button
            key={x.id}
            type="button"
            role="tab"
            aria-selected={i === active}
            onClick={() => setActive(i)}
            className={`rounded-full px-2 py-2.5 text-sm font-bold transition-colors ${i === active ? HEAD[x.tone] : 'text-brand-deep'}`}
          >
            {x.name}
          </button>
        ))}
      </div>
      <div role="tabpanel" className="overflow-hidden rounded-3xl bg-brand-mist">
        <div className={`flex items-center justify-between gap-3 px-5 py-4 ${HEAD[p.tone]}`}>
          <span className="font-label text-label">{p.name}</span>
          {p.featured && <span className="rounded-full bg-brand-signal px-2 py-0.5 text-xs font-bold text-brand-ink">{planes.badge}</span>}
        </div>
        <dl className="flex flex-col px-5">
          <div className="flex items-baseline justify-between gap-4 py-4">
            <dt className="text-sm font-bold text-brand-deep">{C.price}</dt>
            <dd>
              <span className="font-display text-4xl">{p.price}</span> <span className="text-sm font-bold text-brand-night/70">{planes.currency}</span>
            </dd>
          </div>
          {Array.from({ length: ROWS }, (_, row) => (
            <div key={row} className="flex flex-col gap-1 border-t border-brand-deep/10 py-3.5">
              <dt className="text-sm font-bold text-brand-deep">{rowLabel(row)}</dt>
              <dd className="font-medium">{p.features[row] ?? <span className="text-brand-night/40">{C.none}</span>}</dd>
            </div>
          ))}
          {highlightTitle && (
            <div className="flex items-center justify-between gap-4 border-t border-brand-deep/10 py-3.5">
              <dt className="text-sm font-bold text-brand-deep">{highlightTitle}</dt>
              <dd>
                {p.highlight ? (
                  <span className="grid size-7 place-items-center rounded-full bg-brand-signal text-brand-ink">
                    <Check className="size-3.5" />
                  </span>
                ) : (
                  <span className="text-brand-night/40">{C.none}</span>
                )}
              </dd>
            </div>
          )}
        </dl>
      </div>
    </div>
  )
}

/** Comparación de los tres planes (va dentro de una ventana que se abre desde Planes): tabla en pantallas anchas. */
export function PlanCompare() {
  return (
    <div className="flex flex-col gap-6">
      <MobileCompare />
      <div className="hidden md:block">
        <table className="w-full border-separate border-spacing-x-2 text-left">
          <thead>
            <tr>
              <th scope="col" className="bg-white">
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
              <th scope="row" className="bg-white py-3 pr-3 text-sm font-bold text-brand-deep">
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
                <th scope="row" className="bg-white py-3 pr-3 text-sm font-bold text-brand-deep">
                  {rowLabel(row)}
                </th>
                {PLANS.map((p) => (
                  <td key={p.id} className="border-t border-brand-deep/10 bg-brand-mist px-4 py-3 align-top font-medium">
                    {p.features[row] ?? <span className="text-brand-night/40">{C.none}</span>}
                  </td>
                ))}
              </tr>
            ))}
            <tr>
              <th scope="row" className="bg-white py-3 pr-3 text-sm font-bold text-brand-deep">
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
