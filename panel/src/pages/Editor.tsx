import { useCallback, useEffect, useMemo, useState } from 'react'
import { CATEGORIES, LIMITS, MEDIA_URL, postUrl, slugify, today, type Category, type PostInput } from '../../shared/blog'
import { api, ApiError, mediaSrc } from '../api'
import { go } from '../App'
import { CoverInput } from '../components/CoverInput'
import { MarkdownEditor } from '../components/MarkdownEditor'
import { SeoPanel } from '../components/SeoPanel'
import { Button, Field, Spinner, inputClass, type ToastData } from '../components/ui'
import type { PreparedImage } from '../lib/image'

const EMPTY: PostInput = {
  slug: '',
  title: '',
  description: '',
  date: today(),
  category: 'Estrategia',
  cover: '',
  coverAlt: '',
  author: 'Ian',
  draft: false,
  body: '',
}

const imageNameOf = (src: string) => (src.startsWith(`${MEDIA_URL}/`) ? src.slice(MEDIA_URL.length + 1) : '')

/** Crear o editar una nota. Con `slug` edita; sin `slug` crea. */
export function Editor({ slug, notify }: { slug?: string; notify: (t: ToastData) => void }) {
  const editing = Boolean(slug)
  const [post, setPost] = useState<PostInput | null>(editing ? null : EMPTY)
  const [loadError, setLoadError] = useState('')
  const [slugTouched, setSlugTouched] = useState(editing)
  const [pending, setPending] = useState<Record<string, PreparedImage>>({})
  const [dirty, setDirty] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!slug) return
    api
      .post(slug)
      .then(({ post: p }) => setPost({ ...EMPTY, ...p, category: (CATEGORIES as readonly string[]).includes(p.category) ? p.category : 'Estrategia' }))
      .catch((e) => setLoadError(e instanceof ApiError ? e.message : 'No se pudo cargar la nota.'))
  }, [slug])

  // Aviso si se cierra la pestaña con cambios sin guardar
  useEffect(() => {
    if (!dirty) return
    const warn = (e: BeforeUnloadEvent) => e.preventDefault()
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty])

  const set = <K extends keyof PostInput>(key: K, value: PostInput[K]) => {
    setDirty(true)
    setPost((p) => {
      if (!p) return p
      const next = { ...p, [key]: value }
      // la dirección sigue al título hasta que la persona la toque (solo al crear)
      if (key === 'title' && !slugTouched) next.slug = slugify(String(value))
      return next
    })
  }

  const addImage = (img: PreparedImage) => setPending((p) => ({ ...p, [img.name]: img }))

  const resolveImage = useCallback(
    (src: string) => {
      const name = imageNameOf(src)
      if (!name) return src
      return pending[name]?.url ?? mediaSrc(src)
    },
    [pending],
  )

  const coverPreview = useMemo(() => (post?.cover ? resolveImage(post.cover) : ''), [post?.cover, resolveImage])

  const back = () => {
    if (dirty && !window.confirm('Hay cambios sin guardar. ¿Salir igual?')) return
    go('#/')
  }

  const save = async () => {
    if (!post) return
    setSaving(true)
    setError('')
    try {
      // solo viajan las imágenes nuevas que la nota usa (portada o dentro del texto)
      const used = new Set([imageNameOf(post.cover), ...[...post.body.matchAll(/\/media\/blog\/([a-z0-9-]+\.webp)/g)].map((m) => m[1])])
      const images = Object.values(pending)
        .filter((i) => used.has(i.name))
        .map(({ name, base64 }) => ({ name, base64 }))
      const result = editing ? await api.update(post, images) : await api.create(post, images)
      setDirty(false)
      notify({
        tone: 'ok',
        title: post.draft ? 'Borrador guardado' : editing ? 'Cambios guardados' : '¡Nota publicada!',
        text: post.draft ? (
          'No se ve en la web hasta que la publiques.'
        ) : (
          <>
            La web se actualiza sola en 1 o 2 minutos.{' '}
            <a href={postUrl(result.slug)} target="_blank" rel="noopener noreferrer" className="font-bold text-white underline">
              Ver la nota
            </a>
          </>
        ),
      })
      go('#/')
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
        <Button variant="secondary" onClick={() => go('#/')} className="mt-4">
          Volver a las notas
        </Button>
      </div>
    )
  }
  if (!post) {
    return (
      <div className="grid place-items-center py-24 text-brand-deep">
        <Spinner className="size-6" />
      </div>
    )
  }

  const saveLabel = post.draft ? 'Guardar borrador' : editing ? 'Guardar cambios' : 'Publicar nota'
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
          ← Notas
        </button>
        <p className="text-sm font-semibold text-brand-night/50">{dirty ? 'Cambios sin guardar' : editing ? 'Sin cambios' : ''}</p>
      </div>

      <h1 className="text-3xl font-extrabold tracking-tight text-brand-deep sm:text-4xl">{editing ? 'Editar nota' : 'Nueva nota'}</h1>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
        {/* Contenido */}
        <div className="flex flex-col gap-6">
          <Field label="Título" htmlFor="title" count={post.title.length} ideal={[30, LIMITS.title.seoMax]} hint="Es lo primero que se lee en Google. Que diga claramente de qué trata la nota.">
            <input id="title" value={post.title} maxLength={LIMITS.title.max} onChange={(e) => set('title', e.target.value)} className={`${inputClass} text-lg font-bold`} placeholder="Ej.: Cómo elegir el plan de redes para tu negocio" />
          </Field>

          <Field
            label="Dirección de la nota"
            htmlFor="slug"
            hint={editing ? 'La dirección no se cambia después de crear la nota: así no se rompen los links ni se pierde el posicionamiento.' : 'Se arma sola con el título. Solo letras, números y guiones.'}
          >
            <div className="flex overflow-hidden rounded-xl bg-white ring-1 ring-brand-deep/15 transition focus-within:ring-2 focus-within:ring-brand-signal">
              <span className="flex shrink-0 items-center bg-brand-paper px-3 text-sm font-semibold text-brand-night/50">
                <span className="max-sm:hidden">marketingbyclic.com</span>/blog/
              </span>
              <input
                id="slug"
                value={post.slug}
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

          <Field label="Resumen" htmlFor="description" count={post.description.length} ideal={[LIMITS.description.seoMin, LIMITS.description.seoMax]} hint="Aparece debajo del título en Google y en las tarjetas del blog. 1 o 2 oraciones.">
            <textarea id="description" rows={3} value={post.description} maxLength={LIMITS.description.max} onChange={(e) => set('description', e.target.value)} className={`${inputClass} resize-y`} />
          </Field>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-[1fr_auto]">
            <Field label="Categoría">
              <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Categoría">
                {CATEGORIES.map((c) => (
                  <button
                    key={c}
                    type="button"
                    role="radio"
                    aria-checked={post.category === c}
                    onClick={() => set('category', c as Category)}
                    className={`rounded-full px-4 py-2 text-sm font-bold ring-1 transition ${post.category === c ? 'bg-brand-deep text-white ring-brand-deep' : 'bg-white text-brand-deep ring-brand-deep/15 hover:ring-brand-deep/40'}`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </Field>
            <Field label="Fecha" htmlFor="date">
              <input id="date" type="date" value={post.date} onChange={(e) => set('date', e.target.value)} className={inputClass} />
            </Field>
          </div>

          <Field label="Portada" hint="Se usa arriba de la nota, en las tarjetas del blog y cuando se comparte el link.">
            <CoverInput
              previewUrl={coverPreview}
              imageBase={post.slug}
              onImage={(img) => {
                addImage(img)
                set('cover', `${MEDIA_URL}/${img.name}`)
              }}
              onError={setError}
            />
          </Field>
          <Field label="Descripción de la portada" htmlFor="coverAlt" hint="Qué se ve en la imagen. La leen Google y las personas que usan lectores de pantalla.">
            <input id="coverAlt" value={post.coverAlt} maxLength={LIMITS.coverAlt.max} onChange={(e) => set('coverAlt', e.target.value)} className={inputClass} placeholder="Ej.: Ian en una videollamada con un cliente" />
          </Field>

          <Field label="Texto">
            <MarkdownEditor value={post.body} onChange={(v) => set('body', v)} imageBase={post.slug} onImage={addImage} resolveImage={resolveImage} onError={setError} />
          </Field>

          <Field label="Autor" htmlFor="author">
            <input id="author" value={post.author} maxLength={LIMITS.author.max} onChange={(e) => set('author', e.target.value)} className={`${inputClass} sm:max-w-xs`} />
          </Field>
        </div>

        {/* Publicación + Google */}
        <aside className="flex flex-col gap-4 lg:sticky lg:top-24 lg:self-start">
          <section className="flex flex-col gap-4 rounded-2xl bg-white p-5 ring-1 ring-brand-deep/10" aria-label="Publicación">
            <p className="text-xs font-bold tracking-widest text-brand-deep/60 uppercase">Estado</p>
            <div className="grid grid-cols-2 rounded-full bg-brand-paper p-1" role="radiogroup" aria-label="Estado de la nota">
              {[
                { draft: false, label: 'Publicada' },
                { draft: true, label: 'Borrador' },
              ].map((o) => (
                <button
                  key={o.label}
                  type="button"
                  role="radio"
                  aria-checked={post.draft === o.draft}
                  onClick={() => set('draft', o.draft)}
                  className={`rounded-full py-2 text-sm font-bold transition ${post.draft === o.draft ? 'bg-white text-brand-deep shadow-soft' : 'text-brand-night/50'}`}
                >
                  {o.label}
                </button>
              ))}
            </div>
            <p className="text-xs leading-relaxed text-brand-night/60">{post.draft ? 'Se guarda, pero no se ve en la web.' : 'Se ve en la web 1 o 2 minutos después de guardar.'}</p>
            <div className="flex flex-col gap-4 max-lg:hidden">
              {errorBox}
              {saveButton}
            </div>
          </section>

          <SeoPanel slug={post.slug} title={post.title} description={post.description} coverAlt={post.coverAlt} hasCover={Boolean(post.cover)} body={post.body} />
        </aside>
      </div>

      {/* En el celular el botón de guardar queda siempre a mano, abajo */}
      <div className="fixed inset-x-0 bottom-0 z-40 flex flex-col gap-3 border-t border-brand-deep/10 bg-white/95 p-4 backdrop-blur lg:hidden">
        {errorBox}
        {saveButton}
      </div>
    </div>
  )
}
