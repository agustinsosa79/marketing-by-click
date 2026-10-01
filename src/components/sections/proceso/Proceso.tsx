import { useRef } from 'react'
import { proceso, sections } from '../../../data/content'
import { useReducedMotion } from '../../../hooks/useReducedMotion'
import { gsap, useGSAP } from '../../../lib/gsap'
import { setupReveals } from '../../../lib/motion'
import { deferSetup } from '../../../lib/schedule'
import { Section } from '../../ui/Section'
import { Label, SectionTitle } from '../../ui/SectionTitle'

const steps = proceso.steps
const firstGroup = steps[0].group
const groups = [
  { label: firstGroup, count: steps.filter((s) => s.group === firstGroup).length },
  { label: steps[steps.length - 1].group, count: steps.filter((s) => s.group !== firstGroup).length },
]

/** Íconos de línea para los meses siguientes (en el mismo orden que el copy). */
const FOLLOWING_ICONS = [
  <path key="a" d="M5 6h14v13H5zM5 10h14M9 3v4M15 3v4" />,
  <path key="b" d="M4 10v4h3l6 4V6l-6 4H4zM17 9a4 4 0 0 1 0 6" />,
  <path key="c" d="M4 19V9M10 19V5M16 19v-7M21 19H3" />,
  <path key="d" d="M20 12a8 8 0 1 1-2.3-5.7M20 4v5h-5" />,
]

/**
 * Proceso como línea de tiempo (sin cards apiladas ni numeración genérica):
 *  - desktop: horizontal, con las dos etapas arriba; mobile: vertical
 *  - una línea celeste se llena con el scroll y cada paso se enciende cuando la línea lo alcanza
 */
