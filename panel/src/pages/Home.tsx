import { useEffect, useState, type ReactNode } from 'react'
import type { PostSummary } from '../../shared/blog'
import { HOME_LIMIT, homeSlugs, listNames, PLANS, type FaqItem, type PricesInput, type ProjectSummary } from '../../shared/site'
import { api } from '../api'
import { Button, Spinner } from '../components/ui'
import { go } from '../lib/nav'

interface Data {
  posts: PostSummary[] | null
  projects: ProjectSummary[] | null
  prices: PricesInput | null
  faq: FaqItem[] | null
}

/** Tarjeta de una sección: qué hay hoy y la acción más común. */
function Card({ title, href, stat, detail, action, onAction }: { title: string; href: string; stat: ReactNode; detail?: ReactNode; action: string; onAction: () => void }) {
  return (
    <section className="group flex flex-col justify-between gap-6 rounded-3xl bg-white p-6 ring-1 ring-brand-deep/10 transition hover:shadow-lift">
      <div className="flex flex-col gap-2">
        <a href={href} className="flex items-center justify-between gap-3 text-xs font-bold tracking-widest text-brand-deep/60 uppercase hover:text-brand-signal">
          {title}
          <span aria-hidden="true" className="text-base transition group-hover:translate-x-1">
            →
          </span>
        </a>
        <p className="text-2xl font-extrabold tracking-tight text-brand-deep">{stat}</p>
        {detail && <p className="text-sm text-brand-night/60">{detail}</p>}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={onAction}>{action}</Button>
        <a href={href} className="rounded-full px-3 py-2 text-sm font-bold text-brand-deep hover:bg-brand-deep/5">
          Ver todo
        </a>
      </div>
    </section>
  )
}

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`

/** Inicio del panel: un vistazo a cada sección de la web que se puede editar. */
export function Home() {
  const [data, setData] = useState<Data>({ posts: null, projects: null, prices: null, faq: null })

  useEffect(() => {
    // cada tarjeta carga por su lado: si una falla, las otras se ven igual
    api.posts().then((r) => setData((d) => ({ ...d, posts: r.posts })), () => setData((d) => ({ ...d, posts: [] })))
    api.projects().then((r) => setData((d) => ({ ...d, projects: r.projects })), () => setData((d) => ({ ...d, projects: [] })))
    api.prices().then((r) => setData((d) => ({ ...d, prices: r.data })), () => {})
    api.faq().then((r) => setData((d) => ({ ...d, faq: r.data })), () => setData((d) => ({ ...d, faq: [] })))
  }, [])

  const loading = <Spinner className="size-5 text-brand-deep" />
  const posts = data.posts
  const projects = data.projects

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-brand-deep sm:text-4xl">Tu web, en un solo lugar</h1>
        <p className="mt-2 max-w-2xl text-sm text-brand-night/65 sm:text-base">Todo lo que guardes acá se ve en la web 1 o 2 minutos después. Cada cambio queda registrado y se puede recuperar con ayuda técnica.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card
          title="Blog"
          href="#/blog"
          stat={posts ? plural(posts.filter((p) => !p.draft).length, 'nota publicada', 'notas publicadas') : loading}
          detail={posts && (posts[0] ? `Última: ${posts[0].title}` : 'Todavía no hay notas.')}
          action="+ Nueva nota"
          onAction={() => go('#/blog/nueva')}
        />
        <Card
          title="Proyectos"
          href="#/proyectos"
          stat={projects ? plural(projects.filter((p) => !p.draft).length, 'proyecto publicado', 'proyectos publicados') : loading}
          detail={projects && `En el inicio (los ${HOME_LIMIT} primeros): ${listNames(projects.filter((p) => homeSlugs(projects).has(p.slug)).map((p) => p.brand)) || 'ninguno'}`}
          action="+ Nuevo proyecto"
          onAction={() => go('#/proyectos/nuevo')}
        />
        <Card
          title="Precios"
          href="#/precios"
          stat={data.prices ? PLANS.map((p) => data.prices!.plans[p.id]).join(' · ') + ` ${data.prices.currency}` : loading}
          detail={data.prices && `${PLANS.map((p) => p.name).join(' · ')} por mes`}
          action="Cambiar precios"
          onAction={() => go('#/precios')}
        />
        <Card
          title="Preguntas frecuentes"
          href="#/preguntas"
          stat={data.faq ? plural(data.faq.length, 'pregunta', 'preguntas') : loading}
          detail="Las dudas que aparecen en la página principal."
          action="Editar preguntas"
          onAction={() => go('#/preguntas')}
        />
      </div>
    </div>
  )
}
