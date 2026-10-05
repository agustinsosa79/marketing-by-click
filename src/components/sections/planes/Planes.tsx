import { useEffect, useRef, useState } from 'react'
import { planes, sections, type Plan } from '../../../data/content'
import { useReducedMotion } from '../../../hooks/useReducedMotion'
import { gsap, useGSAP } from '../../../lib/gsap'
import { setupReveals } from '../../../lib/motion'
import { deferSetup } from '../../../lib/schedule'
import { Button } from '../../ui/Button'
import { Check } from '../../ui/Icon'
import { Section } from '../../ui/Section'
import { Label, Title } from '../../ui/Title'

/**
 * Tarjeta de plan. El destacado va en azul Clic (el protagonista), los otros en blanco.
 * Hover (desktop): sube un poco.
 */
function PlanCard({ plan }: { plan: Plan }) {
  const featured = !!plan.featured

  return (
    <article
      data-plan-card
      className={`group relative isolate flex w-4/5 shrink-0 snap-center flex-col overflow-hidden rounded-4xl p-5 transition duration-500 ease-expo sm:w-3/5 md:p-7 lg:w-auto lg:hover:-translate-y-2 ${
        featured ? 'bg-brand-deep text-white shadow-lift ring-1 ring-white/10' : 'bg-white text-brand-night shadow-soft ring-1 ring-brand-deep/10 lg:hover:shadow-lift'
      }`}
    >
      <header className="flex items-center justify-between gap-4">
        <h3 className={`font-label text-label ${featured ? 'text-brand-haze' : 'text-brand-deep'}`}>{plan.name}</h3>
        {featured && <span className="rounded-full bg-brand-signal px-3 py-1 text-xs font-bold text-white">{planes.badge}</span>}
      </header>

      <p className="mt-4 flex items-end gap-2">
        <span className={`font-display text-price ${featured ? '' : 'text-brand-deep'}`}>{plan.price}</span>
        <span className={`pb-1.5 text-sm font-semibold ${featured ? 'text-brand-haze' : 'text-brand-night/60'}`}>
          {planes.currency} {planes.period}
        </span>
      </p>
      <p className={`mt-2 text-sm font-medium ${featured ? 'text-brand-haze' : 'text-brand-night/70'}`}>{plan.for}</p>

      <ul className={`mt-4 flex flex-1 flex-col gap-2.5 border-t pt-4 md:mt-5 md:gap-3 md:pt-5 ${featured ? 'border-white/15' : 'border-brand-deep/10'}`}>
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-3 text-sm leading-snug font-medium">
            <span className={`mt-px grid size-5 shrink-0 place-items-center rounded-full ${featured ? 'bg-brand-signal text-white' : 'bg-brand-signal/10 text-brand-signal'}`}>
              <Check className="size-3" />
            </span>
            {f}
          </li>
        ))}
      </ul>

      <Button href={planes.ctaHref} label={planes.cta} variant={featured ? 'white' : 'night'} icon="whatsapp" cursor="Escribinos" className="mt-5 w-full md:mt-6" />
    </article>
  )
}

/** Planes: tres tarjetas (carrusel con snap en mobile) + una línea para lo que no entra en un plan. */
export function Planes() {
  const ref = useRef<HTMLElement>(null)
  const track = useRef<HTMLDivElement>(null)
  const [current, setCurrent] = useState(1)
  const reduced = useReducedMotion()

  useGSAP(
    (_, contextSafe) =>
      deferSetup(
        contextSafe!(() => {
          setupReveals(ref.current!)
          const cards = gsap.utils.toArray<HTMLElement>('[data-plan-card]', ref.current)
          const scrollTrigger = { trigger: track.current, start: 'top 85%', once: true }
          if (reduced) {
            gsap.fromTo(cards, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.6, stagger: 0.05, scrollTrigger })
            return
          }
          // las laterales llegan desde el centro, como si se abriera un abanico
          gsap.fromTo(
            cards,
            { autoAlpha: 0, y: 80, rotate: (i) => (i - 1) * 3 },
            { autoAlpha: 1, y: 0, rotate: 0, duration: 1.2, stagger: 0.08, ease: 'reveal', scrollTrigger },
          )
        }),
      ),
    { scope: ref, dependencies: [reduced] },
  )

  // Mobile: arranca centrado en el plan destacado y los puntos siguen al carrusel
  useEffect(() => {
    const el = track.current
    if (!el || el.scrollWidth <= el.clientWidth) return
    const cards = [...el.children] as HTMLElement[]
    const featured = planes.plans.findIndex((p) => p.featured)
    const card = cards[featured]
    el.scrollLeft = card.offsetLeft - (el.clientWidth - card.offsetWidth) / 2
    const onScroll = () => {
      const center = el.scrollLeft + el.clientWidth / 2
      let best = 0
      cards.forEach((c, i) => {
        if (Math.abs(c.offsetLeft + c.offsetWidth / 2 - center) < Math.abs(cards[best].offsetLeft + cards[best].offsetWidth / 2 - center)) best = i
      })
      setCurrent(best)
    }
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <Section id={sections.planes} ref={ref} bg="paper" className="flex min-h-svh flex-col justify-center overflow-hidden pt-20 pb-8 md:pt-28 md:pb-14">
      <div className="flex flex-col gap-4 px-5 md:px-10">
        <Label>{planes.eyebrow}</Label>
        <Title title={planes.title} tone="paper" className="text-brand-deep" />
      </div>

      <div
        ref={track}
        className="no-scrollbar mt-3 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 py-4 md:mt-8 md:gap-4 md:px-10 lg:grid lg:grid-cols-3 lg:items-stretch lg:overflow-visible"
      >
        {planes.plans.map((plan) => (
          <PlanCard key={plan.name} plan={plan} />
        ))}
      </div>

      <div aria-hidden="true" className="flex justify-center gap-2 lg:hidden">
        {planes.plans.map((plan, i) => (
          <span key={plan.name} className={`size-2 rounded-full transition duration-500 ease-expo ${i === current ? 'scale-125 bg-brand-signal' : 'bg-brand-deep/20'}`} />
        ))}
      </div>

      <p data-reveal="rise" className="mt-3 flex flex-col gap-1 px-5 text-xs md:text-sm text-brand-night/70 md:mt-6 md:flex-row md:items-center md:gap-6 md:px-10">
        <span>{planes.note}</span>
        <span>
          {planes.extra.text}{' '}
          <a href={planes.ctaHref} target="_blank" rel="noopener noreferrer" className="link-underline font-bold text-brand-signal">
            {planes.extra.link}
          </a>
        </span>
      </p>
    </Section>
  )
}
