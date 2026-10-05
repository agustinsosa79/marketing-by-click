import { useRef, useState } from 'react'
import { faq, sections } from '../../../data/content'
import { useGSAP } from '../../../lib/gsap'
import { setupReveals } from '../../../lib/motion'
import { deferSetup } from '../../../lib/schedule'
import { Button } from '../../ui/Button'
import { Section } from '../../ui/Section'
import { Label, Title } from '../../ui/Title'

/**
 * Preguntas frecuentes: acordeón con una pregunta abierta a la vez.
 * Las preguntas y respuestas también van como datos estructurados FAQPage (entry-server.tsx).
 */
export function Faq() {
  const ref = useRef<HTMLElement>(null)
  // desktop: la primera abierta; mobile: todas cerradas (así la sección entra en una pantalla)
  const [open, setOpen] = useState(() => (typeof window !== 'undefined' && window.matchMedia('(min-width: 1024px)').matches ? 0 : -1))

  useGSAP((_, contextSafe) => deferSetup(contextSafe!(() => setupReveals(ref.current!))), { scope: ref })

  return (
    <Section id={sections.faq} ref={ref} bg="paper" className="flex min-h-svh flex-col justify-center px-5 pt-20 pb-8 md:px-10 md:pt-28 md:pb-14">
      <div className="grid grid-cols-1 gap-5 md:gap-8 lg:grid-cols-12 lg:gap-10">
        <div className="flex flex-col items-start gap-3 md:gap-4 lg:col-span-5 lg:gap-6">
          <Label>{faq.eyebrow}</Label>
          <Title title={faq.title} tone="paper" className="text-brand-deep" />
          <p data-reveal="rise" className="text-lead font-medium text-brand-night/75">
            {faq.text}
          </p>
          <div data-reveal="cta" className="hidden lg:block">
            <Button href={faq.cta.href} label={faq.cta.label} variant="signal" icon="whatsapp" cursor="Escribinos" />
          </div>
        </div>

        <ul className="flex flex-col border-t border-brand-deep/15 lg:col-span-7">
          {faq.items.map((item, i) => {
            const on = open === i
            return (
              <li key={item.q} data-reveal="rise" data-reveal-delay={i * 0.04} data-open={on || undefined} className="border-b border-brand-deep/15">
                <h3>
                  <button
                    type="button"
                    id={`faq-q-${i}`}
                    aria-expanded={on}
                    aria-controls={`faq-a-${i}`}
                    onClick={() => setOpen(on ? -1 : i)}
                    className="group flex w-full items-center justify-between gap-6 py-3 text-left md:py-5"
                  >
                    <span className={`text-base font-bold transition-colors duration-300 md:text-xl ${on ? 'text-brand-signal' : 'text-brand-deep group-hover:text-brand-signal'}`}>{item.q}</span>
                    <span
                      aria-hidden="true"
                      className={`grid size-9 shrink-0 place-items-center rounded-full transition duration-500 ease-expo ${on ? 'rotate-45 bg-brand-signal text-white' : 'bg-white text-brand-deep ring-1 ring-brand-deep/15'}`}
                    >
                      <svg viewBox="0 0 24 24" className="size-4 fill-none stroke-current stroke-2" strokeLinecap="round">
                        <path d="M12 5v14M5 12h14" />
                      </svg>
                    </span>
                  </button>
                </h3>
                <div id={`faq-a-${i}`} role="region" aria-labelledby={`faq-q-${i}`} className="accordion-panel">
                  <div>
                    <p className={`pr-12 pb-5 text-sm leading-relaxed text-brand-night/75 transition duration-500 md:text-base ${on ? 'opacity-100' : 'opacity-0'}`}>{item.a}</p>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>

        <div className="lg:hidden">
          <Button href={faq.cta.href} label={faq.cta.label} variant="signal" icon="whatsapp" cursor="Escribinos" />
        </div>
      </div>
    </Section>
  )
}
