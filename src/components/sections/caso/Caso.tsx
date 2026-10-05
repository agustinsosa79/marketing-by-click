import { useRef } from 'react'
import { caso, sections } from '../../../data/content'
import { useReducedMotion } from '../../../hooks/useReducedMotion'
import { gsap, useGSAP } from '../../../lib/gsap'
import { setupReveals } from '../../../lib/motion'
import { deferSetup } from '../../../lib/schedule'
import { Button } from '../../ui/Button'
import { Section } from '../../ui/Section'
import { Label, Title } from '../../ui/Title'

// mockup grande a la izquierda, logo y versión reducida apiladas a la derecha (desktop)
const TILE = ['lg:col-span-2 lg:row-span-1', 'lg:col-span-2 lg:row-span-1', 'lg:col-span-3 lg:row-span-2 lg:col-start-1 lg:row-start-1']

/** Caso de éxito: la identidad del Hostel El Duende Errante, en tres piezas reales. */
export function Caso() {
  const ref = useRef<HTMLElement>(null)
  const reduced = useReducedMotion()

  useGSAP(
    (_, contextSafe) =>
      deferSetup(
        contextSafe!(() => {
          setupReveals(ref.current!)
          if (reduced) return
          // cada pieza se mueve a su velocidad: profundidad sin efectos de más
          gsap.utils.toArray<HTMLElement>('[data-caso-tile]', ref.current).forEach((tile, i) => {
            gsap.fromTo(tile, { yPercent: 4 + i * 2 }, { yPercent: -(2 + i * 2), ease: 'none', scrollTrigger: { trigger: ref.current, start: 'top bottom', end: 'bottom top', scrub: true } })
          })
        }),
      ),
    { scope: ref, dependencies: [reduced] },
  )

  return (
    <Section id={sections.caso} ref={ref} bg="night" className="flex min-h-svh flex-col justify-center overflow-hidden px-5 pt-20 pb-8 md:px-10 md:pt-28 md:pb-14">
      <div className="grid grid-cols-1 items-center gap-6 md:gap-10 lg:grid-cols-12">
        <div className="flex flex-col gap-4 lg:col-span-5">
          <Label tone="night">{caso.eyebrow}</Label>
          <Title title={caso.title} tone="night" />
        </div>

        <div className="grid h-40 grid-cols-3 gap-2 md:h-72 md:gap-3 lg:col-span-7 lg:row-span-2 lg:h-gallery lg:grid-cols-5 lg:grid-rows-2">
          {caso.images.map((img, i) => (
            <figure key={img.src} data-caso-tile className={`group relative ${TILE[i]}`}>
              <div data-reveal="clip" className="relative size-full overflow-hidden rounded-2xl ring-1 ring-white/10 md:rounded-3xl">
                <img src={img.src} alt={img.alt} width={img.width} height={img.height} loading="lazy" decoding="async" className="size-full scale-125 object-cover transition-transform duration-1000 ease-expo group-hover:scale-110" />
              </div>
              <figcaption className="absolute bottom-2 left-2 rounded-full bg-white/90 px-2.5 py-1 text-xs font-bold text-brand-night backdrop-blur-sm md:bottom-4 md:left-4 md:px-3.5 md:text-sm">
                {img.caption}
              </figcaption>
            </figure>
          ))}
        </div>

        <div className="flex flex-col items-start gap-6 lg:col-span-5">
          <p data-reveal="lines" className="text-base font-medium text-brand-haze md:text-lead">
            {caso.text}
          </p>
          <div data-reveal="cta">
            <Button href={caso.cta.href} label={caso.cta.label} variant="signal" cursor="Escribinos" />
          </div>
        </div>
      </div>
    </Section>
  )
}
