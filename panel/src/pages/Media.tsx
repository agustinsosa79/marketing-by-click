import { useEffect, useRef, useState } from 'react'
import { ALT_MAX, formatDuration, MEDIA_SLOTS, VIDEO_MAX_SECONDS, type MediaImage, type MediaSlot, type MediaValues, type MediaVideo } from '../../shared/media'
import { api, ApiError, mediaSrc, type SiteMediaSave } from '../api'
import { Badge, Button, Spinner, inputClass, type ToastData } from '../components/ui'
import { ask } from '../lib/dialog'
import { prepareImage, type PreparedImage } from '../lib/image'
import { useLeaveGuard } from '../lib/nav'
import { prepareVideo, type PreparedVideo } from '../lib/video'

type ImageSlot = Extract<MediaSlot, { kind: 'image' }>
type VideoSlot = Extract<MediaSlot, { kind: 'video' }>

interface CardProps<S, V> {
  slot: S
  value: V | undefined
  version: string
  onSaved: (version: string, value: V | null) => void
  onDirty: (key: string, dirty: boolean) => void
  notify: (t: ToastData) => void
}

/** Encabezado común de cada tarjeta. */
function CardHeader({ slot, changed }: { slot: MediaSlot; changed: boolean }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-lg font-extrabold text-brand-deep">{slot.label}</h2>
        <Badge tone={changed ? 'live' : 'neutral'}>{changed ? 'Cambiada' : 'Original'}</Badge>
      </div>
      <p className="text-sm font-semibold text-brand-night/70">{slot.section}</p>
      <p className="text-xs leading-relaxed text-brand-night/55">{slot.where}</p>
    </div>
  )
}

/** Elegir un archivo: botón o arrastrar. */
function Picker({ accept, label, busy, onFile }: { accept: string; label: string; busy: boolean; onFile: (f: File) => void }) {
  const input = useRef<HTMLInputElement>(null)
  const [over, setOver] = useState(false)
  return (
    <div
      onDragOver={(e) => {
        e.preventDefault()
        setOver(true)
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault()
        setOver(false)
        const f = e.dataTransfer.files[0]
        if (f) onFile(f)
      }}
      className={`flex flex-wrap items-center justify-between gap-3 rounded-2xl border-2 border-dashed p-3 transition ${over ? 'border-brand-signal bg-brand-signal/5' : 'border-brand-deep/15'}`}
    >
      <span className="text-xs text-brand-night/55">Arrastrá el archivo acá o</span>
      <Button variant="secondary" disabled={busy} onClick={() => input.current?.click()} className="py-2">
        {busy && <Spinner />}
        {label}
      </Button>
      <input
        ref={input}
        type="file"
        accept={accept}
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) onFile(f)
          e.target.value = ''
        }}
      />
    </div>
  )
}

/** Botones de publicar / descartar / restaurar. */
function Actions({ dirty, saving, changed, canSave, label, onSave, onDiscard, onRestore }: { dirty: boolean; saving: boolean; changed: boolean; canSave: boolean; label: string; onSave: () => void; onDiscard: () => void; onRestore: () => void }) {
  return (
    <div className="mt-auto flex flex-wrap items-center gap-2 border-t border-brand-deep/10 pt-4">
      {dirty && (
        <>
          <Button onClick={onSave} disabled={saving || !canSave} className="py-2.5">
            {saving && <Spinner />}
            {saving ? 'Publicando…' : label}
          </Button>
          <Button variant="ghost" onClick={onDiscard} disabled={saving}>
            Descartar
          </Button>
        </>
      )}
      {!dirty && changed && (
        <button type="button" onClick={onRestore} disabled={saving} className="text-sm font-bold text-red-700 hover:underline disabled:opacity-40">
          {saving ? 'Restaurando…' : 'Restaurar original'}
        </button>
      )}
      {!dirty && !changed && <p className="text-xs text-brand-night/50">Elegí un archivo para reemplazarla.</p>}
    </div>
  )
}

