import { useEffect, useRef, useState } from 'react'
import { FAQ_LIMITS, type FaqItem } from '../../shared/site'
import { api, ApiError } from '../api'
import { FaqPreview, PreviewFrame } from '../components/previews'
import { Button, Spinner, inputClass, type ToastData } from '../components/ui'
import { useLeaveGuard } from '../lib/nav'

type Row = FaqItem & { id: number }
let nextId = 1
const withId = (item: FaqItem): Row => ({ ...item, id: nextId++ })

/** Botón chico de ícono (subir, bajar, borrar). */
function IconButton({ label, onClick, disabled, children, tone = 'default' }: { label: string; onClick: () => void; disabled?: boolean; children: string; tone?: 'default' | 'danger' }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className={`grid size-9 place-items-center rounded-full text-sm font-bold ring-1 transition disabled:opacity-30 ${tone === 'danger' ? 'text-red-700 ring-red-200 hover:bg-red-50' : 'text-brand-deep ring-brand-deep/15 hover:bg-brand-deep/5'}`}
    >
      {children}
    </button>
  )
}

/** Preguntas frecuentes del inicio: agregar, editar, ordenar y borrar, con vista previa. */
export function Faq({ notify }: { notify: (t: ToastData) => void }) {
  const [rows, setRows] = useState<Row[] | null>(null)
  const [version, setVersion] = useState('')
  const [loadError, setLoadError] = useState('')
  const [dirty, setDirty] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [focus, setFocus] = useState<number | null>(0)
  const focusNew = useRef(false)

  useLeaveGuard(dirty)

  useEffect(() => {
    api
      .faq()
      .then((r) => {
        setRows(r.data.map(withId))
        setVersion(r.version)
      })
      .catch((e) => setLoadError(e instanceof ApiError ? e.message : 'No se pudieron cargar las preguntas.'))
  }, [])

  // Al agregar una pregunta, el cursor va directo a escribirla
  useEffect(() => {
    if (!focusNew.current || !rows) return
    focusNew.current = false
    document.getElementById(`q-${rows[rows.length - 1].id}`)?.focus()
  }, [rows])

  const change = (fn: (r: Row[]) => Row[]) => {
    setDirty(true)
    setError('')
    setRows((r) => (r ? fn(r) : r))
  }
  const edit = (id: number, patch: Partial<FaqItem>) => change((r) => r.map((row) => (row.id === id ? { ...row, ...patch } : row)))
  const move = (i: number, dir: -1 | 1) =>
    change((r) => {
      const next = [...r]
      ;[next[i], next[i + dir]] = [next[i + dir], next[i]]
      setFocus(i + dir)
      return next
    })
  const remove = (i: number) => change((r) => r.filter((_, k) => k !== i))
  const add = () => {
    focusNew.current = true
    change((r) => [...r, withId({ q: '', a: '' })])
    setFocus(rows?.length ?? 0)
  }

  const save = async () => {
    if (!rows) return
    setSaving(true)
    setError('')
    try {
      const data = rows.map(({ q, a }) => ({ q, a }))
      const r = await api.saveFaq(data, version)
      setVersion(r.version)
      setRows((current) => current?.filter((row) => row.q.trim() || row.a.trim()) ?? null)
      setDirty(false)
      notify({ tone: 'ok', title: 'Preguntas guardadas', text: 'La web se actualiza sola en 1 o 2 minutos.' })
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'No se pudo guardar. Revisá tu conexión y probá de nuevo.')
    } finally {
      setSaving(false)
    }
  }

  if (loadError) return <p className="rounded-3xl bg-white p-10 text-center font-bold text-brand-deep ring-1 ring-brand-deep/10">{loadError}</p>
  if (!rows) {
    return (
      <div className="grid place-items-center py-24 text-brand-deep">
        <Spinner className="size-6" />
      </div>
    )
  }

  const full = rows.length >= FAQ_LIMITS.items
  const saveButton = (
    <Button onClick={save} disabled={saving || !dirty} className="w-full py-3">
      {saving && <Spinner />}
      {saving ? 'Guardando…' : 'Guardar preguntas'}
    </Button>
  )
  const errorBox = error && (
    <p role="alert" className="rounded-xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
      {error}
    </p>
  )

  return (
    <div className="flex flex-col gap-6 max-lg:pb-24">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-brand-deep sm:text-4xl">Preguntas frecuentes</h1>
          <p className="mt-1 text-sm font-semibold text-brand-night/60">
            {rows.length} pregunta{rows.length === 1 ? '' : 's'} · Lo ideal: entre 5 y 8, las dudas reales que frenan a un cliente.
          </p>
        </div>
        <p className="text-sm font-semibold text-brand-night/50">{dirty ? 'Cambios sin guardar' : 'Sin cambios'}</p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="flex flex-col gap-3 lg:col-span-7">
          {rows.map((row, i) => (
            <section
              key={row.id}
              onFocusCapture={() => setFocus(i)}
              aria-label={`Pregunta ${i + 1}`}
              className={`flex flex-col gap-3 rounded-2xl bg-white p-4 ring-1 transition sm:p-5 ${focus === i ? 'ring-2 ring-brand-signal' : 'ring-brand-deep/10'}`}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="grid size-7 place-items-center rounded-full bg-brand-deep text-xs font-black text-white">{i + 1}</span>
                <div className="flex gap-1.5">
                  <IconButton label="Subir" onClick={() => move(i, -1)} disabled={i === 0}>
                    ↑
                  </IconButton>
                  <IconButton label="Bajar" onClick={() => move(i, 1)} disabled={i === rows.length - 1}>
                    ↓
                  </IconButton>
                  <IconButton label={`Borrar la pregunta ${i + 1}`} onClick={() => remove(i)} tone="danger">
                    ✕
                  </IconButton>
                </div>
              </div>
              <label className="flex flex-col gap-1.5">
                <span className="flex justify-between text-sm font-bold text-brand-deep">
                  Pregunta
                  <span className={`text-xs font-semibold tabular-nums ${row.q.length > FAQ_LIMITS.q ? 'text-red-700' : 'text-brand-night/45'}`}>
                    {row.q.length}/{FAQ_LIMITS.q}
                  </span>
                </span>
                <input id={`q-${row.id}`} value={row.q} onChange={(e) => edit(row.id, { q: e.target.value })} className={`${inputClass} font-bold`} placeholder="Ej.: ¿Trabajan con negocios de otras provincias?" />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="flex justify-between text-sm font-bold text-brand-deep">
                  Respuesta
                  <span className={`text-xs font-semibold tabular-nums ${row.a.length > FAQ_LIMITS.a ? 'text-red-700' : 'text-brand-night/45'}`}>
                    {row.a.length}/{FAQ_LIMITS.a}
                  </span>
                </span>
                <textarea value={row.a} rows={3} onChange={(e) => edit(row.id, { a: e.target.value })} className={`${inputClass} resize-y`} placeholder="Respuesta corta y concreta: 1 a 3 oraciones." />
              </label>
            </section>
          ))}

          <button
            type="button"
            onClick={add}
            disabled={full}
            className="rounded-2xl border-2 border-dashed border-brand-deep/20 p-5 text-sm font-bold text-brand-deep transition hover:border-brand-signal hover:text-brand-signal disabled:opacity-40"
          >
            {full ? `Máximo ${FAQ_LIMITS.items} preguntas` : '+ Agregar pregunta'}
          </button>

          <div className="hidden flex-col gap-3 lg:flex">
            {errorBox}
            {saveButton}
          </div>
        </div>

        <aside className="flex flex-col gap-3 lg:sticky lg:top-24 lg:col-span-5 lg:self-start" aria-label="Vista previa">
          <PreviewFrame path="/#preguntas">
            <FaqPreview items={rows} focus={focus} />
          </PreviewFrame>
          <p className="text-xs leading-relaxed text-brand-night/55">Google también lee estas preguntas y a veces las muestra directamente en los resultados.</p>
        </aside>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 flex flex-col gap-3 border-t border-brand-deep/10 bg-white/95 p-4 backdrop-blur lg:hidden">
        {errorBox}
        {saveButton}
      </div>
    </div>
  )
}
