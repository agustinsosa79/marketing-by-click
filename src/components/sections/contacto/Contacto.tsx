import { useRef } from 'react'
import { contact, contacto, sections } from '../../../data/content'
import { useFitText } from '../../../hooks/useFitText'
import { useReducedMotion } from '../../../hooks/useReducedMotion'
import { gsap, useGSAP } from '../../../lib/gsap'
import { setupReveals } from '../../../lib/motion'
import { deferSetup } from '../../../lib/schedule'
import { Button } from '../../ui/Button'
import { Bubble, Icon } from '../../ui/Icon'
import { Section } from '../../ui/Section'
import { Label } from '../../ui/Title'

/**
 * Contacto sobre azul Clic: "¿Hablamos?" de borde a borde (letra por letra) y la invitación a la videollamada.
 * Burbujas del patrón de marca (manual Clic Studio) en dos esquinas, con un poco de parallax.
 * El footer se descubre por debajo.
 */
export function Contacto() {
  const ref = useRef<HTMLElement>(null)
  const word = useRef<HTMLHeadingElement>(null)
  const reduced = useReducedMotion()

  useFitText(word, 1)

  useGSAP(
    (_, contextSafe) =>
      deferSetup(
        contextSafe!(() => {
          setupReveals(ref.current!)
          if (reduced) return
          // las burbujas flotan a distinta velocidad mientras la sección pasa
          gsap.utils.toArray<HTMLElement>('[data-bubble]', ref.current).forEach((el) => {
            const speed = Number(el.dataset.bubble)
            gsap.fromTo(el, { yPercent: speed, rotate: speed / 10 }, { yPercent: -speed, rotate: -speed / 10, ease: 'none', scrollTrigger: { trigger: ref.current, start: 'top bottom', end: 'bottom top', scrub: true } })
          })
        }),
      ),
    { scope: ref, dependencies: [reduced] },
  )

  return (
    <Section id={sections.contacto} ref={ref} bg="deep" className="flex min-h-svh flex-col justify-center overflow-hidden px-5 pt-20 pb-8 md:px-10 md:pt-28 md:pb-14">
      {/* patrón de marca: naranja arriba a la derecha, azul noche abajo a la izquierda (detrás del contenido) */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div data-bubble="12" className="absolute top-14 -right-20 w-3/5 sm:w-1/2 md:-top-24 md:-right-24 lg:w-2/5 short:-top-32">
          <Bubble flip className="w-full fill-brand-signal" />
        </div>
        <div data-bubble="18" className="absolute -bottom-20 -left-16 w-1/2 sm:w-1/3 lg:w-1/4">
          <Bubble className="w-full fill-brand-night" />
        </div>
      </div>

      <div className="relative">
        <Label tone="deep">{contacto.eyebrow}</Label>

        <h2 ref={word} data-reveal="chars" className="mt-4 font-display leading-none whitespace-nowrap md:mt-6">
          <span data-fit-line className="inline-block pr-1">
            {contacto.title}
          </span>
        </h2>

        <div className="mt-8 grid grid-cols-1 items-end gap-8 md:mt-12 lg:grid-cols-12">
          <p data-reveal="lines" className="text-lead font-medium text-white lg:col-span-6">
            {contacto.text}
          </p>

          <div className="flex flex-col items-start gap-6 lg:col-span-5 lg:col-start-8 lg:items-end">
            <div data-reveal className="w-full md:w-auto">
              <Button href={contacto.button.href} label={contacto.button.label} size="lg" variant="white" icon="whatsapp" cursor={contacto.cursor} className="w-full md:w-auto" />
            </div>
            <ul data-reveal="rise" className="flex flex-wrap gap-x-8 gap-y-3 text-sm font-semibold">
              {[
                { ...contact.whatsapp, icon: 'whatsapp' as const },
                { ...contact.instagram, icon: 'instagram' as const },
              ].map((l) => (
                <li key={l.href}>
                  <a href={l.href} target="_blank" rel="noopener noreferrer" className="group flex items-center gap-2">
                    <Icon name={l.icon} className="size-4 transition-transform duration-500 ease-expo group-hover:-rotate-12" />
                    <span className="link-underline">{l.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

    </Section>
  )
}
