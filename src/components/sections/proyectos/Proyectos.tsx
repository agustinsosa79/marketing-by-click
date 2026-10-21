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

/**
 * Un caso. `wide`: foto a la izquierda y texto a la derecha (ocupa toda la fila).
 * Si no, foto arriba y texto abajo (media fila). Toda la tarjeta es un link.
 */
function CaseCard({ project, wide }: { project: Project; wide: boolean }) {
  return (
    <a
      href={projectUrl(project.slug)}
      data-cursor={proyectos.cursor}
      className={`group grid h-full grid-cols-1 overflow-hidden rounded-4xl bg-brand-navy ring-1 ring-white/10 transition duration-500 ease-expo hover:-translate-y-1 hover:ring-white/30 ${wide ? 'lg:grid-cols-12' : ''}`}
    >
      <div className={`relative overflow-hidden bg-brand-night ${wide ? 'aspect-4/3 lg:col-span-7 lg:aspect-auto lg:min-h-96' : 'aspect-video'}`}>
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
      <div className={`flex flex-col gap-3 p-6 md:p-8 ${wide ? 'lg:col-span-5 lg:justify-center lg:p-10' : ''}`}>
        {project.services.length > 0 && (
          <ul className="flex flex-wrap gap-1.5">
            {project.services.map((s) => (
              <li key={s}>
                <CategoryChip className="bg-white text-brand-deep">{s}</CategoryChip>
              </li>
            ))}
          </ul>
        )}
        <h3 className={`font-display text-white ${wide ? 'text-big' : 'text-3xl md:text-4xl'}`}>{project.brand}</h3>
        {project.title && <p className="text-lg text-brand-haze">{project.title}</p>}
        <span className="mt-auto flex items-center gap-2 pt-2 font-bold text-white">
          <span className="link-underline">{proyectos.view}</span>
          <Arrow className="size-4 transition-transform duration-500 ease-expo group-hover:rotate-45" />
        </span>
      </div>
    </a>
  )
}

/**
 * Proyectos (inicio), sobre azul noche: los que el cliente elige en el panel (hasta 4).
 * La grilla se arma según cuántos haya: 1 → caso a todo el ancho · 2 → dos columnas
 * · 3 → el primero ancho y dos debajo · 4 → 2×2. Arriba, el acceso al portfolio completo.
 */
export function Proyectos() {
  const ref = useRef<HTMLElement>(null)
  useGSAP((_, contextSafe) => deferSetup(contextSafe!(() => setupReveals(ref.current!))), { scope: ref })

  const count = homeProjects.length
  if (count === 0) return null
  // la fila completa: si hay uno solo, o el primero cuando son tres
  const isWide = (i: number) => count === 1 || (count === 3 && i === 0)

  return (
    <Section id={sections.proyectos} ref={ref} bg="night" className="px-5 pt-24 pb-20 md:px-10 md:pt-32 md:pb-28">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between lg:gap-10">
        <div className="flex flex-col gap-4">
          <Label tone="night">{proyectos.eyebrow}</Label>
          <Title title={proyectos.title} tone="night" />
        </div>
        <div data-reveal className="shrink-0">
          <Button href="/proyectos" label={proyectos.all} variant="white" cursor={proyectos.cursor} />
        </div>
      </div>

      <ul className="mt-10 grid grid-cols-1 gap-5 md:mt-14 md:grid-cols-2 md:gap-6">
        {homeProjects.map((p, i) => (
          <li key={p.slug} data-reveal data-reveal-delay={i * 0.08} className={isWide(i) ? 'md:col-span-2' : ''}>
            <CaseCard project={p} wide={isWide(i)} />
          </li>
        ))}
      </ul>
    </Section>
  )
}
