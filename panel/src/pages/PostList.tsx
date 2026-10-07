import { useEffect, useMemo, useState } from 'react'
import { CATEGORIES, postUrl, type PostSummary } from '../../shared/blog'
import { api, ApiError, mediaSrc } from '../api'
import { go } from '../App'
import { Badge, Button, ConfirmDialog, Spinner, inputClass, type ToastData } from '../components/ui'

const dateFormat = new Intl.DateTimeFormat('es-AR', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })
const formatDate = (iso: string) => (iso ? dateFormat.format(new Date(`${iso}T00:00:00Z`)) : '—')

/** Lista de notas: buscar, filtrar, editar, ver en la web y eliminar. */
export function PostList({ notify }: { notify: (t: ToastData) => void }) {
  const [posts, setPosts] = useState<PostSummary[] | null>(null)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('')
  const [toDelete, setToDelete] = useState<PostSummary | null>(null)
  const [deleting, setDeleting] = useState(false)

  const load = () => {
    setError('')
    api
      .posts()
      .then((r) => setPosts(r.posts))
      .catch((e) => setError(e instanceof ApiError ? e.message : 'No se pudieron cargar las notas.'))
  }
  useEffect(load, [])

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    return (posts ?? []).filter((p) => (!category || p.category === category) && (!q || p.title.toLowerCase().includes(q)))
  }, [posts, query, category])

  const published = posts?.filter((p) => !p.draft).length ?? 0
  const drafts = posts?.filter((p) => p.draft).length ?? 0

  const confirmDelete = async () => {
    if (!toDelete) return
    setDeleting(true)
    try {
      await api.remove(toDelete.slug)
      setPosts((list) => list?.filter((p) => p.slug !== toDelete.slug) ?? null)
      notify({ tone: 'ok', title: 'Nota eliminada', text: 'La web se actualiza sola en 1 o 2 minutos.' })
      setToDelete(null)
    } catch (e) {
      notify({ tone: 'error', title: 'No se pudo eliminar', text: e instanceof ApiError ? e.message : undefined })
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-brand-deep sm:text-4xl">Notas del blog</h1>
          {posts && (
            <p className="mt-1 text-sm font-semibold text-brand-night/60">
              {published} publicada{published === 1 ? '' : 's'} · {drafts} borrador{drafts === 1 ? '' : 'es'}
            </p>
          )}
        </div>
        <Button onClick={() => go('#/nueva')} className="py-3">
          <span aria-hidden="true" className="text-lg leading-none">+</span> Nueva nota
        </Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <input type="search" placeholder="Buscar por título…" value={query} onChange={(e) => setQuery(e.target.value)} className={`${inputClass} sm:max-w-xs`} aria-label="Buscar nota" />
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar por categoría">
          {['', ...CATEGORIES].map((c) => (
            <button
              key={c || 'todas'}
              type="button"
              aria-pressed={category === c}
              onClick={() => setCategory(c)}
              className={`rounded-full px-4 py-2 text-sm font-bold ring-1 transition ${category === c ? 'bg-brand-deep text-white ring-brand-deep' : 'bg-white text-brand-deep ring-brand-deep/15 hover:ring-brand-deep/40'}`}
            >
              {c || 'Todas'}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="flex items-center justify-between gap-4 rounded-2xl bg-red-50 p-4 text-sm font-semibold text-red-700 ring-1 ring-red-200">
          {error}
          <Button variant="secondary" onClick={load}>
            Reintentar
          </Button>
        </div>
      )}

      {!posts && !error && (
        <div className="grid place-items-center py-20 text-brand-deep">
          <Spinner className="size-6" />
        </div>
      )}

      {posts && visible.length === 0 && (
        <div className="rounded-3xl bg-white p-10 text-center ring-1 ring-brand-deep/10">
          <p className="font-bold text-brand-deep">{posts.length === 0 ? 'Todavía no hay notas.' : 'Ninguna nota coincide con la búsqueda.'}</p>
          {posts.length === 0 && (
            <Button onClick={() => go('#/nueva')} className="mt-4">
              Escribir la primera
            </Button>
          )}
        </div>
      )}

      <ul className="flex flex-col gap-3">
        {visible.map((p) => (
          <li key={p.slug} className="flex flex-col gap-4 rounded-2xl bg-white p-3 shadow-soft ring-1 ring-brand-deep/10 sm:flex-row sm:items-center sm:pr-5">
            <a href={`#/editar/${p.slug}`} className="block aspect-video w-full shrink-0 overflow-hidden rounded-xl bg-brand-paper sm:w-40">
              {p.cover ? <img src={mediaSrc(p.cover)} alt="" loading="lazy" className="size-full object-cover" /> : <span className="grid size-full place-items-center text-xs font-semibold text-brand-night/40">Sin portada</span>}
            </a>
            <div className="flex min-w-0 flex-1 flex-col gap-1.5 px-1 sm:px-0">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone={p.draft ? 'draft' : 'live'}>{p.draft ? 'Borrador' : 'Publicada'}</Badge>
                <Badge tone="neutral">{p.category || 'Sin categoría'}</Badge>
                <span className="text-xs font-semibold text-brand-night/50">
                  {formatDate(p.date)}
                  {p.updated ? ` · editada ${formatDate(p.updated)}` : ''}
                </span>
              </div>
              <a href={`#/editar/${p.slug}`} className="truncate text-lg font-extrabold tracking-tight text-brand-deep hover:text-brand-signal">
                {p.title || '(sin título)'}
              </a>
              <p className="line-clamp-1 text-sm text-brand-night/60">{p.description}</p>
            </div>
            <div className="flex shrink-0 gap-2 px-1 pb-1 sm:px-0 sm:pb-0">
              <Button variant="secondary" onClick={() => go(`#/editar/${p.slug}`)}>
                Editar
              </Button>
              {!p.draft && (
                <a href={postUrl(p.slug)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center rounded-full px-4 py-2.5 text-sm font-bold text-brand-deep hover:bg-brand-deep/5">
                  Ver ↗
                </a>
              )}
              <Button variant="ghost" onClick={() => setToDelete(p)} aria-label={`Eliminar ${p.title}`} className="text-red-700 hover:bg-red-50">
                Eliminar
              </Button>
            </div>
          </li>
        ))}
      </ul>

      <ConfirmDialog
        open={!!toDelete}
        title="¿Eliminar esta nota?"
        text={
          <>
            Se va a borrar <strong>«{toDelete?.title}»</strong> de la web, junto con las imágenes que solo usaba esa nota. No se puede deshacer desde el panel.
          </>
        }
        confirmLabel="Eliminar"
        busy={deleting}
        onConfirm={confirmDelete}
        onClose={() => !deleting && setToDelete(null)}
      />
    </div>
  )
}
