import { useEffect, useState } from 'react'
import { PLANS, PRICE_DETAIL_MAX, type PlanId, type PricesInput } from '../../shared/site'
import { api, ApiError } from '../api'
import { AsesoriaPreview, PlansPreview, PreviewFrame, SesionPreview } from '../components/previews'
import { Button, Field, Spinner, inputClass, type ToastData } from '../components/ui'
import { useLeaveGuard } from '../lib/nav'

type Area = 'planes' | 'asesoria' | 'sesion'

const SWATCH: Record<PlanId, string> = {
  inicial: 'bg-white ring-1 ring-brand-deep/20',
  plus: 'bg-brand-signal',
  premium: 'bg-brand-night',
}

const digits = (v: string) => v.replace(/\D/g, '').slice(0, 6)

/** Campo de precio: solo números, con la moneda al lado. */
function PriceInput({ id, value, onChange, onFocus, suffix }: { id: string; value: string; onChange: (v: string) => void; onFocus: () => void; suffix: string }) {
  return (
    <div className="flex items-center overflow-hidden rounded-xl bg-white ring-1 ring-brand-deep/15 focus-within:ring-2 focus-within:ring-brand-signal">
      <input
        id={id}
        inputMode="numeric"
        autoComplete="off"
        value={value}
        onChange={(e) => onChange(digits(e.target.value))}
        onFocus={onFocus}
        className="w-full min-w-0 bg-transparent px-4 py-3 text-2xl font-extrabold tracking-tight text-brand-deep outline-none"
        placeholder="0"
      />
      <span className="shrink-0 pr-4 text-sm font-semibold text-brand-night/55">{suffix}</span>
    </div>
  )
}