const restoreQuestion = (slot: MediaSlot) =>
  ask({
    title: `¿Volver a ${slot.kind === 'video' ? 'el video' : 'la foto'} original?`,
    text: `“${slot.label}” vuelve a ${slot.kind === 'video' ? 'ser el video' : 'ser la foto'} que tenía la web. El archivo que se había subido se borra.`,
    confirmLabel: 'Restaurar original',
    tone: 'danger',
  })

function ImageCard({ slot, value, version, onSaved, onDirty, notify }: CardProps<ImageSlot, MediaImage>) {
  const current = value ?? slot.default
  const [large, setLarge] = useState<PreparedImage | null>(null)
  const [small, setSmall] = useState<PreparedImage | null>(null)
  const [alt, setAlt] = useState(current.alt)
  const [busy, setBusy] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const dirty = Boolean(large) || alt.trim() !== current.alt
  useEffect(() => onDirty(slot.key, dirty), [dirty, slot.key, onDirty])

  const take = async (file: File) => {
    setBusy(true)
    setError('')
    try {
      const base = slot.key.replace(/[^a-z0-9]+/g, '-')
      const big = await prepareImage(file, base, slot.maxWidth)
      setLarge(big)
      setSmall(slot.smallWidth ? await prepareImage(file, `${base}-sm`, slot.smallWidth) : null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo leer la imagen.')
    } finally {
      setBusy(false)
    }
  }

  const discard = () => {
    setLarge(null)
    setSmall(null)
    setAlt(current.alt)
    setError('')
  }

  const save = async (restore = false) => {
    if (restore && !(await restoreQuestion(slot))) return
    setSaving(true)
    setError('')
    try {
      const body: SiteMediaSave = restore
        ? { key: slot.key, version, restore: true }
        : {
            key: slot.key,
            version,
            alt: alt.trim(),
            ...(large ? { width: large.width, height: large.height, files: { main: { base64: large.base64 }, ...(small ? { small: { base64: small.base64 } } : {}) } } : {}),
          }
      const r = await api.saveSiteMedia(body)
      setLarge(null)
      setSmall(null)
      setAlt(((r.value as MediaImage | null) ?? slot.default).alt)
      onSaved(r.version, r.value as MediaImage | null)
      notify({ tone: 'ok', title: restore ? 'Foto original restaurada' : 'Foto publicada', text: 'La web se actualiza sola en 1 o 2 minutos.' })
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'No se pudo guardar. Revisá tu conexión y probá de nuevo.')
    } finally {
      setSaving(false)
    }
  }

  const altError = alt.trim().length < 5 ? 'Describí la foto (mínimo 5 caracteres).' : ''
  const tooSmall = large && large.width < slot.minWidth
  const shown = large?.url ?? mediaSrc(current.src)

  return (
    <section aria-label={slot.label} className="flex flex-col gap-4 rounded-2xl bg-white p-4 ring-1 ring-brand-deep/10 sm:p-5">
      <CardHeader slot={slot} changed={Boolean(value)} />
      <div className={`flex gap-3 ${large ? 'items-end' : ''}`}>
        {large && (
          <figure className="w-2/5 shrink-0">
            <img src={mediaSrc(current.src)} alt="" className={`w-full bg-brand-paper object-cover opacity-60 ${slot.aspect} ${slot.round ? 'rounded-full' : 'rounded-xl'}`} />
            <figcaption className="mt-1 text-center text-[0.65rem] font-semibold text-brand-night/50">Actual</figcaption>
          </figure>
        )}
        <figure className={large ? 'flex-1' : 'mx-auto w-full max-w-60'}>
          <img src={shown} alt="" className={`w-full bg-brand-paper object-cover ring-1 ring-brand-deep/10 ${slot.aspect} ${slot.round ? 'rounded-full' : 'rounded-2xl'} ${large ? 'ring-2 ring-brand-signal' : ''}`} />
          {large && <figcaption className="mt-1 text-center text-[0.65rem] font-bold text-brand-signal">Nueva · {large.width}×{large.height}</figcaption>}
        </figure>
      </div>
      <p className="text-xs leading-relaxed text-brand-night/60">{slot.hint}</p>
      <Picker accept="image/*" label={large ? 'Elegir otra' : 'Cambiar foto'} busy={busy} onFile={take} />
      {tooSmall && <p className="rounded-xl bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800">La foto es chica ({large.width} px de ancho): puede verse borrosa. Lo ideal es al menos {slot.minWidth} px.</p>}
      <label className="flex flex-col gap-1.5">
        <span className="flex justify-between text-sm font-bold text-brand-deep">
          Descripción de la foto
          <span className="text-xs font-semibold text-brand-night/45 tabular-nums">
            {alt.trim().length}/{ALT_MAX}
          </span>
        </span>
        <input value={alt} maxLength={ALT_MAX} onChange={(e) => setAlt(e.target.value)} className={inputClass} />
        <span className={`text-xs ${altError ? 'font-semibold text-amber-700' : 'text-brand-night/50'}`}>{altError || 'Qué se ve. La leen Google y las personas que usan lectores de pantalla.'}</span>
      </label>
      {error && (
        <p role="alert" className="rounded-xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
          {error}
        </p>
      )}
      <Actions dirty={dirty} saving={saving} changed={Boolean(value)} canSave={!altError && !busy} label={large ? 'Publicar foto' : 'Guardar descripción'} onSave={() => save()} onDiscard={discard} onRestore={() => save(true)} />
    </section>
  )
}

