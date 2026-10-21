import { useEffect, useMemo, useState } from 'react'
import type { PricesInput } from '../../shared/site'
import { cleanTexts, fieldError, LOCKED_REASON, TEXT_FIELDS, TEXT_SECTIONS, type TextField, type TextSection, type TextValue, type TextValues } from '../../shared/texts'
import { api, ApiError } from '../api'
import { PreviewFrame } from '../components/previews'
import { TextSectionPreview } from '../components/textPreviews'
import { Button, MobileSaveBar, Spinner, inputClass, type ToastData } from '../components/ui'
import { ask } from '../lib/dialog'
import { useLeaveGuard } from '../lib/nav'
import { useSnapshot } from '../lib/snapshot'
import { textReader } from '../lib/texts'

const same = (a: TextValue, b: TextValue) => JSON.stringify(a) === JSON.stringify(b)
const valueOf = (values: TextValues, field: TextField): TextValue => values[field.key] ?? field.default
const isModified = (values: TextValues, field: TextField) => !same(valueOf(values, field), field.default)
const fieldsOf = (section: TextSection) => section.groups.flatMap((g) => g.fields)

const Lock = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className="size-4 shrink-0 fill-none stroke-current stroke-2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="5" y="11" width="14" height="9" rx="2" />
    <path d="M8 11V8a4 4 0 0 1 8 0v3" />
  </svg>
)

/** Contador de caracteres: ámbar fuera del rango permitido. */
function Counter({ length, min, max }: { length: number; min: number; max: number }) {
  const ok = length === 0 || (length >= min && length <= max)
  return <span className={`text-xs font-semibold tabular-nums ${ok ? 'text-brand-night/45' : 'text-amber-700'}`}>{`${length}/${max}`}</span>
}

const smallBtn = 'grid size-8 shrink-0 place-items-center rounded-full text-sm font-bold ring-1 transition disabled:opacity-25'

interface FieldProps {
  field: TextField
  value: TextValue
  onChange: (value: TextValue) => void
  onRestore: () => void
}