export function Proceso() {
  const ref = useRef<HTMLElement>(null)
  const timeline = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()

  useGSAP(
    (_, contextSafe) =>
      deferSetup(
        contextSafe!(() => {
          setupReveals(ref.current!)
          const nodes = gsap.utils.toArray<HTMLElement>('[data-node]', ref.current)
          const activate = (progress: number) =>
            nodes.forEach((node, i) => {
              const on = progress >= (i + 0.4) / nodes.length
              if (on !== node.hasAttribute('data-on')) node.toggleAttribute('data-on', on)
            })

          if (reduced) {
            activate(1)
            gsap.set('[data-fill-x], [data-fill-y]', { scale: 1 })
            return
          }

          const mm = gsap.matchMedia()
          mm.add({ desktop: '(min-width: 768px)', mobile: '(max-width: 767px)' }, (ctx) => {
            const desktop = !!ctx.conditions?.desktop
            const fill = ref.current!.querySelector(desktop ? '[data-fill-x]' : '[data-fill-y]')
            gsap.fromTo(
              fill,
              desktop ? { scaleX: 0 } : { scaleY: 0 },
              {
                ...(desktop ? { scaleX: 1 } : { scaleY: 1 }),
                ease: 'none',
                scrollTrigger: {
                  trigger: timeline.current,
                  start: desktop ? 'top 75%' : 'top 70%',
                  end: desktop ? 'bottom 45%' : 'bottom 70%',
                  scrub: 0.5,
                  onUpdate: (self) => activate(self.progress),
                },
              },
            )
          })
          return () => mm.revert()
        }),
      ),
    { scope: ref, dependencies: [reduced] },
  )

  return (
    <Section id={sections.proceso} ref={ref} bg="night" className="overflow-hidden px-5 py-28 md:px-10 md:py-40">
      <div className="relative grid gap-6 md:grid-cols-12 md:items-end">
        <div className="md:col-span-9">
          <Label tone="dark">{proceso.eyebrow}</Label>
          <SectionTitle text={proceso.title} className="mt-6 font-display text-giant" />
        </div>
        <p data-reveal="fade" className="font-accent text-big text-brand-sky md:col-span-3 md:text-right md:text-huge">
          {proceso.month}
        </p>
      </div>

      {/* Línea de tiempo del mes inicial */}
      <div ref={timeline} data-reveal="fade" className="relative mt-14 border-y border-white/20 py-6 md:mt-20 md:py-10 lg:py-12">
        {/* Etapas (desktop) */}
        <div className="mb-10 hidden grid-cols-7 gap-4 md:grid">
          {groups.map((g) => (
            <div key={g.label} className={g.count === 4 ? 'col-span-4' : 'col-span-3'}>
              <span className="text-label font-semibold uppercase text-brand-paper/75">
                {g.label}
              </span>
              <span aria-hidden="true" className="mt-4 block h-3 rounded-t-xl border-x border-t border-white/20" />
            </div>
          ))}
        </div>

        <div className="relative">
          {/* Riel + relleno: horizontal en desktop, vertical en mobile */}
          <div aria-hidden="true" className="absolute top-8 right-1/14 left-1/14 hidden h-1 -translate-y-1/2 overflow-hidden rounded-full bg-brand-deep md:block">
            <div data-fill-x className="size-full origin-left scale-x-0 rounded-full bg-brand-sky" />
          </div>
          <div aria-hidden="true" className="absolute top-7 bottom-7 left-7 w-1 -translate-x-1/2 overflow-hidden rounded-full bg-brand-deep md:hidden">
            <div data-fill-y className="size-full origin-top scale-y-0 rounded-full bg-brand-sky" />
          </div>

          <ol className="relative grid gap-7 md:grid-cols-7 md:gap-4">
            {steps.map((step) => (
              <li key={step.name} data-node className="group flex items-center gap-5 md:flex-col md:gap-5 md:text-center">
                <span className="relative grid size-14 shrink-0 place-items-center md:size-16">
                  {/* halo que se enciende cuando la línea llega */}
                  <span
                    aria-hidden="true"
                    className="absolute -inset-2 scale-75 rounded-full bg-brand-sky/15 opacity-0 transition duration-700 ease-expo group-data-on:scale-100 group-data-on:opacity-100"
                  />
                  <span aria-hidden="true" className="absolute inset-0 rounded-full bg-brand-night ring-2 ring-white/15" />
                  <img
                    src={step.icon}
                    alt=""
                    width={160}
                    height={160}
                    loading="lazy"
                    decoding="async"
                    className="relative size-full scale-90 opacity-50 transition duration-700 ease-expo group-data-on:scale-100 group-data-on:opacity-100"
                  />
                </span>
                <span className="flex flex-col gap-1">
                  <h3 className="text-base leading-snug font-bold opacity-55 transition-opacity duration-700 group-data-on:opacity-100 md:text-lg">{step.name}</h3>
                  <span className="text-label font-medium text-brand-sky md:hidden">{step.group}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* Meses siguientes */}
      <div className="relative mt-16 grid gap-8 md:mt-24 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-4">
          <h3 data-reveal="lines" className="font-display text-big">
            {proceso.following.title}
          </h3>
          <p data-reveal="fade" className="mt-6 font-accent text-3xl text-brand-sky md:text-4xl">
            {proceso.report}
          </p>
        </div>
        <ul className="grid gap-4 sm:grid-cols-2 lg:col-span-8">
          {proceso.following.items.map((item, i) => (
            <li
              key={item}
              data-reveal="fade"
              data-reveal-delay={i * 0.06}
              className="group flex gap-4 border-t border-white/20 py-5 transition-transform duration-500 ease-expo md:py-6 md:hover:translate-x-1"
            >
              <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-brand-sky text-brand-night transition-transform duration-500 ease-expo group-hover:-rotate-6">
                <svg viewBox="0 0 24 24" aria-hidden="true" className="size-5 fill-none stroke-current stroke-2" strokeLinecap="round" strokeLinejoin="round">
                  {FOLLOWING_ICONS[i]}
                </svg>
              </span>
              <p className="text-base leading-relaxed">{item}</p>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  )
}
