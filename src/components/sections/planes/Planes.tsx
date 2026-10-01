import { useRef } from 'react'
import { contact, planes, sections, type Plan } from '../../../data/content'
import { useGSAP } from '../../../lib/gsap'
import { setupReveals } from '../../../lib/motion'
import { deferSetup } from '../../../lib/schedule'
import { Button } from '../../ui/Button'
import { Odometer } from '../../ui/Odometer'
import { Section } from '../../ui/Section'
import { Label, SectionTitle } from '../../ui/SectionTitle'

// Contraste corregido: los tonos claros llevan texto night, nunca blanco (ver brand-analysis §1)
const CARDS = [
  { face: 'bg-brand-mist text-brand-night', check: 'bg-brand-paper text-brand-deep', button: 'night', muted: 'text-brand-night/60' },
  {
    face: 'bg-brand-sky text-brand-night',
    check: 'bg-brand-paper text-brand-night',
    button: 'night',
    muted: 'text-brand-night/70',
  },
  { face: 'bg-brand-night text-brand-paper', check: 'bg-brand-deep text-brand-sky', button: 'sky', muted: 'text-brand-paper/70' },
] as const

function Check() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-3 fill-none stroke-current stroke-3" strokeLinecap="round" strokeLinejoin="round">
      <path d="m5 12 5 5 9-10" />
    </svg>
  )
}

function PlanCard({ plan, index }: { plan: Plan; index: number }) {
  const c = CARDS[index]
  return (
    <article data-reveal="fade" data-reveal-delay={index * 0.1} className={`group relative w-full ${plan.featured ? 'lg:-translate-y-4' : ''}`}>
      <div className={`sheen relative flex h-full flex-col overflow-hidden rounded-4xl p-6 transition-transform duration-500 ease-expo md:p-8 md:group-hover:-translate-y-2 ${c.face}`}>
        <header className="relative z-2 flex items-center justify-between gap-4">
          <h3 className="font-display text-big">{plan.name}</h3>
          {plan.featured && (
            <span className="text-label font-semibold uppercase text-brand-gold">
              {planes.badge}
            </span>
          )}
        </header>

        <p className="relative z-2 mt-6 flex items-end gap-3">
          <span className="font-display text-giant tabular-nums">
            <Odometer value={plan.price} />
          </span>
          <span className={`pb-2 text-label font-semibold ${c.muted}`}>
            {planes.currency.toUpperCase()} {planes.period}
          </span>
        </p>

        <ul className="relative z-2 mt-8 flex flex-1 flex-col gap-3.5">
          {plan.features.map((f) => (
            <li key={f} className="flex items-start gap-3 text-sm leading-snug font-medium md:text-base">
              <span className={`mt-0.5 grid size-5 shrink-0 place-items-center rounded-full ${c.check}`}>
                <Check />
              </span>
              {f}
            </li>
          ))}
        </ul>

        <Button href={planes.ctaHref} label={planes.cta} variant={c.button} icon="whatsapp" cursor="Escribinos" className="relative z-2 mt-8 w-full" />
      </div>
    </article>
  )
}

export function Planes() {
  const ref = useRef<HTMLElement>(null)

  useGSAP((_, contextSafe) => deferSetup(contextSafe!(() => setupReveals(ref.current!))), { scope: ref })

  return (
    <Section id={sections.planes} ref={ref} bg="paper" className="overflow-hidden py-28 md:py-40">
      <div className="px-5 md:px-10">
        <Label>{planes.eyebrow}</Label>
        <SectionTitle text={planes.title} className="mt-6 font-display text-giant md:w-5/6" />
      </div>

      {/* Mobile: tarjetas apiladas; desktop: grilla de tres columnas. */}
      <div className="mt-14 flex flex-col gap-4 px-5 pt-6 md:mt-20 md:px-10 lg:grid lg:grid-cols-3 lg:items-stretch lg:gap-6">
        {planes.plans.map((plan, i) => (
          <PlanCard key={plan.name} plan={plan} index={i} />
        ))}
      </div>
      <p data-reveal="fade" className="px-5 text-label font-medium text-brand-deep/70 md:px-10">
        {planes.note}
      </p>

      <div className="mt-16 grid gap-6 px-5 md:mt-24 md:px-10 lg:grid-cols-12">
        <article data-reveal="fade" className="group flex flex-col gap-6 bg-brand-mist p-6 transition-transform duration-500 ease-expo md:p-10 md:hover:-translate-y-1 lg:col-span-7">
          <header className="flex flex-wrap items-start justify-between gap-6">
            <h3 className="font-display text-big">{planes.sesion.title}</h3>
            <p className="text-right">
              <span className="block font-display text-huge">{planes.sesion.price.split(' ')[0]}</span>
              <span className="text-label font-semibold text-brand-deep/70">
                {planes.sesion.price.split(' ')[1]} · {planes.sesion.availability}
              </span>
            </p>
          </header>
          <div className="grid gap-4 md:grid-cols-2 md:gap-6">
            {planes.sesion.text.map((t) => (
              <p key={t} className="text-sm leading-relaxed text-brand-deep/85 md:text-base">
                {t}
              </p>
            ))}
          </div>
        </article>

        <article data-reveal="fade" data-reveal-delay="0.1" className="group relative flex flex-col gap-6 bg-brand-night p-6 text-brand-paper transition-transform duration-500 ease-expo md:p-10 md:hover:-translate-y-1 lg:col-span-5">
          <h3 className="relative font-display text-big">{planes.adicionales.title}</h3>
          <ul className="relative flex flex-wrap gap-2">
            {planes.adicionales.items.map((item) => (
              <li key={item} className="border-b border-white/20 py-2 text-label font-semibold transition-opacity duration-300 ease-expo md:hover:opacity-80">
                {item}
              </li>
            ))}
          </ul>
          <p className="relative flex items-center gap-3 border-t border-white/20 pt-4">
            <span className="text-label font-bold uppercase text-brand-sky">{planes.adicionales.nuevo.badge}</span>
            <span className="font-semibold">{planes.adicionales.nuevo.label}</span>
          </p>
          <a href={contact.whatsappMessage} target="_blank" rel="noopener noreferrer" data-cursor="Escribinos" className="link-underline relative mt-auto self-start font-accent text-4xl text-brand-sky">
            {planes.adicionales.cta}
          </a>
        </article>
      </div>
    </Section>
  )
}
