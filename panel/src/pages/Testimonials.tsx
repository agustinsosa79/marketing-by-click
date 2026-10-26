import { useEffect, useRef, useState } from 'react'
import { slugify } from '../../shared/blog'
import { TESTIMONIAL_LIMITS as TL, type TestimonialItem } from '../../shared/site'
import { api, ApiError, mediaSrc } from '../api'
import { Button, Field, MobileSaveBar, Spinner, inputClass, type ToastData } from '../components/ui'
import { prepareImage } from '../lib/image'
import { useLeaveGuard } from '../lib/nav'
import { useSnapshot } from '../lib/snapshot'

type Row = TestimonialItem & { id: number; preview?: string }
let nextId = 1
const withId = (item: TestimonialItem): Row => ({ ...item, id: nextId++ })
const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join('') || '?'

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

/** Cómo se ve en la web (tarjeta blanca sobre el azul noche de Proyectos). */
function Preview({ row }: { row: Row }) {
  const photo = row.preview ?? (row.photo ? mediaSrc(row.photo.src) : '')
  return (
    <figure className="flex flex-col gap-3 rounded-3xl bg-white p-4 text-brand-night shadow-soft">
      <span aria-hidden="true" className="font-display text-4xl leading-none text-brand-deep">
        “
      </span>
      <blockquote className="text-sm leading-relaxed">“{row.text.trim().replace(/^["“”«»]+|["“”«»]+$/g, '') || 'El texto del testimonio va acá.'}”</blockquote>
      <figcaption className="flex items-center gap-2.5 border-t border-brand-deep/10 pt-3">
        {photo ? (
          <img src={photo} alt="" className="size-10 rounded-full object-cover" />
        ) : (
          <span className="grid size-10 place-items-center rounded-full bg-brand-paper text-sm font-bold text-brand-deep">{initials(row.name)}</span>
        )}
        <span className="leading-tight">
          <span className="block text-sm font-bold">{row.name || 'Nombre'}</span>
          <span className="block text-xs text-brand-night/60">{row.role || 'Descripción'}</span>
        </span>
      </figcaption>
    </figure>
  )
}

