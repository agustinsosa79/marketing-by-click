import { useRef } from 'react'
import { nosotros, sections } from '../../../data/content'
import { useGSAP } from '../../../lib/gsap'
import { setupReveals } from '../../../lib/motion'
import { deferSetup } from '../../../lib/schedule'
import { Button } from '../../ui/Button'
import { Icon } from '../../ui/Icon'
import { Section } from '../../ui/Section'
import { Label, Title } from '../../ui/Title'
import { VideoPlayer } from '../../ui/VideoPlayer'

/**
 * Nosotros, sobre azul noche: el video de Ian con sonido es el protagonista; al lado, el título,
 * su frase y las dos formas de contacto. Las preguntas frecuentes van en su propia sección (blanca) debajo.
 */
export function Nosotros() {
  const ref = useRef<HTMLElement>(null)
  useGSAP((_, contextSafe) => deferSetup(contextSafe!(() => setupReveals(ref.current!))), { scope: ref })

  return (
    <Section id={sections.nosotros} ref={ref} bg="night" className="overflow-hidden px-5 pt-20 pb-20 md:px-10 md:pt-28 md:pb-28">
      <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-10">
        <div className="order-2 flex flex-col gap-6 lg:order-1 lg:col-span-5">
          <div className="flex flex-col gap-4">
            <Label tone="night">{nosotros.eyebrow}</Label>
            <Title title={nosotros.title} tone="night" />
          </div>
          <p data-reveal className="text-lead text-brand-haze">
            {nosotros.quote}
          </p>
          <div data-reveal className="flex flex-wrap items-center gap-3">
            <Button href={nosotros.cta.href} label={nosotros.cta.label} variant="signal" icon="whatsapp" cursor="Escribinos" />
            <a
              href={nosotros.instagram.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={nosotros.instagram.label}
              className="group flex items-center gap-3 rounded-full bg-white/5 p-1.5 ring-1 ring-white/10 transition duration-500 ease-expo hover:bg-white/10 md:pr-5"
            >
              <span className="grid size-10 place-items-center rounded-full bg-white text-brand-night transition-transform duration-500 ease-expo group-hover:-rotate-12">
                <Icon name="instagram" className="size-5" />
              </span>
              <span className="hidden text-sm leading-tight md:block">
                <span className="block font-bold">{nosotros.instagram.label}</span>
                <span className="block text-brand-haze">{nosotros.instagram.text}</span>
              </span>
            </a>
          </div>
        </div>

        <figure data-reveal className="order-1 lg:order-2 lg:col-span-7">
          <VideoPlayer src={nosotros.video.src} fallback={nosotros.video.fallback} poster={nosotros.video.poster} duration={nosotros.video.duration} label={nosotros.video.label} labels={nosotros.player} listenGlobalPlay />
        </figure>
      </div>

    </Section>
  )
}
