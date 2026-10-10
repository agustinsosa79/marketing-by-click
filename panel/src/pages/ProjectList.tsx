import { useEffect, useState } from 'react'
import { HOME_LIMIT, homeSlugs, projectUrl, type ProjectSummary } from '../../shared/site'
import { api, ApiError, mediaSrc } from '../api'
import { Badge, Button, ConfirmDialog, Spinner, type ToastData } from '../components/ui'
import { go } from '../lib/nav'

const round = 'grid size-8 place-items-center rounded-full font-bold text-brand-deep ring-1 ring-brand-deep/15 hover:bg-brand-deep/5 disabled:opacity-25'

/** Portfolio: el orden de la lista es el orden en la web. Los primeros publicados van en el inicio. */
export function ProjectList({ notify }: { notify: (t: ToastData) => void }) {
  const [projects, setProjects] = useState<ProjectSummary[] | null>(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState<string | null>(null)
  const [toDelete, setToDelete] = useState<ProjectSummary | null>(null)
  const [deleting, setDeleting] = useState(false)

  const load = () =>
    api
      .projects()
      .then((r) => setProjects(r.projects))
      .catch((e) => setError(e instanceof ApiError ? e.message : 'No se pudieron cargar los proyectos.'))
  useEffect(() => {
    load()
  }, [])

  const published = projects?.filter((p) => !p.draft).length ?? 0
  const drafts = projects?.filter((p) => p.draft).length ?? 0
  const onHome = homeSlugs(projects ?? [])

  const move = async (p: ProjectSummary, to: 'up' | 'down' | 'top') => {
    setBusy(p.slug)
    try {
      await api.projectAction(p.slug, to)
      await load()
      if (to === 'top') notify({ tone: 'ok', title: `${p.brand} pasó al principio`, text: 'Ahora se ve primero en el inicio y en la página de proyectos. La web se actualiza en 1 o 2 minutos.' })
    } catch (e) {
      notify({ tone: 'error', title: 'No se pudo mover', text: e instanceof ApiError ? e.message : undefined })
    } finally {
      setBusy(null)
    }
  }

  const confirmDelete = async () => {
    if (!toDelete) return
    setDeleting(true)
    try {
      await api.removeProject(toDelete.slug)
      setProjects((list) => list?.filter((p) => p.slug !== toDelete.slug) ?? null)
      notify({ tone: 'ok', title: 'Proyecto eliminado', text: 'La web se actualiza sola en 1 o 2 minutos.' })
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
          <h1 className="text-3xl font-extrabold tracking-tight text-brand-deep sm:text-4xl">Proyectos</h1>
          {projects && (
            <p className="mt-1 text-sm font-semibold text-brand-night/60">
              {published} publicado{published === 1 ? '' : 's'} · {drafts} borrador{drafts === 1 ? '' : 'es'}
            </p>
          )}
        </div>
        <Button onClick={() => go('#/proyectos/nuevo')} className="py-3">
          <span aria-hidden="true">+</span> Nuevo proyecto
        </Button>
      </div>

      <p className="rounded-2xl bg-white px-4 py-3 text-sm leading-relaxed text-brand-night/70 ring-1 ring-brand-deep/10">
        <b className="text-brand-deep">El orden de esta lista es el orden en la web.</b> Los {HOME_LIMIT} primeros publicados aparecen en la página principal (
        <span className="font-bold text-brand-signal">★ En el inicio</span>); todos se ven en la página de proyectos. Para destacar uno, tocá <b className="text-brand-deep">Al principio</b>.
      </p>

      {error && <p className="rounded-2xl bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</p>}
      {!projects && !error && (
        <div className="grid place-items-center py-20 text-brand-deep">
          <Spinner className="size-6" />
        </div>
      )}

      {projects && projects.length === 0 && (
        <div className="rounded-3xl bg-white p-10 text-center ring-1 ring-brand-deep/10">
          <p className="text-lg font-bold text-brand-deep">Todavía no hay proyectos.</p>
          <Button onClick={() => go('#/proyectos/nuevo')} className="mt-4">
            Cargar el primero
          </Button>
        </div>
      )}

      <ol className="flex flex-col gap-3">
        {projects?.map((p, i) => {
          const home = onHome.has(p.slug)
          const working = busy === p.slug
          return (
            <li key={p.slug} className={`flex flex-col gap-4 rounded-2xl bg-white p-3 ring-1 transition sm:flex-row sm:items-center ${home ? 'ring-2 ring-brand-signal/40' : 'ring-brand-deep/10'} ${working ? 'opacity-60' : ''}`}>
              <div className="flex items-center gap-3">
                <div className="flex flex-col gap-1">
                  <button type="button" aria-label={`Subir ${p.brand}`} disabled={i === 0 || Boolean(busy)} onClick={() => move(p, 'up')} className={round}>
                    ↑
                  </button>
                  <button type="button" aria-label={`Bajar ${p.brand}`} disabled={i === projects.length - 1 || Boolean(busy)} onClick={() => move(p, 'down')} className={round}>
                    ↓
                  </button>
                </div>
                <a href={`#/proyectos/editar/${p.slug}`} className="block aspect-4/3 w-28 shrink-0 overflow-hidden rounded-xl bg-brand-paper sm:w-32">
                  {p.cover ? <img src={mediaSrc(p.cover)} alt="" loading="lazy" className="size-full object-cover" /> : <span className="grid size-full place-items-center text-xs text-brand-night/40">Sin portada</span>}
                </a>
              </div>

              <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-black text-brand-night/40">#{i + 1}</span>
                  <Badge tone={p.draft ? 'draft' : 'live'}>{p.draft ? 'Borrador' : 'Publicado'}</Badge>
                  {home && <Badge tone="neutral">★ En el inicio</Badge>}
                  {p.services.map((s) => (
                    <Badge key={s} tone="neutral">
                      {s}
                    </Badge>
                  ))}
                </div>
                <a href={`#/proyectos/editar/${p.slug}`} className="truncate text-lg font-extrabold tracking-tight text-brand-deep hover:text-brand-signal">
                  {p.brand}
                </a>
                {p.title && <p className="line-clamp-1 text-sm text-brand-night/60">{p.title}</p>}
              </div>

              <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                <button
                  type="button"
                  onClick={() => move(p, 'top')}
                  disabled={i === 0 || Boolean(busy)}
                  className="inline-flex items-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-bold text-brand-deep ring-1 ring-brand-deep/15 transition hover:ring-brand-deep/40 disabled:opacity-35"
                >
                  {working ? <Spinner /> : <span aria-hidden="true">⇡</span>} Al principio
                </button>
                <Button variant="secondary" onClick={() => go(`#/proyectos/editar/${p.slug}`)}>
                  Editar
                </Button>
                {!p.draft && (
                  <a href={projectUrl(p.slug)} target="_blank" rel="noopener noreferrer" className="rounded-full px-3 py-2.5 text-sm font-bold text-brand-deep hover:bg-brand-deep/5">
                    Ver ↗
                  </a>
                )}
                <button type="button" onClick={() => setToDelete(p)} aria-label={`Eliminar ${p.brand}`} className="rounded-full px-3 py-2.5 text-sm font-bold text-red-700 hover:bg-red-50">
                  Eliminar
                </button>
              </div>
            </li>
          )
        })}
      </ol>

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="¿Eliminar este proyecto?"
        text={
          <>
            Se va a borrar <b>«{toDelete?.brand}»</b> de la web, junto con sus imágenes. No se puede deshacer desde el panel.
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
