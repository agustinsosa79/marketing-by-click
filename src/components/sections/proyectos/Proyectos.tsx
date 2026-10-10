import { useRef } from 'react'
import { proyectos, sections } from '../../../data/content'
import { useGSAP } from '../../../lib/gsap'
import { setupReveals } from '../../../lib/motion'
import { HOME_LIMIT, homeProjects } from '../../../lib/projects'
import { deferSetup } from '../../../lib/schedule'
import { ProjectCard } from '../../projects/ProjectCard'
import { Button } from '../../ui/Button'
import { Section } from '../../ui/Section'
import { Label, Title } from '../../ui/Title'

/** Acceso al portfolio completo: siempre visible, es la salida principal de la sección. */
function AllProjectsButton() {
  return <Button href="/proyectos" label={proyectos.all} variant="white" cursor={proyectos.cursor} />
}

/** Completa la grilla mientras haya menos proyectos que lugares: invita a ser el próximo. */
function NextProjectCard() {
  return (
    <article className="flex h-full min-h-72 flex-col justify-between gap-8 rounded-4xl border-2 border-dashed border-white/20 bg-brand-navy/40 p-6 md:p-8">
      <span aria-hidden="true" className="grid size-14 place-items-center rounded-2xl bg-white/10 font-display text-3xl text-brand-haze">
        +
      </span>
      <div className="flex flex-col items-start gap-4">
        <h3 className="font-display text-3xl text-white md:text-4xl">{proyectos.next.title}</h3>
        <p className="text-base text-brand-haze md:text-lg">{proyectos.next.text}</p>
        <Button href={proyectos.next.cta.href} label={proyectos.next.cta.label} variant="signal" icon="whatsapp" cursor="Escribinos" />
      </div>
    </article>
  )
}

// Proporción de las portadas según cuántas columnas hay (la sección entra en una pantalla)
const IMAGE: Record<number, string> = {
  2: 'aspect-4/3 lg:aspect-2/1 short:aspect-5/2',
  3: 'aspect-4/3 lg:aspect-3/2 short:aspect-2/1',
}

/**
 * Proyectos (inicio): portfolio en tarjetas. Los primeros del orden elegido en el panel (hasta HOME_LIMIT),
 * cada uno en su tarjeta, + el botón al portfolio completo. Si todavía hay menos proyectos que lugares,
 * la grilla se completa con una tarjeta para ser el próximo (nunca queda un hueco).
 */
export function Proyectos() {
  const ref = useRef<HTMLElement>(null)
  useGSAP((_, contextSafe) => deferSetup(contextSafe!(() => setupReveals(ref.current!))), { scope: ref })

  if (homeProjects.length === 0) return null
  const withNext = homeProjects.length < HOME_LIMIT
  const columns = Math.min(HOME_LIMIT, homeProjects.length + (withNext ? 1 : 0))

  return (
    <Section id={sections.proyectos} ref={ref} bg="night" className="flex min-h-svh flex-col justify-center overflow-hidden px-5 pt-20 pb-8 md:px-10 md:pt-28 md:pb-14 short:pt-20 short:pb-8">
      <div className="grid grid-cols-1 items-end gap-5 lg:grid-cols-12 lg:gap-10">
        <div className="flex flex-col gap-4 lg:col-span-7">
          <Label tone="night">{proyectos.eyebrow}</Label>
          <Title title={proyectos.title} tone="night" />
        </div>
        <div className="flex flex-col items-start gap-5 lg:col-span-5">
          <p data-reveal="rise" className="text-base font-medium text-brand-haze md:text-lead">
            {proyectos.text}
          </p>
          <div data-reveal="cta">
            <AllProjectsButton />
          </div>
        </div>
      </div>

      <ul className={`mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5 lg:mt-6 short:mt-5 ${columns === 3 ? 'lg:grid-cols-3' : ''}`}>
        {homeProjects.map((p, i) => (
          <li key={p.slug} data-reveal="fade" data-reveal-delay={i * 0.08}>
            <ProjectCard project={p} tone="night" boxed imageClass={IMAGE[columns] ?? IMAGE[2]} />
          </li>
        ))}
        {withNext && (
          <li data-reveal="fade" data-reveal-delay={homeProjects.length * 0.08}>
            <NextProjectCard />
          </li>
        )}
      </ul>

      {/* Celular: las tarjetas van una debajo de otra; el acceso al portfolio también queda al final */}
      <div className="mt-8 md:hidden">
        <AllProjectsButton />
      </div>
    </Section>
  )
}