/** Testimonios (debajo de los proyectos en el inicio): agregar, editar, ordenar, borrar y foto opcional. */
export function Testimonials({ notify }: { notify: (t: ToastData) => void }) {
  const [rows, setRows] = useState<Row[] | null>(null)
  const [version, setVersion] = useState('')
  const [loadError, setLoadError] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  // fotos nuevas (todavía no guardadas): nombre → base64
  const pending = useRef(new Map<string, string>())
  const focusNew = useRef(false)

  const { dirty, markSaved } = useSnapshot(rows, (r) => r.map(({ name, role, text, photo }) => ({ name, role, text, photo })))
  useLeaveGuard(dirty)

  useEffect(() => {
    api
      .testimonials()
      .then((r) => {
        setRows(r.data.map(withId))
        setVersion(r.version)
      })
      .catch((e) => setLoadError(e instanceof ApiError ? e.message : 'No se pudieron cargar los testimonios.'))
  }, [])

  useEffect(() => {
    if (!focusNew.current || !rows) return
    focusNew.current = false
    document.getElementById(`t-name-${rows[rows.length - 1].id}`)?.focus()
  }, [rows])

  const change = (fn: (r: Row[]) => Row[]) => {
    setError('')
    setRows((r) => (r ? fn(r) : r))
  }
  const edit = (id: number, patch: Partial<Row>) => change((r) => r.map((row) => (row.id === id ? { ...row, ...patch } : row)))
  const move = (i: number, dir: -1 | 1) =>
    change((r) => {
      const next = [...r]
      ;[next[i], next[i + dir]] = [next[i + dir], next[i]]
      return next
    })
  const remove = (i: number) => change((r) => r.filter((_, k) => k !== i))
  const add = () => {
    focusNew.current = true
    change((r) => [...r, withId({ name: '', role: '', text: '', photo: null })])
  }

  const pickPhoto = async (row: Row, file: File | undefined) => {
    if (!file) return
    try {
      const img = await prepareImage(file, `testimonio-${slugify(row.name) || 'foto'}`, 320)
      pending.current.set(img.name, img.base64)
      edit(row.id, { photo: { src: `/media/testimonios/${img.name}`, alt: row.name }, preview: img.url })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo cargar la foto.')
    }
  }

  const save = async () => {
    if (!rows) return
    setSaving(true)
    setError('')
    try {
      const data = rows.map(({ name, role, text, photo }) => ({ name, role, text, photo: photo ? { ...photo, alt: name } : null }))
      const used = new Set(data.map((d) => d.photo?.src.split('/').pop()).filter(Boolean))
      const photos = [...pending.current].filter(([name]) => used.has(name)).map(([name, base64]) => ({ name, base64 }))
      const r = await api.saveTestimonials(data, version, photos)
      setVersion(r.version)
      pending.current.clear()
      const kept = rows.filter((row) => row.name.trim() || row.text.trim() || row.role.trim())
      setRows(kept)
      markSaved(kept)
      notify({ tone: 'ok', title: 'Testimonios guardados', text: 'La web se actualiza sola en 1 o 2 minutos.' })
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

  const full = rows.length >= TL.items
  const saveButton = (
    <Button onClick={save} disabled={saving || !dirty} className="w-full py-3">
      {saving && <Spinner />}
      {saving ? 'Guardando…' : dirty ? 'Guardar testimonios' : 'Sin cambios'}
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
          <h1 className="text-3xl font-extrabold tracking-tight text-brand-deep sm:text-4xl">Testimonios</h1>
          <p className="mt-1 text-sm font-semibold text-brand-night/60">Hasta 4 reseñas. Se ven en el inicio, debajo de los proyectos. Podés agregar, editar, ordenar o borrar.</p>
        </div>
        <p className="text-sm font-semibold text-brand-night/50">{dirty ? 'Cambios sin guardar' : 'Sin cambios'}</p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="flex flex-col gap-4">
          {rows.length === 0 && <p className="rounded-2xl bg-white p-6 text-center text-sm text-brand-night/60 ring-1 ring-brand-deep/10">Todavía no hay testimonios. Mientras no haya ninguno, la web no muestra la sección.</p>}
          {rows.map((row, i) => {
            const photo = row.preview ?? (row.photo ? mediaSrc(row.photo.src) : '')
            return (
              <section key={row.id} aria-label={`Testimonio ${i + 1}`} className="flex flex-col gap-4 rounded-2xl bg-white p-4 ring-1 ring-brand-deep/10 sm:p-5">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs font-black text-brand-night/40">#{i + 1}</span>
                  <div className="flex gap-1.5">
                    <IconButton label="Subir" onClick={() => move(i, -1)} disabled={i === 0}>
                      ↑
                    </IconButton>
                    <IconButton label="Bajar" onClick={() => move(i, 1)} disabled={i === rows.length - 1}>
                      ↓
                    </IconButton>
                    <IconButton label={`Borrar testimonio ${i + 1}`} onClick={() => remove(i)} tone="danger">
                      ×
                    </IconButton>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="Nombre" htmlFor={`t-name-${row.id}`}>
                    <input id={`t-name-${row.id}`} value={row.name} maxLength={TL.name.max} onChange={(e) => edit(row.id, { name: e.target.value })} className={inputClass} placeholder="Ej.: Jael Queipo" />
                  </Field>
                  <Field label="Quién es" htmlFor={`t-role-${row.id}`} hint="Opcional. Ej.: Influencer, dueña de…">
                    <input id={`t-role-${row.id}`} value={row.role} maxLength={TL.role.max} onChange={(e) => edit(row.id, { role: e.target.value })} className={inputClass} />
                  </Field>
                </div>
                <Field label="Testimonio" htmlFor={`t-text-${row.id}`} count={row.text.length} ideal={[TL.text.min, 250]} hint="Sin comillas: la web las agrega sola.">
                  <textarea id={`t-text-${row.id}`} rows={3} value={row.text} maxLength={TL.text.max} onChange={(e) => edit(row.id, { text: e.target.value })} className={`${inputClass} min-h-24 resize-y`} />
                </Field>
                <div className="flex flex-wrap items-center gap-3">
                  {photo ? (
                    <img src={photo} alt="" className="size-14 rounded-full object-cover ring-1 ring-brand-deep/10" />
                  ) : (
                    <span className="grid size-14 place-items-center rounded-full bg-brand-paper font-bold text-brand-deep">{initials(row.name)}</span>
                  )}
                  <label className="cursor-pointer rounded-full px-4 py-2 text-sm font-bold text-brand-deep ring-1 ring-brand-deep/15 hover:ring-brand-deep/40">
                    {photo ? 'Cambiar foto' : 'Subir foto (opcional)'}
                    <input type="file" accept="image/*" className="sr-only" onChange={(e) => pickPhoto(row, e.target.files?.[0])} />
                  </label>
                  {photo && (
                    <button type="button" onClick={() => edit(row.id, { photo: null, preview: undefined })} className="rounded-full px-3 py-2 text-sm font-bold text-red-700 hover:bg-red-50">
                      Quitar foto
                    </button>
                  )}
                  {!photo && <span className="text-xs text-brand-night/50">Sin foto se muestran las iniciales.</span>}
                </div>
              </section>
            )
          })}
          <button
            type="button"
            onClick={add}
            disabled={full}
            className="rounded-2xl border-2 border-dashed border-brand-deep/20 p-5 text-sm font-bold text-brand-deep transition hover:border-brand-deep hover:text-brand-ember disabled:opacity-40"
          >
            {full ? `Máximo ${TL.items} testimonios` : '+ Agregar testimonio'}
          </button>
        </div>

        <aside className="flex flex-col gap-4 lg:sticky lg:top-24 lg:self-start">
          <p className="text-xs font-bold tracking-widest text-brand-deep/60 uppercase">Vista previa</p>
          <div className="flex flex-col gap-3 rounded-3xl bg-brand-night p-4">
            {rows.slice(0, 3).map((row) => (
              <Preview key={row.id} row={row} />
            ))}
            {rows.length === 0 && <p className="text-sm text-brand-haze">Sin testimonios.</p>}
          </div>
          <div className="flex flex-col gap-3 max-lg:hidden">
            {errorBox}
            {saveButton}
          </div>
        </aside>
      </div>

      <MobileSaveBar show={dirty || saving || Boolean(error)}>
        {errorBox}
        {saveButton}
      </MobileSaveBar>
    </div>
  )
}
