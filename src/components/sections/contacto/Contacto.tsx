import { useRef } from 'react'
import { contact, contacto, sections } from '../../../data/content'
import { useFitText } from '../../../hooks/useFitText'
import { useReducedMotion } from '../../../hooks/useReducedMotion'
import { gsap, useGSAP } from '../../../lib/gsap'
import { setupReveals } from '../../../lib/motion'
import { deferSetup } from '../../../lib/schedule'
import { Button } from '../../ui/Button'
import { Icon } from '../../ui/Icon'
import { Pointer } from '../../ui/Pointer'
import { Section } from '../../ui/Section'
import { Label } from '../../ui/Title'

/**
 * Contacto sobre azul Clic: "¿Hablamos?" de borde a borde (letra por letra) y la invitación a la videollamada.
 * Cierre de la firma "by Clic": el mismo cursor del preloader entra y hace clic sobre el botón (una vez, al llegar).
 * El footer se descubre por debajo.
 */
export function Contacto() {
  const ref = useRef<HTMLElement>(null)
  const word = useRef<HTMLHeadingElement>(null)
  const cta = useRef<HTMLDivElement>(null)
  const cursor = useRef<HTMLDivElement>(null)
  const ring = useRef<HTMLSpanElement>(null)
  const reduced = useReducedMotion()

  useFitText(word, 1)

  useGSAP(
    (_, contextSafe) =>
      deferSetup(
        contextSafe!(() => {
          setupReveals(ref.current!)
          if (reduced || !window.matchMedia('(min-width: 768px)').matches) return
          gsap.set(cursor.current!.querySelector('svg'), { xPercent: -12.5, yPercent: -8.33 })
          gsap.set(ring.current, { xPercent: -50, yPercent: -50, scale: 0 })

          // Punto del clic: un poco a la izquierda del centro del botón, relativo a la sección
          const point = () => {
            const s = ref.current!.getBoundingClientRect()
            const b = cta.current!.getBoundingClientRect()
            return { x: b.left - s.left + b.width * 0.4, y: b.top - s.top + b.height * 0.55, w: s.width, h: s.height }
          }

          gsap
            .timeline({ scrollTrigger: { trigger: cta.current, start: 'top 70%', once: true }, delay: 0.6 })
            .call(() => {
              const p = point()
              gsap.set([cursor.current, ring.current], { x: p.x, y: p.y })
            })
            .fromTo(cursor.current, { autoAlpha: 0, xPercent: 520, yPercent: 360, rotate: 14 }, { autoAlpha: 1, xPercent: 0, yPercent: 0, rotate: 0, duration: 1, ease: 'power3.inOut' })
            .to(cursor.current, { scale: 0.78, duration: 0.11, ease: 'power2.in' })
            .to(cursor.current, { scale: 1, duration: 0.55, ease: 'elastic.out(1, 0.45)' })
            .fromTo(ring.current, { scale: 0, autoAlpha: 1 }, { scale: 3, autoAlpha: 0, duration: 0.8, ease: 'power2.out' }, '<-0.05')
            .fromTo(cta.current, { scale: 1 }, { scale: 1.04, duration: 0.18, yoyo: true, repeat: 1, ease: 'power2.out' }, '<')
            .to(cursor.current, { autoAlpha: 0, y: '+=24', duration: 0.5, ease: 'power2.in' }, '+=0.5')
        }),
      ),
    { scope: ref, dependencies: [reduced] },
  )

  return (
    <Section id={sections.contacto} ref={ref} bg="deep" className="flex min-h-svh flex-col justify-center overflow-hidden px-5 pt-20 pb-8 md:px-10 md:pt-28 md:pb-14">
      <div className="relative">
        <Label tone="deep">{contacto.eyebrow}</Label>

        <h2 ref={word} data-reveal="chars" className="mt-4 font-display leading-none whitespace-nowrap md:mt-6">
          <span data-fit-line className="inline-block pr-1">
            {contacto.title}
          </span>
        </h2>

        <div className="mt-8 grid grid-cols-1 items-end gap-8 md:mt-12 lg:grid-cols-12">
          <p data-reveal="lines" className="text-lead font-medium text-brand-haze lg:col-span-6">
            {contacto.text}
          </p>

          <div className="flex flex-col items-start gap-6 lg:col-span-5 lg:col-start-8 lg:items-end">
            <div ref={cta} data-reveal="cta" className="w-full md:w-auto">
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

      {/* firma "by Clic": cursor + onda (solo desktop, una vez) */}
      <span ref={ring} aria-hidden="true" className="pointer-events-none absolute top-0 left-0 block size-20 scale-0 rounded-full border-2 border-white" />
      <div ref={cursor} aria-hidden="true" className="pointer-events-none invisible absolute top-0 left-0 w-14">
        <Pointer className="block w-full overflow-visible" />
      </div>
    </Section>
  )
}