function VideoCard({ slot, value, version, onSaved, onDirty, notify }: CardProps<VideoSlot, MediaVideo>) {
  const current = value ?? slot.default
  const [next, setNext] = useState<PreparedVideo | null>(null)
  const [progress, setProgress] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => onDirty(slot.key, Boolean(next)), [next, slot.key, onDirty])
  useEffect(() => () => void (next && URL.revokeObjectURL(next.url)), [next])

  const take = async (file: File) => {
    setError('')
    setNext(null)
    setProgress(0)
    try {
      setNext(await prepareVideo(file, setProgress))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo preparar el video.')
    } finally {
      setProgress(null)
    }
  }

  const save = async (restore = false) => {
    if (restore && !(await restoreQuestion(slot))) return
    setSaving(true)
    setError('')
    try {
      const body: SiteMediaSave = restore
        ? { key: slot.key, version, restore: true }
        : { key: slot.key, version, duration: next!.duration, files: { main: { base64: next!.base64 }, poster: { base64: next!.poster.base64 } } }
      const r = await api.saveSiteMedia(body)
      setNext(null)
      onSaved(r.version, r.value as MediaVideo | null)
      notify({ tone: 'ok', title: restore ? 'Video original restaurado' : 'Video publicado', text: 'La web se actualiza sola en 1 o 2 minutos.' })
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'No se pudo guardar. Revisá tu conexión y probá de nuevo.')
    } finally {
      setSaving(false)
    }
  }

  const working = progress !== null
  return (
    <section aria-label={slot.label} className="flex flex-col gap-4 rounded-2xl bg-white p-4 ring-1 ring-brand-deep/10 sm:p-5">
      <CardHeader slot={slot} changed={Boolean(value)} />
      <video
        key={next?.url ?? current.src}
        src={next?.url ?? mediaSrc(current.src)}
        poster={next?.poster.url ?? mediaSrc(current.poster)}
        controls
        playsInline
        preload="metadata"
        className={`mx-auto max-h-96 w-full rounded-2xl bg-brand-night object-contain ${next ? 'ring-2 ring-brand-signal' : ''}`}
      />
      <p className="text-center text-xs font-semibold text-brand-night/60">
        {next ? `Nuevo · ${formatDuration(next.duration)} · ${(next.size / 1e6).toFixed(1)} MB${next.compressed ? ' (comprimido)' : ''}` : `Duración: ${formatDuration(current.duration)}`}
      </p>
      <p className="text-xs leading-relaxed text-brand-night/60">{slot.hint}</p>
      {working ? (
        <div className="flex flex-col gap-2 rounded-2xl bg-brand-paper p-3" role="status">
          <p className="text-sm font-bold text-brand-deep">{progress! > 0 ? `Comprimiendo el video… ${Math.round(progress! * 100)}%` : 'Leyendo el video…'}</p>
          <div className="h-2 overflow-hidden rounded-full bg-white ring-1 ring-brand-deep/10">
            <div className="h-full rounded-full bg-brand-signal transition-[width]" style={{ width: `${Math.round((progress ?? 0) * 100)}%` }} />
          </div>
          <p className="text-xs text-brand-night/55">Tarda lo mismo que dura el video. No cierres esta pestaña.</p>
        </div>
      ) : (
        <Picker accept="video/*" label={next ? 'Elegir otro' : 'Cambiar video'} busy={false} onFile={take} />
      )}
      <p className="text-xs text-brand-night/50">Hasta {VIDEO_MAX_SECONDS} segundos. Si pesa más de 3 MB, se comprime solo antes de subirlo.</p>
      {error && (
        <p role="alert" className="rounded-xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
          {error}
        </p>
      )}
      <Actions dirty={Boolean(next)} saving={saving} changed={Boolean(value)} canSave={!working} label="Publicar video" onSave={() => save()} onDiscard={() => setNext(null)} onRestore={() => save(true)} />
    </section>
  )
}

