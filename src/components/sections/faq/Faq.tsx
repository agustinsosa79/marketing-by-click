import { useRef, useState } from 'react'
import { faq, sections } from '../../../data/content'
import { useGSAP } from '../../../lib/gsap'
import { setupReveals } from '../../../lib/motion'
import { deferSetup } from '../../../lib/schedule'
import { Button } from '../../ui/Button'
import { Section } from '../../ui/Section'
import { Label, Title } from '../../ui/Title'

/**
 * Preguntas frecuentes, en su propia sección blanca (entre Nosotros en azul noche y Contacto en azul Clic):
 * acordeón con una pregunta abierta a la vez. Las preguntas y respuestas también van como datos
 * estructurados FAQPage (entry-server.tsx).
 */
export function Faq() {
  const ref = useRef<HTMLElement>(null)
  // desktop: la primera abierta; mobile: todas cerradas (la lista se lee de un vistazo)
  const [open, setOpen] = useState(() => (typeof window !== 'undefined' && window.matchMedia('(min-width: 1024px)').matches ? 0 : -1))

  useGSAP((_, contextSafe) => deferSetup(contextSafe!(() => setupReveals(ref.current!))), { scope: ref })

  return (
    <Section id={sections.faq} ref={ref} bg="paper" className="px-5 pt-24 pb-20 md:px-10 md:pt-32 md:pb-28">
      <div className="grid grid-cols-1 gap-6 md:gap-8 lg:grid-cols-12 lg:gap-10">
        <div className="flex flex-col items-start gap-4 lg:col-span-5 lg:gap-6">
          <Label>{faq.eyebrow}</Label>
          <Title title={faq.title} tone="paper" />
          <div data-reveal className="hidden lg:block">
            <Button href={faq.cta.href} label={faq.cta.label} variant="night" icon="whatsapp" cursor="Escribinos" />
          </div>
        </div>

        <ul className="flex flex-col border-t border-brand-deep/15 lg:col-span-7">
          {faq.items.map((item, i) => {
            const on = open === i
            return (
              <li key={item.q} data-reveal data-reveal-delay={i * 0.04} data-open={on || undefined} className="border-b border-brand-deep/15">
                <h3>
                  <button
                    type="button"
                    id={`faq-q-${i}`}
                    aria-expanded={on}
                    aria-controls={`faq-a-${i}`}
                    onClick={() => setOpen(on ? -1 : i)}
                    className="group flex w-full items-center justify-between gap-6 py-4 text-left md:py-5"
                  >
                    <span className={`text-lg font-bold transition-colors duration-300 md:text-xl ${on ? 'text-brand-deep' : 'text-brand-night group-hover:text-brand-deep'}`}>{item.q}</span>
                    <span
                      aria-hidden="true"
                      className={`grid size-9 shrink-0 place-items-center rounded-full transition duration-500 ease-expo ${on ? 'rotate-45 bg-brand-deep text-white' : 'bg-brand-mist text-brand-deep'}`}
                    >
                      <svg viewBox="0 0 24 24" className="size-4 fill-none stroke-current stroke-2" strokeLinecap="round">
                        <path d="M12 5v14M5 12h14" />
                      </svg>
                    </span>
                  </button>
                </h3>
                <div id={`faq-a-${i}`} role="region" aria-labelledby={`faq-q-${i}`} className="accordion-panel">
                  <div>
                    <p className={`pr-12 pb-5 leading-relaxed text-brand-night/75 transition duration-500 md:text-lg ${on ? 'opacity-100' : 'opacity-0'}`}>{item.a}</p>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>

        <div className="lg:hidden">
          <Button href={faq.cta.href} label={faq.cta.label} variant="night" icon="whatsapp" cursor="Escribinos" />
        </div>
      </div>
    </Section>
  )
}
