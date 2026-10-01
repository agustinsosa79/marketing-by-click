import { useRef } from 'react'
import { MotionPathPlugin } from 'gsap/MotionPathPlugin'
import { historia, sections } from '../../../data/content'
import { useReducedMotion } from '../../../hooks/useReducedMotion'
import { gsap, ScrollTrigger, useGSAP } from '../../../lib/gsap'
import { setupReveals } from '../../../lib/motion'
import { deferSetup } from '../../../lib/schedule'
import { Isotipo } from '../../ui/Icon'
import { Odometer } from '../../ui/Odometer'
import { Section } from '../../ui/Section'
import { Label } from '../../ui/SectionTitle'

// Solo esta sección usa MotionPath: se registra acá (viaja en el chunk lazy, no en el principal)
gsap.registerPlugin(MotionPathPlugin)

/** Curva ascendente de izquierda a derecha (monótona en x: el recorte por x sigue al viajero). */
const PATH = 'M 30 250 C 260 250, 330 80, 560 130 S 880 250, 1170 50'

/**
 * Desde 1987: el año con odómetro y el recorrido "De la gráfica → al mundo digital":
 * una curva que se dibuja con el scroll y el isotipo de Clic (un cursor) viajando por ella.
 */
export function Historia() {
  const ref = useRef<HTMLElement>(null)
  const journey = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()

  useGSAP(
    (_, contextSafe) =>
      deferSetup(
        contextSafe!(() => {
          setupReveals(ref.current!)
          const box = journey.current!
          const path = box.querySelector<SVGPathElement>('[data-path]')!
          const fill = box.querySelector<SVGSVGElement>('[data-path-fill]')!
          const traveler = box.querySelector<HTMLElement>('[data-traveler]')!
          const arrival = ref.current!.querySelector<HTMLElement>('[data-arrival]')!
          const along = (end: number) => ({ path, align: path, alignOrigin: [0.5, 0.5], start: 0, end })

          if (reduced) {
            gsap.set(fill, { clipPath: 'inset(0% 0% 0% 0%)' })
            gsap.set(traveler, { motionPath: along(1) })
            return
          }

          // medidas cacheadas (se actualizan en cada refresh): nada de leer layout por frame
          let boxW = box.offsetWidth
          let half = traveler.offsetWidth / 2
          const measure = () => {
            boxW = box.offsetWidth
            half = traveler.offsetWidth / 2
          }
          ScrollTrigger.addEventListener('refresh', measure)

          const range = { trigger: box, start: 'top 80%', end: 'bottom 35%', scrub: 0.6, invalidateOnRefresh: true }
          gsap.fromTo(
            traveler,
            { motionPath: along(0) },
            {
              motionPath: along(1),
              ease: 'none',
              scrollTrigger: range,
              // la curva se "dibuja" hasta donde está el isotipo
              onUpdate: () => {
                const x = gsap.getProperty(traveler, 'x') as number
                const right = Math.max(0, Math.min(100, (1 - (x + half) / boxW) * 100))
                fill.style.clipPath = `inset(0% ${right}% 0% 0%)`
              },
            },
          )
          gsap.fromTo(arrival, { opacity: 0.25 }, { opacity: 1, ease: 'none', scrollTrigger: { ...range, start: 'center 60%', end: 'bottom 35%' } })
          return () => ScrollTrigger.removeEventListener('refresh', measure)
        }),
      ),
    { scope: ref, dependencies: [reduced] },
  )

  return (
    <Section id={sections.historia} ref={ref} bg="deep" className="overflow-hidden px-5 py-28 md:px-10 md:py-40">
      <div className="relative flex flex-col items-center text-center">
        <Label tone="dark">{historia.eyebrow}</Label>
        <p data-reveal="lines" className="mt-8 font-accent text-huge text-brand-sky">
          {historia.since}
        </p>
        <p className="font-display text-mega tabular-nums">
          <Odometer value={historia.year} />
        </p>
      </div>

      {/* Recorrido: de la gráfica al mundo digital */}
      <div className="relative mt-16 md:mt-24">
        <p data-arrival className="text-right font-display text-big text-brand-sky">
          {historia.to}
        </p>

        <div ref={journey} className="relative my-6 md:my-8">
          <svg viewBox="0 0 1200 300" aria-hidden="true" className="h-auto w-full overflow-visible">
            <path d={PATH} className="fill-none stroke-white/20" strokeWidth="3" strokeDasharray="2 14" strokeLinecap="round" />
            <path data-path d={PATH} className="fill-none stroke-transparent" strokeWidth="3" />
          </svg>
          <svg
            data-path-fill
            viewBox="0 0 1200 300"
            aria-hidden="true"
            className="absolute inset-0 h-auto w-full overflow-visible"
            style={{ clipPath: 'inset(0% 100% 0% 0%)' }}
          >
            <path d={PATH} className="fill-none stroke-brand-sky" strokeWidth="4" strokeLinecap="round" />
          </svg>
          <span data-traveler aria-hidden="true" className="absolute top-0 left-0 grid size-11 place-items-center rounded-full bg-brand-sky text-brand-night md:size-16">
            <Isotipo className="w-5 md:w-7" />
          </span>
        </div>

        <p data-reveal="fade" className="font-accent text-huge">
          {historia.from}
        </p>
      </div>
    </Section>
  )
}