/** Fotos y video de la web (fuera del blog y los proyectos): cada lugar se cambia y se publica por separado. */
export function Media({ notify }: { notify: (t: ToastData) => void }) {
  const [values, setValues] = useState<MediaValues | null>(null)
  const [version, setVersion] = useState('')
  const [loadError, setLoadError] = useState('')
  const [dirtyKeys, setDirtyKeys] = useState<string[]>([])

  useLeaveGuard(dirtyKeys.length > 0)

  useEffect(() => {
    api
      .siteMedia()
      .then((r) => {
        setValues(r.data)
        setVersion(r.version)
      })
      .catch((e) => setLoadError(e instanceof ApiError ? e.message : 'No se pudieron cargar las fotos.'))
  }, [])

  const onDirty = useRef((key: string, dirty: boolean) => setDirtyKeys((k) => (dirty ? [...new Set([...k, key])] : k.filter((x) => x !== key)))).current

  if (loadError) return <p className="rounded-3xl bg-white p-10 text-center font-bold text-brand-deep ring-1 ring-brand-deep/10">{loadError}</p>
  if (!values) {
    return (
      <div className="grid place-items-center py-24 text-brand-deep">
        <Spinner className="size-6" />
      </div>
    )
  }

  const saved = (key: string) => (v: string, value: MediaImage | MediaVideo | null) => {
    setVersion(v)
    setValues((all) => {
      const next = { ...(all ?? {}) }
      if (value) next[key] = value
      else delete next[key]
      return next
    })
  }
  const changed = Object.keys(values).length

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-brand-deep sm:text-4xl">Fotos y video</h1>
        <p className="mt-1 max-w-2xl text-sm font-semibold text-brand-night/60">
          {changed ? `${changed} cambiada${changed === 1 ? '' : 's'}. ` : ''}Cada una se publica por separado y se puede volver a la original. Las imágenes del blog y de los proyectos se cambian en sus secciones.
        </p>
      </div>
      <div className="grid grid-cols-1 items-start gap-5 md:grid-cols-2">
        {MEDIA_SLOTS.map((slot) =>
          slot.kind === 'image' ? (
            <ImageCard key={slot.key} slot={slot} value={values[slot.key] as MediaImage | undefined} version={version} onSaved={saved(slot.key)} onDirty={onDirty} notify={notify} />
          ) : (
            <VideoCard key={slot.key} slot={slot} value={values[slot.key] as MediaVideo | undefined} version={version} onSaved={saved(slot.key)} onDirty={onDirty} notify={notify} />
          ),
        )}
      </div>
    </div>
  )
}
