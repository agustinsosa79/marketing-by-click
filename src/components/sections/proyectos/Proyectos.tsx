import { useRef } from 'react'
import { proyectos, sections } from '../../../data/content'
import { useGSAP } from '../../../lib/gsap'
import { setupReveals } from '../../../lib/motion'
import { homeProjects, projectUrl, type Project } from '../../../lib/projects'
import { deferSetup } from '../../../lib/schedule'
import { CategoryChip } from '../../blog/PostCard'
import { Button } from '../../ui/Button'
import { Arrow } from '../../ui/Icon'
import { Section } from '../../ui/Section'
import { Label, Title } from '../../ui/Title'

/** Un caso: foto grande y, al lado, la marca, qué se hizo y el acceso al proyecto. Toda la tarjeta es un link. */
function CaseCard({ project, solo }: { project: Project; solo: boolean }) {
  return (
    <a
      href={projectUrl(project.slug)}
      data-cursor={proyectos.cursor}
      className={`group grid shrink-0 snap-start grid-cols-1 overflow-hidden rounded-4xl bg-brand-navy ring-1 ring-white/10 transition duration-500 ease-expo hover:ring-white/30 lg:grid-cols-12 ${solo ? 'w-full' : 'w-11/12 md:w-4/5 lg:w-3/4'}`}
    >
      <div className="relative aspect-4/3 overflow-hidden bg-brand-night lg:col-span-7 lg:aspect-auto lg:min-h-96 short:min-h-80">
        <img
          src={project.cover.src}
          alt={project.cover.alt}
          width={project.cover.width}
          height={project.cover.height}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 size-full object-cover transition-transform duration-1000 ease-expo group-hover:scale-105"
        />
      </div>
      <div className="flex flex-col gap-4 p-6 md:p-8 lg:col-span-5 lg:justify-center lg:p-10">
        {project.services.length > 0 && (
          <ul className="flex flex-wrap gap-1.5">
            {project.services.map((s) => (
              <li key={s}>
                <CategoryChip className="bg-white text-brand-deep">{s}</CategoryChip>
              </li>
            ))}
          </ul>
        )}
        <h3 className="font-display text-big text-white">{project.brand}</h3>
        {project.title && <p className="text-lg text-brand-haze">{project.title}</p>}
        <span className="mt-2 flex items-center gap-2 font-bold text-white">
          <span className="link-underline">{proyectos.view}</span>
          <Arrow className="size-4 transition-transform duration-500 ease-expo group-hover:rotate-45" />
        </span>
      </div>
    </a>
  )
}

/**
 * Proyectos (inicio): una tira horizontal de casos con foto grande (los primeros del orden elegido en el panel).
 * Con un solo proyecto, el caso ocupa todo el ancho; con más, se desliza con snap (dedo, trackpad o las flechas)
 * y el siguiente asoma a la derecha. Arriba, una frase y el acceso al portfolio completo.
 */
export function Proyectos() {
  const ref = useRef<HTMLElement>(null)
  const track = useRef<HTMLDivElement>(null)
  useGSAP((_, contextSafe) => deferSetup(contextSafe!(() => setupReveals(ref.current!))), { scope: ref })

  if (homeProjects.length === 0) return null
  const solo = homeProjects.length === 1

  const move = (dir: 1 | -1) => {
    const el = track.current
    if (!el) return
    const card = el.firstElementChild as HTMLElement | null
    el.scrollBy({ left: dir * ((card?.offsetWidth ?? el.clientWidth) + 20), behavior: 'smooth' })
  }

  return (
    <Section id={sections.proyectos} ref={ref} bg="night" className="flex min-h-svh flex-col justify-center overflow-hidden pt-20 pb-10 md:pt-28 md:pb-16 short:pt-20 short:pb-8">
      <div className="flex flex-col gap-5 px-5 md:px-10 lg:flex-row lg:items-end lg:justify-between lg:gap-10">
        <div className="flex flex-col gap-4">
          <Label tone="night">{proyectos.eyebrow}</Label>
          <Title title={proyectos.title} tone="night" />
        </div>
        <div data-reveal className="flex shrink-0 items-center gap-3">
          <Button href="/proyectos" label={proyectos.all} variant="white" cursor={proyectos.cursor} />
          {!solo && (
            <div className="hidden gap-2 lg:flex">
              {([-1, 1] as const).map((dir) => (
                <button
                  key={dir}
                  type="button"
                  onClick={() => move(dir)}
                  aria-label={dir < 0 ? 'Proyecto anterior' : 'Proyecto siguiente'}
                  className="grid size-12 place-items-center rounded-full bg-white/10 text-white ring-1 ring-white/15 transition duration-300 ease-expo hover:bg-white hover:text-brand-night active:scale-95"
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true" className={`size-5 fill-none stroke-current stroke-2 ${dir < 0 ? 'rotate-180' : ''}`} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div ref={track} data-reveal className="no-scrollbar mt-8 flex snap-x snap-mandatory scroll-px-5 gap-5 overflow-x-auto px-5 md:mt-10 md:scroll-px-10 md:px-10 short:mt-6">
        {homeProjects.map((p) => (
          <CaseCard key={p.slug} project={p} solo={solo} />
        ))}
      </div>
    </Section>
  )
}
