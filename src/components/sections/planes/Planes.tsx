import { useEffect, useRef, useState } from 'react'
import { diagnostico, planes, sections, type Plan, type PlanTone } from '../../../data/content'
import { useLenis } from '../../../hooks/useLenis'
import { useGSAP } from '../../../lib/gsap'
import { setupReveals } from '../../../lib/motion'
import { deferSetup } from '../../../lib/schedule'
import { Button } from '../../ui/Button'
import { Check } from '../../ui/Icon'
import { Modal } from '../../ui/Modal'
import { Section } from '../../ui/Section'
import { PlanCompare } from './PlanCompare'
import { Label, Title } from '../../ui/Title'

/**
 * Colores de cada tarjeta, los tres de la marca (como en el manual de Clic Studio):
 *   light  → Inicial: naranja Clic, el punto de partida
 *   signal → Plus (más elegido): azul Clic, con la cinta naranja "Más elegido"
 *   night  → Premium: azul noche, el más sobrio
 * Contraste AA: sobre naranja todo el texto va en tinta; sobre azul Clic, en blanco.
 */
const TONES: Record<PlanTone, { card: string; label: string; price: string; muted: string; rule: string; check: string; button: 'night' | 'white' | 'onSignal' }> = {
  light: {
    card: 'bg-brand-signal text-brand-ink shadow-soft lg:hover:shadow-lift',
    label: 'text-brand-ink',
    price: 'text-brand-ink',
    muted: 'text-brand-ink',
    rule: 'border-brand-ink/15',
    check: 'bg-brand-ink text-white',
    button: 'onSignal',
  },
  signal: {
    card: 'bg-brand-deep text-white shadow-lift',
    label: 'text-white',
    price: 'text-white',
    muted: 'text-white',
    rule: 'border-white/25',
    check: 'bg-white text-brand-deep',
    button: 'white',
  },
  night: {
    card: 'bg-brand-night text-white shadow-soft ring-1 ring-white/10 lg:hover:shadow-lift',
    label: 'text-brand-haze',
    price: 'text-white',
    muted: 'text-brand-haze',
    rule: 'border-white/15',
    check: 'bg-brand-signal text-brand-ink',
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
      data-reveal
      className={`group relative isolate flex shrink-0 snap-center flex-col overflow-hidden rounded-4xl transition duration-500 ease-expo lg:w-auto lg:hover:-translate-y-2 ${t.card} ${
        featured
          ? 'z-10 w-5/6 p-6 ring-8 ring-brand-deep/15 sm:w-3/5 md:p-9 lg:col-span-5 lg:w-auto lg:py-14 short:py-8'
          : 'w-3/4 p-5 sm:w-1/2 md:p-7 lg:col-span-4 short:p-5'
      }`}
    >
      <header className="flex items-center justify-between gap-4">
        <h3 className={`font-label text-label ${t.label}`}>{plan.name}</h3>
      </header>
      {/* cinta diagonal en la esquina, como en las aplicaciones del manual */}
      {featured && (
        <span className="absolute top-7 -right-14 w-56 rotate-45 bg-brand-signal py-1.5 text-center text-sm font-bold text-brand-ink shadow-soft md:top-9 md:-right-12">
          {planes.badge}
        </span>
      )}

      <p className="mt-4 flex items-end gap-2">
        <span className={`font-display ${featured ? 'text-price-xl' : 'text-price'} ${t.price}`}>{plan.price}</span>
        <span className={`pb-1.5 text-sm font-semibold ${t.muted}`}>
          {planes.currency} {planes.period}
        </span>
      </p>
      <p className={`mt-2 font-medium ${featured ? 'text-base md:text-lg' : 'text-sm'} ${t.muted}`}>{plan.for}</p>

      {plan.highlight && (
        <p className="mt-4 flex items-center gap-3 rounded-2xl rounded-bl-sm bg-brand-signal px-3 py-2.5 text-brand-ink md:mt-5 short:mt-3">
          <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-brand-ink text-white">
            <svg viewBox="0 0 24 24" aria-hidden="true" className="size-4.5 fill-none stroke-current stroke-2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3.5 7.5A1.5 1.5 0 0 1 5 6h9a1.5 1.5 0 0 1 1.5 1.5v9A1.5 1.5 0 0 1 14 18H5a1.5 1.5 0 0 1-1.5-1.5z" />
              <path d="M15.5 10.5l5-3v9l-5-3" />
            </svg>
          </span>
          <span className="flex flex-col leading-tight">
            <span className="text-sm font-bold md:text-base">{plan.highlight.title}</span>
            <span className="text-xs font-semibold">{plan.highlight.text}</span>
          </span>
        </p>
      )}

      <ul className={`mt-4 flex flex-1 flex-col gap-2.5 border-t pt-4 md:mt-5 md:gap-3 md:pt-5 short:mt-3 short:gap-2 short:pt-3 ${t.rule}`}>
        {plan.features.slice(0, planes.cardFeatures).map((f) => (
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

/**
 * Planes: tres tarjetas (carrusel con snap en mobile) y, debajo, dos ayudas para decidir:
 * comparar lado a lado (ventana) y "¿No sabés cuál elegir?", que baja a la sección del diagnóstico.
 */
export function Planes() {
  const ref = useRef<HTMLElement>(null)
  const track = useRef<HTMLDivElement>(null)
  const [current, setCurrent] = useState(1)
  const [open, setOpen] = useState<'compare' | null>(null)
  const { scrollTo } = useLenis()

  useGSAP((_, contextSafe) => deferSetup(contextSafe!(() => setupReveals(ref.current!))), { scope: ref })

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

  const help = 'group flex items-center gap-2.5 rounded-full bg-white py-2 pr-5 pl-2 font-bold text-brand-night shadow-soft ring-1 ring-brand-deep/10 transition duration-300 ease-expo hover:-translate-y-0.5 hover:ring-brand-deep/30'
  const helpIcon = 'grid size-8 place-items-center rounded-full bg-brand-mist text-brand-deep transition-colors duration-300 group-hover:bg-brand-signal group-hover:text-brand-ink'

  return (
    <Section id={sections.planes} ref={ref} bg="paper" className="pt-20 pb-20 md:pt-28 md:pb-28 short:pt-20">
      <div className="flex flex-col gap-4 px-5 md:px-10">
        <Label>{planes.eyebrow}</Label>
        <Title title={planes.title} tone="paper" />
      </div>

      <div
        ref={track}
        className="no-scrollbar mt-3 flex snap-x snap-mandatory items-center gap-3 overflow-x-auto px-5 py-6 md:mt-8 md:gap-4 md:px-10 lg:mt-4 lg:grid lg:grid-cols-13 lg:gap-6 lg:overflow-visible lg:py-4 short:mt-3 short:py-4"
      >
        {planes.plans.map((plan) => (
          <PlanCard key={plan.name} plan={plan} />
        ))}
      </div>

      <div aria-hidden="true" className="flex justify-center gap-2 lg:hidden">
        {planes.plans.map((plan, i) => (
          <span key={plan.name} className={`size-2 rounded-full transition duration-500 ease-expo ${i === current ? 'scale-125 bg-brand-deep' : 'bg-brand-deep/20'}`} />
        ))}
      </div>

      {/* Ayudas para decidir + nota del asterisco */}
      <div data-reveal className="mt-6 flex flex-col gap-4 px-5 md:mt-8 md:px-10 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={() => setOpen('compare')} className={help}>
            <span className={helpIcon}>
              <svg viewBox="0 0 24 24" aria-hidden="true" className="size-4 fill-none stroke-current stroke-2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 6h16M4 12h16M4 18h16M9 4v16M15 4v16" />
              </svg>
            </span>
            {planes.compare.open}
          </button>
          <button type="button" onClick={() => {
              const target = document.getElementById(sections.diagnostico)
              if (target) scrollTo(target, { duration: 1.4 })
            }} className={help}>
            <span className={helpIcon} aria-hidden="true">
              ?
            </span>
            {diagnostico.open}
          </button>
        </div>
        <p className="text-sm text-brand-night/70">{planes.note}</p>
      </div>

      <Modal open={open === 'compare'} onClose={() => setOpen(null)} title={planes.compare.title} label={planes.compare.label} size="xl">
        <PlanCompare />
      </Modal>
    </Section>
  )
}
