import { useRef } from 'react'
import { nosotros, sections } from '../../../data/content'
import { useReducedMotion } from '../../../hooks/useReducedMotion'
import { gsap, useGSAP } from '../../../lib/gsap'
import { setupReveals } from '../../../lib/motion'
import { deferSetup } from '../../../lib/schedule'
import { Button } from '../../ui/Button'
import { Arrow, Icon } from '../../ui/Icon'
import { Section } from '../../ui/Section'
import { Label, Title } from '../../ui/Title'
import { VideoPlayer } from '../../ui/VideoPlayer'

/**
 * Nosotros (une manifiesto, historia y fundador): el video de Ian con sonido es el protagonista;
 * al lado, tres frases que cuentan quiénes somos y el Instagram de Ian.
 */
export function Nosotros() {
  const ref = useRef<HTMLElement>(null)
  const reduced = useReducedMotion()

  useGSAP(
    (_, contextSafe) =>
      deferSetup(
        contextSafe!(() => {
          setupReveals(ref.current!)
          if (reduced) return
          // el video entra como una tarjeta que se endereza y se acerca
          gsap.fromTo(
            '[data-nosotros-video]',
            { yPercent: 12, rotate: 2.5, scale: 0.92 },
            { yPercent: 0, rotate: 0, scale: 1, ease: 'none', scrollTrigger: { trigger: ref.current, start: 'top bottom', end: 'top 15%', scrub: true } },
          )
        }),
      ),
    { scope: ref, dependencies: [reduced] },
  )

  return (
    <Section id={sections.nosotros} ref={ref} bg="night" className="flex min-h-svh flex-col justify-center overflow-hidden px-5 pt-20 pb-8 md:px-10 md:pt-28 md:pb-14">
      <div className="relative grid grid-cols-1 items-center gap-6 md:gap-8 lg:grid-cols-12 lg:gap-10">
        <div className="order-2 flex flex-col gap-5 md:gap-8 lg:order-1 lg:col-span-5">
          <div className="flex flex-col gap-4">
            <Label tone="night">{nosotros.eyebrow}</Label>
            <Title title={nosotros.title} tone="night" />
          </div>

          <ul className="flex flex-col">
            {nosotros.points.map((point) => (
              <li key={point} data-reveal="rise" className="flex items-start gap-4 border-t border-white/10 py-2.5 text-sm font-medium text-brand-haze md:py-4 md:text-lg">
                <span aria-hidden="true" className="mt-1 grid size-6 shrink-0 place-items-center rounded-full bg-brand-signal/20 text-brand-signal md:mt-1.5">
                  <Arrow className="size-3.5" />
                </span>
                {point}
              </li>
            ))}
          </ul>

          <div data-reveal="rise" className="flex flex-wrap items-center gap-3">
            <Button href={nosotros.cta.href} label={nosotros.cta.label} variant="signal" icon="whatsapp" cursor="Escribinos" />
            <a
              href={nosotros.instagram.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={nosotros.instagram.label}
              className="group flex items-center gap-4 rounded-full bg-white/5 p-1.5 ring-1 ring-white/10 transition duration-500 ease-expo hover:bg-white/10 md:py-2 md:pr-5 md:pl-2"
            >
              <span className="grid size-10 place-items-center rounded-full bg-brand-signal text-white transition-transform duration-500 ease-expo group-hover:-rotate-12">
                <Icon name="instagram" className="size-5" />
              </span>
              <span className="hidden text-sm leading-tight md:block">
                <span className="block font-bold">{nosotros.instagram.label}</span>
                <span className="block text-brand-haze">{nosotros.instagram.text}</span>
              </span>
            </a>
          </div>
        </div>

        <figure className="order-1 lg:order-2 lg:col-span-7">
          <div data-nosotros-video>
            <VideoPlayer src={nosotros.video.src} poster={nosotros.video.poster} label={nosotros.video.label} labels={nosotros.player} listenGlobalPlay />
          </div>
          <figcaption data-reveal="rise" className="mt-5 hidden text-lead font-medium text-brand-haze lg:block">
            {nosotros.quote}
          </figcaption>
        </figure>
      </div>
    </Section>
  )
}
