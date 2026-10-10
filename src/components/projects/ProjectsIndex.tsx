import { useRef, useState } from 'react'
import { proyectos } from '../../data/content'
import { usePageIntro } from '../../hooks/usePageIntro'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { gsap, useGSAP } from '../../lib/gsap'
import { splitHeadline } from '../../lib/headline'
import { setupReveals } from '../../lib/motion'
import { projectMeta, projects, projectServices, projectUrl } from '../../lib/projects'
import { deferSetup } from '../../lib/schedule'
import { BlogCta } from '../blog/BlogCta'
import { CategoryChip } from '../blog/PostCard'
import { Footer } from '../sections/footer/Footer'
import { Button } from '../ui/Button'
import { ProjectCard } from './ProjectCard'

const ALL = 'all'

/**
 * /proyectos: todo el portfolio. Cabecera, filtro por servicio (si hay más de uno),
 * el primer proyecto en grande y el resto en grilla. Se actualiza sola desde el panel.
 */
export function ProjectsIndex() {
  const grid = useRef<HTMLElement>(null)
  const [filter, setFilter] = useState(ALL)
  const reduced = useReducedMotion()
  const firstFilter = useRef(true)

  usePageIntro()

  const [featured, ...rest] = projects
  const list = filter === ALL ? rest : projects.filter((p) => p.services.includes(filter))
  const [before, em, after] = splitHeadline(proyectos.page.title)

  useGSAP((_, contextSafe) => deferSetup(contextSafe!(() => setupReveals(grid.current!))), { scope: grid })

  // Al cambiar de filtro las tarjetas entran escalonadas
  useGSAP(
    () => {
      if (firstFilter.current) {
        firstFilter.current = false
        return
      }
      const cards = gsap.utils.toArray<HTMLElement>('[data-filter-item]', grid.current)
      if (reduced) gsap.fromTo(cards, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4 })
      else gsap.fromTo(cards, { autoAlpha: 0, y: 32 }, { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.06, ease: 'reveal' })
    },
    { scope: grid, dependencies: [filter] },
  )

  const chip = (value: string, label: string, count: number) => {
    const on = filter === value
    return (
      <li key={value}>
        <button
          type="button"
          aria-pressed={on}
          onClick={() => setFilter(value)}
          className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold ring-1 transition duration-300 ease-expo active:scale-97 ${
            on ? 'bg-brand-deep text-white ring-brand-deep' : 'bg-white text-brand-deep ring-brand-deep/15 hover:ring-brand-deep/40'
          }`}
        >
          {label}
          <span className={`text-xs ${on ? 'text-brand-haze' : 'text-brand-night/50'}`}>{count}</span>
        </button>
      </li>
    )
  }

  return (
    <>
      <main id="contenido" className="relative isolate z-10 bg-brand-paper">
        <header className="px-5 pt-32 pb-10 md:px-10 md:pt-40 md:pb-14">
          <div className="grid grid-cols-1 items-end gap-6 lg:grid-cols-12 lg:gap-10">
            <div className="lg:col-span-8">
              <p className="flex animate-intro items-center gap-3 font-label text-label text-brand-deep">
                <span aria-hidden="true" className="block h-0.5 w-6 rounded-full bg-brand-signal" />
                {proyectos.eyebrow}
              </p>
              <h1 className="intro-delay-1 mt-5 animate-intro font-display text-hero text-brand-deep">
                {before}
                <span className="text-brand-signal">{em}</span>
                {after}
              </h1>
            </div>
            <p className="intro-delay-2 animate-intro text-lead font-medium text-brand-night/75 lg:col-span-4">{proyectos.text}</p>
          </div>

          {projectServices.length > 1 && (
            <ul aria-label={proyectos.page.filterAria} className="intro-delay-3 mt-10 flex animate-intro flex-wrap gap-2 md:mt-14">
              {chip(ALL, proyectos.page.all, projects.length)}
              {projectServices.map((s) => chip(s, s, projects.filter((p) => p.services.includes(s)).length))}
            </ul>
          )}
        </header>

        <section ref={grid} aria-label={proyectos.eyebrow} className="px-5 pb-20 md:px-10 md:pb-28">
          {/* El primero, en grande (solo sin filtro) */}
          {filter === ALL && featured && (
            <article data-filter-item className="intro-delay-4 group grid grid-cols-1 animate-intro gap-6 rounded-4xl bg-white p-3 shadow-soft ring-1 ring-brand-deep/10 md:p-4 lg:grid-cols-12 lg:items-center lg:gap-10">
              <a href={projectUrl(featured.slug)} data-cursor={proyectos.cursor} tabIndex={-1} aria-hidden="true" className="relative block aspect-4/3 overflow-hidden rounded-3xl bg-brand-night lg:col-span-7">
                <img src={featured.cover.src} alt="" width={featured.cover.width} height={featured.cover.height} decoding="async" className="size-full object-cover transition-transform duration-1000 ease-expo group-hover:scale-105" />
              </a>
              <div className="flex flex-col items-start gap-4 px-3 pb-4 lg:col-span-5 lg:px-0 lg:pr-8 lg:pb-0">
                <div className="flex flex-wrap items-center gap-2">
                  {featured.services.map((s) => (
                    <CategoryChip key={s} className="bg-brand-paper text-brand-deep">
                      {s}
                    </CategoryChip>
                  ))}
                  {projectMeta(featured) && <span className="text-sm font-semibold text-brand-night/60">{projectMeta(featured)}</span>}
                </div>
                <h2 className="font-display text-big text-brand-deep">
                  <a href={projectUrl(featured.slug)} className="transition-colors duration-500 hover:text-brand-signal">
                    {featured.brand}
                  </a>
                </h2>
                {featured.title && <p className="text-lg font-semibold text-brand-deep md:text-xl">{featured.title}</p>}
                <p className="text-base text-brand-night/70 md:text-lg">{featured.summary}</p>
                <Button href={projectUrl(featured.slug)} label={proyectos.view} variant="signal" cursor={proyectos.cursor} className="mt-2" />
              </div>
            </article>
          )}

          {list.length > 0 ? (
            <ul className={`grid gap-x-6 gap-y-14 md:grid-cols-2 lg:grid-cols-3 ${filter === ALL ? 'mt-16 md:mt-20' : ''}`}>
              {list.map((project) => (
                <li key={project.slug} data-filter-item data-reveal={filter === ALL ? 'fade' : undefined}>
                  <ProjectCard project={project} />
                </li>
              ))}
            </ul>
          ) : (
            filter !== ALL && <p className="rounded-3xl bg-white p-10 text-center text-lead text-brand-night/70 ring-1 ring-brand-deep/10">{proyectos.page.empty}</p>
          )}
        </section>

        <BlogCta cta={proyectos.detail.cta} />
      </main>
      <Footer />
    </>
  )
}
