import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { LIMITS, slugify } from '../../shared/blog'
import {
  HOME_LIMIT,
  homeSlugs,
  PROJECT_LIMITS as L,
  PROJECTS_MEDIA_URL,
  SERVICES,
  projectUrl,
  type ProjectImage,
  type ProjectInput,
  type ProjectStep,
  type ProjectSummary,
} from '../../shared/site'
import { api, ApiError, mediaSrc } from '../api'
import { ImagePicker } from '../components/ImagePicker'
import { PreviewFrame, ProjectCardPreview, ProjectPagePreview } from '../components/previews'
import { Button, Field, Spinner, inputClass, type ToastData } from '../components/ui'
import { prepareImage, type PreparedImage } from '../lib/image'
import { go, unsaved, useLeaveGuard } from '../lib/nav'

const EMPTY: ProjectInput = {
  slug: '',
  brand: '',
  title: '',
  summary: '',
  sector: '',
  location: '',
  year: '',
  services: [],
  cover: null,
  challenge: '',
  process: [],
  result: '',
  gallery: [],
  order: 0,
  draft: false,
}

const nameOf = (src: string) => (src.startsWith(`${PROJECTS_MEDIA_URL}/`) ? src.slice(PROJECTS_MEDIA_URL.length + 1) : '')
const toImage = (img: PreparedImage, alt = ''): ProjectImage => ({ src: `${PROJECTS_MEDIA_URL}/${img.name}`, alt, width: img.width, height: img.height })

/** Bloque del formulario con título y bajada. */
function Block({ title, hint, children, aside }: { title: string; hint?: string; children: ReactNode; aside?: ReactNode }) {
  return (
    <section className="flex flex-col gap-5 rounded-2xl bg-white p-5 ring-1 ring-brand-deep/10 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-extrabold text-brand-deep">{title}</h2>
          {hint && <p className="mt-0.5 text-sm text-brand-night/60">{hint}</p>}
        </div>
        {aside}
      </div>
      {children}
    </section>
  )
}

const small = 'grid size-9 place-items-center rounded-full text-sm font-bold ring-1 transition disabled:opacity-30'