/** Precios de los planes, de la asesoría 1:1 y de la sesión de fotos, con vista previa de cómo quedan en la web. */
export function Prices({ notify }: { notify: (t: ToastData) => void }) {
  const [prices, setPrices] = useState<PricesInput | null>(null)
  const [version, setVersion] = useState('')
  const [loadError, setLoadError] = useState('')
  const [dirty, setDirty] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [area, setArea] = useState<Area>('planes')
  const [focusPlan, setFocusPlan] = useState<PlanId | null>(null)

  useLeaveGuard(dirty)

  useEffect(() => {
    api
      .prices()
      .then((r) => {
        setPrices(r.data)
        setVersion(r.version)
      })
      .catch((e) => setLoadError(e instanceof ApiError ? e.message : 'No se pudieron cargar los precios.'))
  }, [])

  const update = (fn: (p: PricesInput) => PricesInput) => {
    setDirty(true)
    setError('')
    setPrices((p) => (p ? fn(p) : p))
  }

  const save = async () => {
    if (!prices) return
    setSaving(true)
    setError('')
    try {
      const r = await api.savePrices(prices, version)
      setVersion(r.version)
      setDirty(false)
      notify({ tone: 'ok', title: 'Precios guardados', text: 'La web se actualiza sola en 1 o 2 minutos.' })
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'No se pudo guardar. Revisá tu conexión y probá de nuevo.')
    } finally {
      setSaving(false)
    }
  }

  if (loadError) return <p className="rounded-3xl bg-white p-10 text-center font-bold text-brand-deep ring-1 ring-brand-deep/10">{loadError}</p>
  if (!prices) {
    return (
      <div className="grid place-items-center py-24 text-brand-deep">
        <Spinner className="size-6" />
      </div>
    )
  }

  const tabs: { id: Area; label: string }[] = [
    { id: 'planes', label: 'Planes' },
    { id: 'asesoria', label: 'Asesoría 1:1' },
    { id: 'sesion', label: 'Sesión de fotos' },
  ]

  return (
    <div className="flex flex-col gap-6 max-lg:pb-24">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-brand-deep sm:text-4xl">Precios</h1>
          <p className="mt-1 text-sm font-semibold text-brand-night/60">En dólares. Se ven en la web 1 o 2 minutos después de guardar.</p>
        </div>
        <p className="text-sm font-semibold text-brand-night/50">{dirty ? 'Cambios sin guardar' : 'Sin cambios'}</p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="flex flex-col gap-6 lg:col-span-5">
          <section className="flex flex-col gap-4 rounded-2xl bg-white p-5 ring-1 ring-brand-deep/10" aria-labelledby="t-planes">
            <div>
              <h2 id="t-planes" className="text-lg font-extrabold text-brand-deep">
                Planes mensuales
              </h2>
              <p className="text-sm text-brand-night/60">Solo el número, sin puntos ni símbolos.</p>
            </div>
            {PLANS.map((plan) => (
              <Field key={plan.id} label={plan.id === 'plus' ? `${plan.name} · el más elegido` : plan.name} htmlFor={`p-${plan.id}`}>
                <div className="flex items-center gap-3">
                  <span aria-hidden="true" className={`size-5 shrink-0 rounded-full ${SWATCH[plan.id]}`} />
                  <div className="flex-1">
                    <PriceInput
                      id={`p-${plan.id}`}
                      value={prices.plans[plan.id]}
                      suffix="USD por mes"
                      onFocus={() => {
                        setArea('planes')
                        setFocusPlan(plan.id)
                      }}
                      onChange={(v) => update((p) => ({ ...p, plans: { ...p.plans, [plan.id]: v } }))}
                    />
                  </div>
                </div>
              </Field>
            ))}
          </section>

          <section className="flex flex-col gap-4 rounded-2xl bg-white p-5 ring-1 ring-brand-deep/10" aria-labelledby="t-asesoria">
            <div>
              <h2 id="t-asesoria" className="text-lg font-extrabold text-brand-deep">
                Asesoría 1:1
              </h2>
              <p className="text-sm text-brand-night/60">Opcional. Si lo dejás vacío, la web no muestra precio y se consulta por WhatsApp.</p>
            </div>
            <Field label="Precio" htmlFor="p-asesoria">
              <PriceInput id="p-asesoria" value={prices.asesoria.price} suffix="USD" onFocus={() => setArea('asesoria')} onChange={(v) => update((p) => ({ ...p, asesoria: { ...p.asesoria, price: v } }))} />
            </Field>
            <Field label="Detalle" htmlFor="d-asesoria" hint="Ej.: por sesión · 1 hora">
              <input
                id="d-asesoria"
                value={prices.asesoria.detail}
                maxLength={PRICE_DETAIL_MAX}
                onFocus={() => setArea('asesoria')}
                onChange={(e) => update((p) => ({ ...p, asesoria: { ...p.asesoria, detail: e.target.value } }))}
                className={inputClass}
                placeholder="por sesión"
              />
            </Field>
          </section>

          <section className="flex flex-col gap-4 rounded-2xl bg-white p-5 ring-1 ring-brand-deep/10" aria-labelledby="t-sesion">
            <div>
              <h2 id="t-sesion" className="text-lg font-extrabold text-brand-deep">
                Sesión de fotos y videos
              </h2>
              <p className="text-sm text-brand-night/60">Aparece en “También hacemos”, debajo de los planes, y en la página de Contenido.</p>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Precio" htmlFor="p-sesion">
                <PriceInput id="p-sesion" value={prices.sesion.price} suffix="USD" onFocus={() => setArea('sesion')} onChange={(v) => update((p) => ({ ...p, sesion: { ...p.sesion, price: v } }))} />
              </Field>
              <Field label="Duración" htmlFor="d-sesion">
                <input
                  id="d-sesion"
                  value={prices.sesion.detail}
                  maxLength={PRICE_DETAIL_MAX}
                  onFocus={() => setArea('sesion')}
                  onChange={(e) => update((p) => ({ ...p, sesion: { ...p.sesion, detail: e.target.value } }))}
                  className={inputClass}
                  placeholder="2 horas"
                />
              </Field>
            </div>
          </section>

          <div className="hidden flex-col gap-3 lg:flex">
            {error && (
              <p role="alert" className="rounded-xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
                {error}
              </p>
            )}
            <Button onClick={save} disabled={saving || !dirty} className="w-full py-3">
              {saving && <Spinner />}
              {saving ? 'Guardando…' : 'Guardar precios'}
            </Button>
          </div>
        </div>

        {/* Vista previa: sigue al campo que se está editando */}
        <aside className="flex flex-col gap-3 lg:sticky lg:top-24 lg:col-span-7 lg:self-start" aria-label="Vista previa">
          <div className="flex gap-1 rounded-full bg-white p-1 ring-1 ring-brand-deep/10" role="tablist" aria-label="Qué ver">
            {tabs.map((t) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={area === t.id}
                onClick={() => setArea(t.id)}
                className={`flex-1 rounded-full px-3 py-2 text-xs font-bold transition sm:text-sm ${area === t.id ? 'bg-brand-deep text-white' : 'text-brand-deep hover:bg-brand-deep/5'}`}
              >
                {t.label}
              </button>
            ))}
          </div>
          {area === 'planes' && (
            <PreviewFrame path="/#planes">
              <PlansPreview prices={prices} highlight={focusPlan} />
            </PreviewFrame>
          )}
          {area === 'asesoria' && (
            <PreviewFrame path="/#asesoria">
              <AsesoriaPreview price={prices.asesoria.price} detail={prices.asesoria.detail} currency={prices.currency} />
            </PreviewFrame>
          )}
          {area === 'sesion' && (
            <PreviewFrame path="/#servicios">
              <SesionPreview price={prices.sesion.price} detail={prices.sesion.detail} currency={prices.currency} />
            </PreviewFrame>
          )}
        </aside>
      </div>

      {/* Celular: guardar siempre a mano */}
      <div className="fixed inset-x-0 bottom-0 z-40 flex flex-col gap-3 border-t border-brand-deep/10 bg-white/95 p-4 backdrop-blur lg:hidden">
        {error && (
          <p role="alert" className="rounded-xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
            {error}
          </p>
        )}
        <Button onClick={save} disabled={saving || !dirty} className="w-full py-3">
          {saving && <Spinner />}
          {saving ? 'Guardando…' : 'Guardar precios'}
        </Button>
      </div>
    </div>
  )
}
