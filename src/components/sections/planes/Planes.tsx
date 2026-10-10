import { useEffect, useRef, useState } from 'react'
import { planes, sections, type Plan, type PlanTone } from '../../../data/content'
import { useLenis } from '../../../hooks/useLenis'
import { useReducedMotion } from '../../../hooks/useReducedMotion'
import { gsap, useGSAP } from '../../../lib/gsap'
import { setupReveals } from '../../../lib/motion'
import { deferSetup } from '../../../lib/schedule'
import { Button } from '../../ui/Button'
import { Check } from '../../ui/Icon'
import { Section } from '../../ui/Section'
import { Label, Title } from '../../ui/Title'

/**
 * Colores de cada tarjeta, todos de la misma familia de azules:
 *   light  → Inicial: blanco, el punto de partida
 *   signal → Plus (más elegido): azul señal, el más vivo de la paleta
 *   night  → Premium: azul noche, el más sobrio
 * Contraste AA en todos los textos (sobre azul señal el texto secundario va en blanco: la bruma no alcanza).
 */
const TONES: Record<PlanTone, { card: string; label: string; price: string; muted: string; rule: string; check: string; button: 'night' | 'white' | 'onSignal' }> = {
  light: {
    card: 'bg-white text-brand-night shadow-soft ring-1 ring-brand-deep/10 lg:hover:shadow-lift',
    label: 'text-brand-deep',
    price: 'text-brand-deep',
    muted: 'text-brand-night/70',
    rule: 'border-brand-deep/10',
    check: 'bg-brand-signal/10 text-brand-signal',
    button: 'night',
  },
  signal: {
    card: 'bg-brand-signal text-white shadow-lift',
    label: 'text-white',
    price: 'text-white',
    muted: 'text-white',
    rule: 'border-white/25',
    check: 'bg-white text-brand-signal',
    button: 'onSignal',
  },
  night: {
    card: 'bg-brand-night text-white shadow-soft ring-1 ring-white/10 lg:hover:shadow-lift',
    label: 'text-brand-haze',
    price: 'text-white',
    muted: 'text-brand-haze',
    rule: 'border-white/15',
    check: 'bg-brand-signal text-white',
    button: 'white',
  },
}

/**
 * Tarjeta de plan. El destacado es un poco más grande que los otros dos (más alto y más ancho en desktop,
 * más ancho en el carrusel del celular) y lleva la etiqueta "Más elegido".
 * Hover (desktop): sube un poco.
 */
function PlanCard({ plan }: { plan: Plan }) {
  const featured = !!plan.featured
  const t = TONES[plan.tone]

  return (
    <article
      data-plan-card
      className={`group relative isolate flex shrink-0 snap-center flex-col overflow-hidden rounded-4xl transition duration-500 ease-expo lg:w-auto lg:hover:-translate-y-2 ${t.card} ${
        featured
          ? 'z-10 w-5/6 p-6 ring-8 ring-brand-signal/15 sm:w-3/5 md:p-9 lg:col-span-5 lg:w-auto lg:py-12 short:py-7'
          : 'w-3/4 p-5 sm:w-1/2 md:p-7 lg:col-span-4 short:p-5'
      }`}
    >
      <header className="flex items-center justify-between gap-4">
        <h3 className={`font-label text-label ${t.label}`}>{plan.name}</h3>
        {featured && <span className="rounded-full bg-white px-3.5 py-1.5 text-sm font-bold text-brand-signal shadow-soft">★ {planes.badge}</span>}
      </header>

      <p className="mt-4 flex items-end gap-2">
        <span className={`font-display ${featured ? 'text-price-xl' : 'text-price'} ${t.price}`}>{plan.price}</span>
        <span className={`pb-1.5 text-sm font-semibold ${t.muted}`}>
          {planes.currency} {planes.period}
        </span>
      </p>
      <p className={`mt-2 font-medium ${featured ? 'text-base md:text-lg' : 'text-sm'} ${t.muted}`}>{plan.for}</p>

      <ul className={`mt-4 flex flex-1 flex-col gap-2.5 border-t pt-4 md:mt-5 md:gap-3 md:pt-5 short:mt-3 short:gap-2 short:pt-3 ${t.rule}`}>
        {plan.features.map((f) => (
          <li key={f} className={`flex items-start gap-3 leading-snug font-medium ${featured ? 'text-sm md:text-base' : 'text-sm'}`}>
            <span className={`mt-px grid size-5 shrink-0 place-items-center rounded-full ${t.check}`}>
              <Check className="size-3" />
            </span>
            {f}
          </li>
        ))}
      </ul>

      <Button href={planes.ctaHref} label={planes.cta} variant={t.button} icon="whatsapp" cursor="Escribinos" className="mt-5 w-full md:mt-6 short:mt-4" />
    </article>
  )
}

/** Planes: tres tarjetas (carrusel con snap en mobile) + una línea para lo que no entra en un plan. */
export function Planes() {
  const ref = useRef<HTMLElement>(null)
  const track = useRef<HTMLDivElement>(null)
  const [current, setCurrent] = useState(1)
  const reduced = useReducedMotion()
  const { scrollTo } = useLenis()

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
    <Section id={sections.planes} ref={ref} bg="paper" className="flex min-h-svh flex-col justify-center overflow-hidden pt-20 pb-8 md:pt-28 md:pb-14 short:pt-20 short:pb-8">
      <div className="flex flex-col gap-4 px-5 md:px-10">
        <Label>{planes.eyebrow}</Label>
        <Title title={planes.title} tone="paper" className="text-brand-deep" />
      </div>

      <div
        ref={track}
        className="no-scrollbar mt-3 flex snap-x snap-mandatory items-center gap-3 overflow-x-auto px-5 py-6 md:mt-8 md:gap-4 md:px-10 lg:grid lg:grid-cols-13 lg:gap-6 lg:overflow-visible lg:py-6 short:mt-3 short:py-4"
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
        <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
          {planes.extra.text}
          <a
            href={`#${planes.extra.id}`}
            onClick={(event) => {
              const target = document.getElementById(planes.extra.id)
              if (!target) return
              event.preventDefault()
              scrollTo(target, { duration: 1.4 })
            }}
            className="group inline-flex items-center gap-1.5 font-bold text-brand-signal"
          >
            <span className="link-underline">{planes.extra.link}</span>
            <span aria-hidden="true" className="transition-transform duration-500 ease-expo group-hover:translate-y-0.5">
              ↓
            </span>
          </a>
        </span>
      </p>
    </Section>
  )
}