/** Crear o editar un proyecto del portfolio. Con `slug` edita; sin `slug` crea. */
export function ProjectEditor({ slug, notify }: { slug?: string; notify: (t: ToastData) => void }) {
  const editing = Boolean(slug)
  const [project, setProject] = useState<ProjectInput | null>(editing ? null : EMPTY)
  const [others, setOthers] = useState<ProjectSummary[]>([])
  const [loadError, setLoadError] = useState('')
  const [slugTouched, setSlugTouched] = useState(editing)
  const [pending, setPending] = useState<Record<string, PreparedImage>>({})
  const [dirty, setDirty] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [tab, setTab] = useState<'edit' | 'preview'>('edit')
  const [adding, setAdding] = useState(false)
  const gallery = useRef<HTMLInputElement>(null)

  useLeaveGuard(dirty)

  useEffect(() => {
    api
      .projects()
      .then((r) => setOthers(r.projects.filter((p) => p.slug !== slug)))
      .catch(() => {})
    if (!slug) return
    api
      .project(slug)
      .then(({ project: p }) => setProject({ ...EMPTY, ...p }))
      .catch((e) => setLoadError(e instanceof ApiError ? e.message : 'No se pudo cargar el proyecto.'))
  }, [slug])

  const resolve = useCallback((src: string) => pending[nameOf(src)]?.url ?? mediaSrc(src), [pending])

  const set = <K extends keyof ProjectInput>(key: K, value: ProjectInput[K]) => {
    setDirty(true)
    setError('')
    setProject((p) => {
      if (!p) return p
      const next = { ...p, [key]: value }
      // la dirección sigue al nombre de la marca hasta que la persona la toque (solo al crear)
      if (key === 'brand' && !slugTouched) next.slug = slugify(String(value))
      return next
    })
  }
  const addPending = (img: PreparedImage) => setPending((p) => ({ ...p, [img.name]: img }))

  const setStep = (i: number, patch: Partial<ProjectStep>) => project && set('process', project.process.map((s, k) => (k === i ? { ...s, ...patch } : s)))
  const moveStep = (i: number, dir: -1 | 1) => {
    if (!project) return
    const next = [...project.process]
    ;[next[i], next[i + dir]] = [next[i + dir], next[i]]
    set('process', next)
  }

  const addGallery = async (files: FileList | null) => {
    if (!project || !files?.length) return
    setAdding(true)
    try {
      const room = L.gallery - project.gallery.length
      const added: ProjectImage[] = []
      for (const file of [...files].slice(0, room)) {
        const img = await prepareImage(file, `${project.slug || 'proyecto'}-galeria`)
        addPending(img)
        added.push(toImage(img))
      }
      set('gallery', [...project.gallery, ...added])
      if (files.length > room) setError(`La galería admite hasta ${L.gallery} imágenes: se agregaron las primeras ${room}.`)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo cargar una imagen.')
    } finally {
      setAdding(false)
      if (gallery.current) gallery.current.value = ''
    }
  }

  // ¿Se ve en el inicio? Los primeros publicados de la lista (uno nuevo va al final)
  const inHome = Boolean(
    project &&
      !project.draft &&
      homeSlugs([...others, { slug: project.slug || 'nuevo', draft: false, order: editing ? project.order : Infinity }].sort((a, b) => a.order - b.order)).has(project.slug || 'nuevo'),
  )

  const back = () => {
    if (dirty && !window.confirm('Hay cambios sin guardar. ¿Salir igual?')) return
    unsaved.current = false
    go('#/proyectos')
  }

  const save = async () => {
    if (!project) return
    setError('')
    // mismas reglas que el servidor, para avisar antes de mandar
    if (!project.brand.trim()) return setError('Escribí el nombre de la marca.')
    if (!project.draft) {
      if (!project.cover) return setError('Para publicar, agregá una imagen de portada.')
      if (!project.cover.alt.trim()) return setError('Para publicar, describí la imagen de portada.')
      if (!project.summary.trim()) return setError('Para publicar, completá el resumen.')
    }
    const used = new Set([project.cover, ...project.process.map((s) => s.image), ...project.gallery].map((i) => (i ? nameOf(i.src) : '')).filter(Boolean))
    const images = Object.values(pending)
      .filter((i) => used.has(i.name))
      .map(({ name, base64 }) => ({ name, base64 }))
    if (images.reduce((n, i) => n + i.base64.length, 0) > LIMITS.imagesTotal * 1.34) {
      return setError('Las imágenes nuevas pesan demasiado para un solo guardado. Guardá ahora con algunas (por ejemplo como borrador) y sumá el resto después.')
    }
    setSaving(true)
    try {
      const result = editing ? await api.updateProject(project, images) : await api.createProject(project, images)
      setDirty(false)
      unsaved.current = false
      notify({
        tone: 'ok',
        title: project.draft ? 'Borrador guardado' : editing ? 'Cambios guardados' : '¡Proyecto publicado!',
        text: project.draft ? (
          'No se ve en la web hasta que lo publiques.'
        ) : (
          <>
            La web se actualiza sola en 1 o 2 minutos.{' '}
            <a href={projectUrl(result.slug)} target="_blank" rel="noopener noreferrer" className="font-bold text-white underline">
              Ver el proyecto
            </a>
          </>
        ),
      })
      go('#/proyectos')
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'No se pudo guardar. Revisá tu conexión y probá de nuevo.')
    } finally {
      setSaving(false)
    }
  }

  if (loadError) {
    return (
      <div className="rounded-3xl bg-white p-10 text-center ring-1 ring-brand-deep/10">
        <p className="font-bold text-brand-deep">{loadError}</p>
        <Button variant="secondary" onClick={() => go('#/proyectos')} className="mt-4">
          Volver a los proyectos
        </Button>
      </div>
    )
  }
  if (!project) {
    return (
      <div className="grid place-items-center py-24 text-brand-deep">
        <Spinner className="size-6" />
      </div>
    )
  }

  const base = project.slug || 'proyecto'
  const missingAlts = [...project.process.map((s) => s.image), ...project.gallery].filter((i) => i && !i.alt.trim()).length
  const checks = [
    { ok: Boolean(project.cover && project.cover.alt.trim()), text: 'Portada con descripción' },
    { ok: project.summary.length >= L.summary.seoMin && project.summary.length <= L.summary.seoMax, text: `Resumen de ${L.summary.seoMin} a ${L.summary.seoMax} caracteres (tiene ${project.summary.length})` },
    { ok: project.services.length > 0, text: 'Al menos un servicio marcado' },
    { ok: Boolean(project.challenge.trim()), text: 'El desafío contado' },
    { ok: project.process.filter((s) => s.image).length >= 2, text: 'Al menos 2 pasos con imagen' },
    { ok: Boolean(project.result.trim()), text: 'El resultado contado' },
    { ok: missingAlts === 0, text: missingAlts ? `Faltan ${missingAlts} descripciones de imágenes` : 'Todas las imágenes descriptas' },
  ]
  const done = checks.filter((c) => c.ok).length
  const saveLabel = project.draft ? 'Guardar borrador' : editing ? 'Guardar cambios' : 'Publicar proyecto'

  const errorBox = error && (
    <p role="alert" className="rounded-xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
      {error}
    </p>
  )
  const saveButton = (
    <Button onClick={save} disabled={saving} className="w-full py-3">
      {saving && <Spinner />}
      {saving ? 'Guardando…' : saveLabel}
    </Button>
  )

  return (
    <div className="flex flex-col gap-6 max-lg:pb-24">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button type="button" onClick={back} className="text-sm font-bold text-brand-deep hover:text-brand-signal">
          ← Proyectos
        </button>
        <p className="text-sm font-semibold text-brand-night/50">{dirty ? 'Cambios sin guardar' : editing ? 'Sin cambios' : ''}</p>
      </div>

      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-3xl font-extrabold tracking-tight text-brand-deep sm:text-4xl">{editing ? project.brand || 'Editar proyecto' : 'Nuevo proyecto'}</h1>
        <div className="flex rounded-full bg-white p-1 ring-1 ring-brand-deep/10" role="tablist" aria-label="Modo">
          {[
            { id: 'edit', label: 'Editar' },
            { id: 'preview', label: 'Vista previa de la página' },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id as 'edit' | 'preview')}
              className={`rounded-full px-4 py-2 text-sm font-bold transition ${tab === t.id ? 'bg-brand-deep text-white' : 'text-brand-deep hover:bg-brand-deep/5'}`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="flex flex-col gap-6 lg:col-span-8">
          {tab === 'preview' ? (
            <PreviewFrame path={`/proyectos/${base}`}>
              <ProjectPagePreview project={project} resolve={resolve} />
            </PreviewFrame>
          ) : (
            <>
              <Block title="La marca" hint="Lo primero que se lee del proyecto, en la lista y en Google.">
                <Field label="Nombre de la marca" htmlFor="brand">
                  <input id="brand" value={project.brand} maxLength={L.brand.max} onChange={(e) => set('brand', e.target.value)} className={`${inputClass} text-lg font-bold`} placeholder="Ej.: Hostel El Duende Errante" />
                </Field>
                <Field
                  label="Dirección"
                  htmlFor="slug"
                  hint={editing ? 'No se cambia después de crear el proyecto: así no se rompen los links ni se pierde el posicionamiento.' : 'Se arma sola con el nombre. Solo letras, números y guiones.'}
                >
                  <div className="flex overflow-hidden rounded-xl bg-white ring-1 ring-brand-deep/15 transition focus-within:ring-2 focus-within:ring-brand-signal">
                    <span className="flex shrink-0 items-center bg-brand-paper px-3 text-sm font-semibold text-brand-night/50">
                      <span className="max-sm:hidden">marketingbyclic.com</span>/proyectos/
                    </span>
                    <input
                      id="slug"
                      value={project.slug}
                      readOnly={editing}
                      maxLength={LIMITS.slug.max}
                      onChange={(e) => {
                        setSlugTouched(true)
                        set('slug', slugify(e.target.value.replace(/\s/g, '-')) + (e.target.value.endsWith('-') ? '-' : ''))
                      }}
                      className={`w-full min-w-0 bg-transparent px-3 py-3 text-[0.95rem] outline-none ${editing ? 'text-brand-night/50' : 'text-brand-night'}`}
                    />
                  </div>
                </Field>
                <Field label="Qué hicieron, en una frase" htmlFor="title" count={project.title.length} hint="Aparece debajo del nombre. Ej.: Una identidad completa, del logo a las remeras.">
                  <input id="title" value={project.title} maxLength={L.title.max} onChange={(e) => set('title', e.target.value)} className={inputClass} />
                </Field>
                <Field label="Resumen" htmlFor="summary" count={project.summary.length} ideal={[L.summary.seoMin, L.summary.seoMax]} hint="Una o dos oraciones. Se usa en el inicio, en la tarjeta y en Google.">
                  <textarea id="summary" rows={3} value={project.summary} maxLength={L.summary.max} onChange={(e) => set('summary', e.target.value)} className={`${inputClass} resize-y`} />
                </Field>
                <Field label="Servicios">
                  <div className="flex flex-wrap gap-2" role="group" aria-label="Servicios del proyecto">
                    {SERVICES.map((s) => {
                      const on = project.services.includes(s)
                      return (
                        <button
                          key={s}
                          type="button"
                          aria-pressed={on}
                          onClick={() => set('services', on ? project.services.filter((x) => x !== s) : SERVICES.filter((x) => x === s || project.services.includes(x)))}
                          className={`rounded-full px-4 py-2 text-sm font-bold ring-1 transition ${on ? 'bg-brand-deep text-white ring-brand-deep' : 'bg-white text-brand-deep ring-brand-deep/15 hover:ring-brand-deep/40'}`}
                        >
                          {on ? '✓ ' : ''}
                          {s}
                        </button>
                      )
                    })}
                  </div>
                </Field>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <Field label="Rubro" htmlFor="sector">
                    <input id="sector" value={project.sector} maxLength={L.short.max} onChange={(e) => set('sector', e.target.value)} className={inputClass} placeholder="Ej.: Gastronomía" />
                  </Field>
                  <Field label="Ubicación" htmlFor="location">
                    <input id="location" value={project.location} maxLength={L.short.max} onChange={(e) => set('location', e.target.value)} className={inputClass} placeholder="Ej.: Bariloche" />
                  </Field>
                  <Field label="Año" htmlFor="year">
                    <input id="year" value={project.year} maxLength={L.short.max} onChange={(e) => set('year', e.target.value)} className={inputClass} placeholder="Ej.: 2025" />
                  </Field>
                </div>
              </Block>

              <Block title="Portada" hint="La imagen principal: en la tarjeta, arriba de la página y al compartir el link.">
                <ImagePicker
                  url={project.cover ? resolve(project.cover.src) : ''}
                  imageBase={`${base}-portada`}
                  onImage={(img) => {
                    addPending(img)
                    set('cover', toImage(img, project.cover?.alt ?? ''))
                  }}
                  onError={setError}
                  hint="Horizontal o cuadrada. Se achica y se optimiza sola."
                />
                <Field label="Descripción de la portada" htmlFor="coverAlt" hint="Qué se ve en la imagen. La leen Google y las personas que usan lectores de pantalla.">
                  <input
                    id="coverAlt"
                    value={project.cover?.alt ?? ''}
                    disabled={!project.cover}
                    maxLength={L.alt.max}
                    onChange={(e) => project.cover && set('cover', { ...project.cover, alt: e.target.value })}
                    className={`${inputClass} disabled:opacity-50`}
                    placeholder="Ej.: Remeras con el logo del hostel"
                  />
                </Field>
              </Block>

              <Block title="El desafío" hint="Qué necesitaba la marca cuando llegó. 2 a 4 oraciones. Una línea en blanco separa párrafos.">
                <textarea aria-label="El desafío" rows={4} value={project.challenge} maxLength={L.long.max} onChange={(e) => set('challenge', e.target.value)} className={`${inputClass} resize-y`} />
              </Block>

              <Block
                title="Cómo lo hicimos"
                hint="Los pasos del trabajo, cada uno con una imagen si la hay. Es lo que más convence."
                aside={<span className="text-xs font-bold text-brand-night/45">{project.process.length}/{L.steps} pasos</span>}
              >
                {project.process.map((step, i) => (
                  <div key={i} className="flex flex-col gap-4 rounded-2xl bg-brand-paper p-4 ring-1 ring-brand-deep/10">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-black text-brand-deep">Paso {String(i + 1).padStart(2, '0')}</span>
                      <div className="flex gap-1.5">
                        <button type="button" aria-label="Subir paso" disabled={i === 0} onClick={() => moveStep(i, -1)} className={`${small} bg-white text-brand-deep ring-brand-deep/15`}>
                          ↑
                        </button>
                        <button type="button" aria-label="Bajar paso" disabled={i === project.process.length - 1} onClick={() => moveStep(i, 1)} className={`${small} bg-white text-brand-deep ring-brand-deep/15`}>
                          ↓
                        </button>
                        <button
                          type="button"
                          aria-label={`Borrar el paso ${i + 1}`}
                          onClick={() => set('process', project.process.filter((_, k) => k !== i))}
                          className={`${small} bg-white text-red-700 ring-red-200 hover:bg-red-50`}
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="flex flex-col gap-3">
                        <input aria-label={`Título del paso ${i + 1}`} value={step.title} maxLength={L.stepTitle.max} onChange={(e) => setStep(i, { title: e.target.value })} className={`${inputClass} font-bold`} placeholder="Ej.: Logo completo" />
                        <textarea aria-label={`Texto del paso ${i + 1}`} rows={4} value={step.text} maxLength={L.long.max} onChange={(e) => setStep(i, { text: e.target.value })} className={`${inputClass} resize-y`} placeholder="Qué se hizo y por qué." />
                      </div>
                      <div className="flex flex-col gap-2">
                        <ImagePicker
                          url={step.image ? resolve(step.image.src) : ''}
                          imageBase={`${base}-paso`}
                          onImage={(img) => {
                            addPending(img)
                            setStep(i, { image: toImage(img, step.image?.alt ?? '') })
                          }}
                          onRemove={() => setStep(i, { image: null })}
                          onError={setError}
                          aspect="aspect-video"
                          hint="Opcional."
                        />
                        {step.image && (
                          <input
                            aria-label={`Descripción de la imagen del paso ${i + 1}`}
                            value={step.image.alt}
                            maxLength={L.alt.max}
                            onChange={(e) => step.image && setStep(i, { image: { ...step.image, alt: e.target.value } })}
                            className={`${inputClass} text-sm`}
                            placeholder="Qué se ve en la imagen"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  disabled={project.process.length >= L.steps}
                  onClick={() => set('process', [...project.process, { title: '', text: '', image: null }])}
                  className="rounded-2xl border-2 border-dashed border-brand-deep/20 p-4 text-sm font-bold text-brand-deep transition hover:border-brand-signal hover:text-brand-signal disabled:opacity-40"
                >
                  + Agregar paso
                </button>
              </Block>

              <Block title="El resultado" hint="Qué cambió para la marca. Si hay números reales (consultas, ventas, seguidores), mejor.">
                <textarea aria-label="El resultado" rows={4} value={project.result} maxLength={L.long.max} onChange={(e) => set('result', e.target.value)} className={`${inputClass} resize-y`} />
              </Block>

              <Block
                title="Más piezas"
                hint="Opcional: otras imágenes del trabajo. Se muestran en mosaico, con su forma original."
                aside={<span className="text-xs font-bold text-brand-night/45">{project.gallery.length}/{L.gallery}</span>}
              >
                {project.gallery.length > 0 && (
                  <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {project.gallery.map((img, i) => (
                      <li key={img.src} className="flex flex-col gap-2">
                        <div className="relative overflow-hidden rounded-xl bg-brand-paper ring-1 ring-brand-deep/10">
                          <img src={resolve(img.src)} alt="" className="aspect-square w-full object-cover" />
                          <button
                            type="button"
                            aria-label={`Quitar la imagen ${i + 1}`}
                            onClick={() => set('gallery', project.gallery.filter((_, k) => k !== i))}
                            className="absolute top-2 right-2 grid size-8 place-items-center rounded-full bg-white text-sm font-bold text-red-700 shadow-lift"
                          >
                            ✕
                          </button>
                        </div>
                        <input
                          aria-label={`Descripción de la imagen ${i + 1}`}
                          value={img.alt}
                          maxLength={L.alt.max}
                          onChange={(e) => set('gallery', project.gallery.map((g, k) => (k === i ? { ...g, alt: e.target.value } : g)))}
                          className={`${inputClass} px-3 py-2 text-sm`}
                          placeholder="Qué se ve"
                        />
                      </li>
                    ))}
                  </ul>
                )}
                <button
                  type="button"
                  disabled={adding || project.gallery.length >= L.gallery}
                  onClick={() => gallery.current?.click()}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-brand-deep/20 p-4 text-sm font-bold text-brand-deep transition hover:border-brand-signal hover:text-brand-signal disabled:opacity-40"
                >
                  {adding && <Spinner />}+ Agregar imágenes
                </button>
                <input ref={gallery} type="file" accept="image/*" multiple hidden onChange={(e) => addGallery(e.target.files)} />
              </Block>
            </>
          )}
        </div>

        {/* Publicación + tarjeta + revisión */}
        <aside className="flex flex-col gap-4 lg:sticky lg:top-24 lg:col-span-4 lg:self-start">
          <section className="flex flex-col gap-4 rounded-2xl bg-white p-5 ring-1 ring-brand-deep/10" aria-label="Publicación">
            <p className="text-xs font-bold tracking-widest text-brand-deep/60 uppercase">Estado</p>
            <div className="grid grid-cols-2 rounded-full bg-brand-paper p-1" role="radiogroup" aria-label="Estado del proyecto">
              {[
                { draft: false, label: 'Publicado' },
                { draft: true, label: 'Borrador' },
              ].map((o) => (
                <button
                  key={o.label}
                  type="button"
                  role="radio"
                  aria-checked={project.draft === o.draft}
                  onClick={() => set('draft', o.draft)}
                  className={`rounded-full py-2 text-sm font-bold transition ${project.draft === o.draft ? 'bg-white text-brand-deep shadow-soft' : 'text-brand-night/50'}`}
                >
                  {o.label}
                </button>
              ))}
            </div>
            <p className={`rounded-xl p-3 text-xs leading-relaxed ring-1 ${inHome ? 'bg-brand-signal/5 text-brand-night/70 ring-brand-signal/40' : 'text-brand-night/60 ring-brand-deep/10'}`}>
              <b className="block text-sm text-brand-deep">{inHome ? '★ Se ve en el inicio' : 'Página principal'}</b>
              {project.draft
                ? 'Los borradores no se muestran en la web.'
                : inHome
                  ? `Está entre los ${HOME_LIMIT} primeros de la lista de proyectos.`
                  : editing
                    ? `En el inicio se ven los ${HOME_LIMIT} primeros de la lista. Para mostrarlo, tocá "Al principio" en la lista de proyectos.`
                    : `Un proyecto nuevo se suma al final de la lista. En el inicio se ven los ${HOME_LIMIT} primeros: para mostrarlo, tocá "Al principio" en la lista.`}
            </p>
            <div className="flex flex-col gap-3 max-lg:hidden">
              {errorBox}
              {saveButton}
            </div>
          </section>

          <section className="flex flex-col gap-3 rounded-2xl bg-white p-5 ring-1 ring-brand-deep/10" aria-label="Tarjeta">
            <p className="text-xs font-bold tracking-widest text-brand-deep/60 uppercase">Así se ve en la lista</p>
            <ProjectCardPreview project={project} resolve={resolve} />
          </section>

          <section className="rounded-2xl bg-white p-5 ring-1 ring-brand-deep/10" aria-label="Revisión">
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
            <p className="mt-3 text-xs leading-relaxed text-brand-night/50">Recomendaciones para que el proyecto convenza y aparezca mejor en Google. No impiden publicar.</p>
          </section>
        </aside>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 flex flex-col gap-3 border-t border-brand-deep/10 bg-white/95 p-4 backdrop-blur lg:hidden">
        {errorBox}
        {saveButton}
      </div>
    </div>
  )
}