/** Un campo editable: texto, párrafo o lista. Muestra el original y permite volver a él. */
function TextFieldEditor({ field, value, onChange, onRestore }: FieldProps) {
  const modified = !same(value, field.default)
  const error = fieldError(field, value)
  const id = `t-${field.key}`

  const header = (
    <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
      <label htmlFor={field.kind === 'list' ? undefined : id} className="flex items-center gap-2 text-sm font-bold text-brand-deep">
        {field.label}
        {modified && <span className="rounded-full bg-brand-signal/10 px-2 py-0.5 text-[0.65rem] font-bold text-brand-ember">Editado</span>}
      </label>
      <div className="flex items-center gap-3">
        {modified && (
          <button type="button" onClick={onRestore} className="text-xs font-bold text-brand-deep underline-offset-2 hover:text-brand-ember hover:underline">
            Restaurar original
          </button>
        )}
        {field.kind !== 'list' && <Counter length={String(value).trim().length} min={field.min} max={field.max} />}
      </div>
    </div>
  )

  let input
  if (field.kind === 'list') {
    const items = Array.isArray(value) ? value : []
    const set = (next: string[]) => onChange(next)
    const move = (i: number, d: -1 | 1) => {
      const next = [...items]
      ;[next[i], next[i + d]] = [next[i + d], next[i]]
      set(next)
    }
    input = (
      <div className="flex flex-col gap-2">
        {items.map((item, i) => (
          // celular: el texto ocupa todo el ancho y los controles van en una fila debajo
          <div key={i} className="flex flex-col gap-1.5 rounded-2xl max-sm:bg-brand-paper max-sm:p-2 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              {/* una sola línea de texto, pero crece hacia abajo para que se lea completo (Enter no corta línea) */}
              <textarea
                rows={1}
                aria-label={`${field.label}, ítem ${i + 1}`}
                value={item}
                maxLength={field.itemMax + 20}
                onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()}
                onChange={(e) => set(items.map((x, k) => (k === i ? e.target.value.replace(/\s*\n\s*/g, ' ') : x)))}
                className={`${inputClass} block resize-none py-2.5 field-sizing-content sm:pr-14`}
              />
              <span className="absolute top-1/2 right-3 hidden -translate-y-1/2 sm:block">
                <Counter length={item.trim().length} min={field.itemMin} max={field.itemMax} />
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="mr-auto pl-1 sm:hidden">
                <Counter length={item.trim().length} min={field.itemMin} max={field.itemMax} />
              </span>
            <button type="button" aria-label="Subir" disabled={i === 0} onClick={() => move(i, -1)} className={`${smallBtn} text-brand-deep ring-brand-deep/15 hover:bg-brand-deep/5`}>
              ↑
            </button>
            <button type="button" aria-label="Bajar" disabled={i === items.length - 1} onClick={() => move(i, 1)} className={`${smallBtn} text-brand-deep ring-brand-deep/15 hover:bg-brand-deep/5`}>
              ↓
            </button>
            <button
              type="button"
              aria-label={`Quitar el ítem ${i + 1}`}
              disabled={items.length <= field.minItems}
              onClick={() => set(items.filter((_, k) => k !== i))}
              className={`${smallBtn} text-red-700 ring-red-200 hover:bg-red-50`}
            >
              ✕
            </button>
            </div>
          </div>
        ))}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <button
            type="button"
            disabled={items.length >= field.maxItems}
            onClick={() => set([...items, ''])}
            className="rounded-full border-2 border-dashed border-brand-deep/20 px-4 py-2 text-sm font-bold text-brand-deep transition hover:border-brand-signal hover:text-brand-ember disabled:opacity-40"
          >
            + Agregar ítem
          </button>
          <span className="text-xs text-brand-night/50">
            Entre {field.minItems} y {field.maxItems} ítems
          </span>
        </div>
      </div>
    )
  } else {
    const common = { id, value: String(value), onChange: (e: { target: { value: string } }) => onChange(e.target.value), 'aria-invalid': Boolean(error) }
    input = field.kind === 'textarea' ? <textarea rows={2} {...common} className={`${inputClass} min-h-20 resize-y field-sizing-content`} /> : <input {...common} className={inputClass} />
  }

  return (
    <div className="flex flex-col gap-1.5">
      {header}
      {input}
      {error ? (
        <p className="text-xs font-semibold text-amber-700">{error}</p>
      ) : (
        field.hint && <p className="text-xs leading-relaxed text-brand-night/55">{field.hint}</p>
      )}
      {modified && field.kind !== 'list' && <p className="text-xs leading-relaxed text-brand-night/45">Original: “{field.default}”</p>}
    </div>
  )
}

