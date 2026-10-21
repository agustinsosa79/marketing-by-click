import { useState } from 'react'
import { faq, sections } from '../../../data/content'
import { Button } from '../../ui/Button'
import { Label, Title } from '../../ui/Title'

/**
 * Preguntas frecuentes (dentro del bloque oscuro de Nosotros): acordeón con una pregunta abierta a la vez.
 * Mantiene el ancla #preguntas (la usa el menú). Las preguntas y respuestas también van como datos
 * estructurados FAQPage (entry-server.tsx).
 */
export function Faq() {
  // desktop: la primera abierta; mobile: todas cerradas (la lista se lee de un vistazo)
  const [open, setOpen] = useState(() => (typeof window !== 'undefined' && window.matchMedia('(min-width: 1024px)').matches ? 0 : -1))

  return (
    <div id={sections.faq} className="grid scroll-mt-24 grid-cols-1 gap-6 md:gap-8 lg:grid-cols-12 lg:gap-10">
      <div className="flex flex-col items-start gap-4 lg:col-span-5 lg:gap-6">
        <Label tone="night">{faq.eyebrow}</Label>
        <Title title={faq.title} tone="night" />
        <div data-reveal className="hidden lg:block">
          <Button href={faq.cta.href} label={faq.cta.label} variant="white" icon="whatsapp" cursor="Escribinos" />
        </div>
      </div>

      <ul className="flex flex-col border-t border-white/15 lg:col-span-7">
        {faq.items.map((item, i) => {
          const on = open === i
          return (
            <li key={item.q} data-reveal data-reveal-delay={i * 0.04} data-open={on || undefined} className="border-b border-white/15">
              <h3>
                <button
                  type="button"
                  id={`faq-q-${i}`}
                  aria-expanded={on}
                  aria-controls={`faq-a-${i}`}
                  onClick={() => setOpen(on ? -1 : i)}
                  className="group flex w-full items-center justify-between gap-6 py-4 text-left md:py-5"
                >
                  <span className={`text-lg font-bold transition-colors duration-300 md:text-xl ${on ? 'text-white' : 'text-brand-haze group-hover:text-white'}`}>{item.q}</span>
                  <span
                    aria-hidden="true"
                    className={`grid size-9 shrink-0 place-items-center rounded-full transition duration-500 ease-expo ${on ? 'rotate-45 bg-brand-signal text-brand-ink' : 'bg-white/10 text-white ring-1 ring-white/15'}`}
                  >
                    <svg viewBox="0 0 24 24" className="size-4 fill-none stroke-current stroke-2" strokeLinecap="round">
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                  </span>
                </button>
              </h3>
              <div id={`faq-a-${i}`} role="region" aria-labelledby={`faq-q-${i}`} className="accordion-panel">
                <div>
                  <p className={`pr-12 pb-5 leading-relaxed text-brand-haze transition duration-500 md:text-lg ${on ? 'opacity-100' : 'opacity-0'}`}>{item.a}</p>
                </div>
              </div>
            </li>
          )
        })}
      </ul>

      <div className="lg:hidden">
        <Button href={faq.cta.href} label={faq.cta.label} variant="white" icon="whatsapp" cursor="Escribinos" />
      </div>
    </div>
  )
}
