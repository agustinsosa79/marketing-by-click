import { useRef } from 'react'
import { asesoria, contact, cta, sections } from '../../../data/content'
import { useFitText } from '../../../hooks/useFitText'
import { useReducedMotion } from '../../../hooks/useReducedMotion'
import { gsap, useGSAP } from '../../../lib/gsap'
import { setupReveals } from '../../../lib/motion'
import { Button } from '../../ui/Button'
import { Icon, Isotipo } from '../../ui/Icon'
import { Section } from '../../ui/Section'
import { Label } from '../../ui/SectionTitle'
import { deferSetup } from '../../../lib/schedule'

/**
 * CTA final sobre brand-sky: "¿HABLAMOS?" de borde a borde (letra por letra), la pregunta real de Asesoría
 * y un botón magnético grande. Fondo y texto propios (no los de página): el footer pasa por debajo.
 */
export function CtaFinal() {
  const ref = useRef<HTMLElement>(null)
  const word = useRef<HTMLHeadingElement>(null)
  const reduced = useReducedMotion()

  useFitText(word, 1)

  useGSAP(
    (_, contextSafe) =>
      // armado diferido: no compite con el preloader (lib/schedule.ts)
      deferSetup(
        contextSafe!(() => {
          setupReveals(ref.current!)
          if (reduced) return
          gsap.fromTo(
            '[data-cta-mark]',
            { rotate: -30, yPercent: 30 },
            { rotate: 20, yPercent: -20, ease: 'none', scrollTrigger: { trigger: ref.current, start: 'top bottom', end: 'bottom top', scrub: true } },
          )
        }),
      ),
    { scope: ref, dependencies: [reduced] },
  )

  return (
    <Section id={sections.contacto} ref={ref} bg="sky" ownColors className="overflow-hidden bg-brand-sky px-5 pt-28 pb-24 text-brand-night md:px-10 md:pt-36 md:pb-32">
      <div data-cta-mark aria-hidden="true" className="pointer-events-none absolute -right-24 -bottom-24 w-3/4 text-brand-night/10 md:w-2/5">
        <Isotipo />
      </div>

      <div className="relative">
        <Label>{cta.eyebrow}</Label>

        <h2 ref={word} data-reveal="chars" className="mt-8 font-display leading-none whitespace-nowrap md:mt-12">
          <span data-fit-line className="inline-block">
            {cta.question}
          </span>
        </h2>

        <div className="mt-12 grid gap-12 md:mt-16 lg:grid-cols-12 lg:gap-8">
          <div className="flex flex-col gap-6 lg:col-span-6">
            <p data-reveal="fade" className="text-lead font-bold tracking-tight">
              {asesoria.question}
            </p>
            <p data-reveal="rise" data-reveal-delay="0.08" className="text-base leading-relaxed md:text-lg">
              {asesoria.text}
            </p>
            <p data-reveal="rise" data-reveal-delay="0.14" className="text-label font-semibold">
              {asesoria.invite}
            </p>
          </div>

          <div className="flex flex-col items-start gap-8 lg:col-span-5 lg:col-start-8">
            <p data-reveal="lines" className="font-display text-big">
              {cta.title}
            </p>
            <p data-reveal="fade" className="font-accent text-3xl md:text-4xl">
              {cta.text}
            </p>
            <div data-reveal="cta">
              <Button href={cta.button.href} label={cta.button.label} size="lg" variant="night" icon="whatsapp" cursor={cta.cursor} magnetic />
            </div>
            <ul data-reveal="fade" className="flex flex-wrap gap-x-8 gap-y-3 text-label font-semibold">
              <li>
                <a href={contact.whatsapp.href} target="_blank" rel="noopener noreferrer" className="group flex items-center gap-2">
                  <Icon name="whatsapp" className="size-4 transition-transform duration-500 ease-expo group-hover:-rotate-12" />
                  <span className="link-underline">{contact.whatsapp.label}</span>
                </a>
              </li>
              <li>
                <a href={contact.instagram.href} target="_blank" rel="noopener noreferrer" className="group flex items-center gap-2">
                  <Icon name="instagram" className="size-4 transition-transform duration-500 ease-expo group-hover:-rotate-12" />
                  <span className="link-underline">{contact.instagram.label}</span>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </Section>
  )
}