/** Textos de la web: todo lo editable por sección, con vista previa. Los textos que pesan para Google, bloqueados. */
export function Texts({ notify }: { notify: (t: ToastData) => void }) {
  const [values, setValues] = useState<TextValues | null>(null)
  const [version, setVersion] = useState('')
  const [prices, setPrices] = useState<PricesInput | null>(null)
  const [loadError, setLoadError] = useState('')
  const [sectionId, setSectionId] = useState(TEXT_SECTIONS[1].id)
  const [group, setGroup] = useState(0)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // lo que difiere del original, en orden fijo: restaurar un texto o escribirlo igual que el original no es un cambio
  const { dirty, markSaved } = useSnapshot(values, (v) =>
    Object.entries(v)
      .filter(([k, val]) => TEXT_FIELDS[k] && !same(val, TEXT_FIELDS[k].default))
      .sort(([a], [b]) => a.localeCompare(b)),
  )
  useLeaveGuard(dirty)

  useEffect(() => {
    api
      .texts()
      .then((r) => {
        setValues(r.data)
        setVersion(r.version)
      })
      .catch((e) => setLoadError(e instanceof ApiError ? e.message : 'No se pudieron cargar los textos.'))
    api.prices().then((r) => setPrices(r.data), () => {})
  }, [])

  const section = TEXT_SECTIONS.find((s) => s.id === sectionId) ?? TEXT_SECTIONS[0]
  const reader = useMemo(() => textReader(values ?? {}, prices), [values, prices])
  const invalid = useMemo(() => (values ? cleanTexts(values).errors : []), [values])

  const change = (key: string, value: TextValue | undefined) => {
    setError('')
    setValues((v) => {
      const next = { ...(v ?? {}) }
      if (value === undefined) delete next[key]
      else next[key] = value
      return next
    })
  }

  const openSection = (id: string) => {
    setSectionId(id)
    setGroup(0)
  }

  const restoreSection = async () => {
    if (!values) return
    const ok = await ask({
      title: `¿Volver a los textos originales de ${section.label}?`,
      text: 'Se descartan todos los cambios de esta sección. Se publica recién cuando toques “Guardar textos”.',
      confirmLabel: 'Restaurar originales',
      tone: 'danger',
    })
    if (!ok) return
    setValues((v) => {
      const next = { ...(v ?? {}) }
      for (const f of fieldsOf(section)) delete next[f.key]
      return next
    })
  }

  const save = async () => {
    if (!values) return
    if (invalid.length) {
      const first = invalid[0]
      const owner = TEXT_SECTIONS.find((s) => fieldsOf(s).some((f) => f.key === first.key))
      if (owner) openSection(owner.id)
      setError(`«${TEXT_FIELDS[first.key]?.label}» en ${owner?.label}: ${first.message}`)
      return
    }
    setSaving(true)
    setError('')
    try {
      const r = await api.saveTexts(values, version)
      setVersion(r.version)
      const clean = cleanTexts(values).values
      setValues(clean)
      markSaved(clean)
      notify({ tone: 'ok', title: 'Textos guardados', text: 'La web se actualiza sola en 1 o 2 minutos.' })
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'No se pudo guardar. Revisá tu conexión y probá de nuevo.')
    } finally {
      setSaving(false)
    }
  }

  if (loadError) return <p className="rounded-3xl bg-white p-10 text-center font-bold text-brand-deep ring-1 ring-brand-deep/10">{loadError}</p>
  if (!values) {
    return (
      <div className="grid place-items-center py-24 text-brand-deep">
        <Spinner className="size-6" />
      </div>
    )
  }

  const editedIn = (s: TextSection) => fieldsOf(s).filter((f) => isModified(values, f)).length
  const totalEdited = TEXT_SECTIONS.reduce((n, s) => n + editedIn(s), 0)
  const errorBox = error && (
    <p role="alert" className="rounded-xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
      {error}
    </p>
  )
  const saveButton = (
    <Button onClick={save} disabled={saving || !dirty} className="w-full py-3">
      {saving && <Spinner />}
      {saving ? 'Guardando…' : dirty ? 'Guardar textos' : 'Sin cambios'}
    </Button>
  )

  return (
    <div className="flex flex-col gap-6 max-lg:pb-24">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-brand-deep sm:text-4xl">Textos de la web</h1>
          <p className="mt-1 max-w-2xl text-sm font-semibold text-brand-night/60">
            {totalEdited ? `${totalEdited} texto${totalEdited === 1 ? '' : 's'} distinto${totalEdited === 1 ? '' : 's'} del original.` : 'Todos los textos están como el original.'} Los títulos y lo que usa Google aparecen bloqueados.
          </p>
        </div>
        <p className="text-sm font-semibold text-brand-night/50">{dirty ? 'Cambios sin guardar' : 'Sin cambios'}</p>
      </div>

      {/* Secciones: lista en computadora y tablet, selector en el celular */}
      <label className="flex flex-col gap-1.5 md:hidden">
        <span className="text-sm font-bold text-brand-deep">Sección de la web</span>
        <select value={sectionId} onChange={(e) => openSection(e.target.value)} className={`${inputClass} font-bold text-brand-deep`}>
          {TEXT_SECTIONS.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
              {editedIn(s) ? ` · ${editedIn(s)} editado${editedIn(s) === 1 ? '' : 's'}` : ''}
            </option>
          ))}
        </select>
      </label>
      <nav aria-label="Secciones de la web" className="hidden flex-wrap gap-2 md:flex">
        {TEXT_SECTIONS.map((s) => {
          const on = s.id === sectionId
          const n = editedIn(s)
          return (
            <button
              key={s.id}
              type="button"
              aria-pressed={on}
              onClick={() => openSection(s.id)}
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold ring-1 transition ${on ? 'bg-brand-deep text-white ring-brand-deep' : 'bg-white text-brand-deep ring-brand-deep/15 hover:ring-brand-deep/40'}`}
            >
              {s.groups.length === 0 && <Lock />}
              {s.label}
              {n > 0 && <span className={`rounded-full px-1.5 text-xs ${on ? 'bg-white/20' : 'bg-brand-signal/10 text-brand-ember'}`}>{n}</span>}
            </button>
          )
        })}
      </nav>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="flex flex-col gap-5 lg:col-span-7">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <p className="max-w-xl text-sm leading-relaxed text-brand-night/65">{section.intro}</p>
            {editedIn(section) > 0 && (
              <button type="button" onClick={restoreSection} className="shrink-0 text-sm font-bold text-red-700 hover:underline">
                Restaurar originales de la sección
              </button>
            )}
          </div>

          {/* Bloqueado: se ve, pero no se edita */}
          <section aria-label="Textos bloqueados" className="flex flex-col gap-3 rounded-2xl bg-brand-deep/5 p-4 ring-1 ring-brand-deep/10 sm:p-5">
            <p className="flex items-center gap-2 text-sm font-bold text-brand-deep">
              <Lock />
              Bloqueado
            </p>
            <ul className="flex flex-col gap-2.5">
              {section.locked.map((l) => (
                <li key={l.label} className="text-sm">
                  <span className="font-bold text-brand-night/70">{l.label}: </span>
                  <span className="text-brand-night/55">{l.value}</span>
                  <span className="block text-xs text-brand-night/45">{l.reason ?? LOCKED_REASON}</span>
                </li>
              ))}
            </ul>
          </section>

          {section.groups.map((g, gi) => (
            <section
              key={`${section.id}-${gi}`}
              onFocusCapture={() => setGroup(gi)}
              aria-label={g.title ?? section.label}
              className={`flex flex-col gap-5 rounded-2xl bg-white p-4 ring-1 transition sm:p-5 ${group === gi ? 'ring-2 ring-brand-signal/40' : 'ring-brand-deep/10'}`}
            >
              {g.title && <h2 className="text-lg font-extrabold text-brand-deep">{g.title}</h2>}
              {g.fields.map((f) => (
                <TextFieldEditor key={f.key} field={f} value={valueOf(values, f)} onChange={(v) => change(f.key, v)} onRestore={() => change(f.key, undefined)} />
              ))}
            </section>
          ))}

          <div className="hidden flex-col gap-3 lg:flex">
            {errorBox}
            {saveButton}
          </div>
        </div>

        <aside className="flex flex-col gap-3 lg:sticky lg:top-24 lg:col-span-5 lg:self-start" aria-label="Vista previa">
          <PreviewFrame path={section.path}>
            <TextSectionPreview id={section.id} tx={reader} prices={prices} group={group} />
          </PreviewFrame>
          <p className="text-xs leading-relaxed text-brand-night/55">La vista previa muestra la parte que estás editando. Si dejás un campo vacío, la web usa el texto original.</p>
        </aside>
      </div>

      <MobileSaveBar show={dirty || saving || Boolean(error)}>
        {errorBox}
        {saveButton}
      </MobileSaveBar>
    </div>
  )
}
