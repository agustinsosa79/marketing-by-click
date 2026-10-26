import { useRef } from 'react'
import { brand, sections, servicios, type Service } from '../../../data/content'
import { useGSAP } from '../../../lib/gsap'
import { setupReveals } from '../../../lib/motion'
import { deferSetup } from '../../../lib/schedule'
import { Button } from '../../ui/Button'
import { Arrow, Isotipo, ServiceIcon } from '../../ui/Icon'
import { Section } from '../../ui/Section'
import { Label, Title } from '../../ui/Title'

const ITEMS = servicios.items
// posición de cada parte alrededor del círculo (desktop): arriba izq., arriba der., abajo izq., abajo der.
const SPOTS = ['eco-tl', 'eco-tr', 'eco-bl', 'eco-br'] as const

const serviceHref = (s: Service) => `/servicios/${s.slug}`

/** Una parte del método en el círculo (desktop): el ícono va sobre el círculo y el texto hacia afuera. */
function Node({ s, spot }: { s: Service; spot: (typeof SPOTS)[number] }) {
  const left = spot === 'eco-tl' || spot === 'eco-bl'
  return (
    <div className={`eco-node ${spot}`}>
      <a href={serviceHref(s)} data-reveal className="group relative block" aria-label={`${s.name}: ${s.short}`}>
        <span className="grid size-20 place-items-center rounded-full bg-brand-deep text-white shadow-lift ring-8 ring-white transition duration-500 ease-expo group-hover:scale-110 group-hover:bg-brand-night xl:size-24">
          <ServiceIcon name={s.icon} className="size-8 xl:size-9" />
        </span>
        <span className={`absolute top-1/2 flex w-52 -translate-y-1/2 flex-col gap-1.5 ${left ? 'right-full mr-6 items-end text-right' : 'left-full ml-6 items-start'}`}>
          <span className="font-display text-2xl text-brand-night transition-colors duration-300 group-hover:text-brand-deep xl:text-3xl">{s.name}</span>
          <span aria-hidden="true" className="block h-0.5 w-8 rounded-full bg-brand-deep" />
          <span className="text-brand-night/75">{s.short}</span>
        </span>
      </a>
    </div>
  )
}

/**
 * Método ("ecosistema", pedido del cliente): las cuatro partes del trabajo alrededor de un círculo con la marca
 * en el centro. Cuenta el método más que vender cada servicio; cada parte lleva a su página (/servicios/<slug>),
 * donde se explica en profundidad. Fondo blanco. En el celular, la marca arriba y las partes en tarjetas.
 */
export function Servicios() {
  const ref = useRef<HTMLElement>(null)
  useGSAP((_, contextSafe) => deferSetup(contextSafe!(() => setupReveals(ref.current!))), { scope: ref })

  return (
    <Section id={sections.metodo} ref={ref} bg="paper" className="px-5 pb-20 md:px-10 md:pb-28">
      {/* el inicio también es blanco: una línea fina marca que empieza otra sección */}
      <div aria-hidden="true" className="h-px bg-brand-deep/10" />
      <div className="flex flex-col items-center gap-4 pt-24 text-center md:pt-32">
        <Label>{servicios.eyebrow}</Label>
        <Title title={servicios.title} tone="paper" className="lg:w-3/4" />
      </div>

      {/* Desktop: el círculo */}
      <div className="relative mx-auto mt-14 hidden h-eco lg:block">
        <div className="eco-ring absolute top-1/2 left-1/2 grid place-items-center rounded-full border-2 border-brand-deep/25">
          <div data-reveal className="flex flex-col items-center gap-3">
            <Isotipo className="w-24 xl:w-28" />
            <span className="font-display text-2xl text-brand-night xl:text-3xl">{brand.name}</span>
          </div>
        </div>
        {ITEMS.map((s, i) => (
          <Node key={s.slug} s={s} spot={SPOTS[i]} />
        ))}
      </div>

      {/* Celular y tablet: la marca y las partes en tarjetas */}
      <div className="mt-10 lg:hidden">
        <div data-reveal className="flex flex-col items-center gap-2">
          <Isotipo className="w-16" />
          <span className="font-display text-xl text-brand-night">{brand.name}</span>
        </div>
        <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {ITEMS.map((s, i) => (
            <li key={s.slug} data-reveal data-reveal-delay={i * 0.06}>
              <a href={serviceHref(s)} className="group flex h-full items-center gap-4 rounded-3xl bg-white p-4 shadow-soft ring-1 ring-brand-deep/10">
                <span className="grid size-14 shrink-0 place-items-center rounded-full bg-brand-deep text-white">
                  <ServiceIcon name={s.icon} className="size-6" />
                </span>
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="font-display text-xl text-brand-night">{s.name}</span>
                  <span className="text-brand-night/75">{s.short}</span>
                </span>
                <Arrow className="size-5 shrink-0 text-brand-deep transition-transform duration-500 ease-expo group-hover:rotate-45" />
              </a>
            </li>
          ))}
        </ul>
      </div>

      <div data-reveal className="mt-10 flex flex-col items-center gap-4 lg:mt-6">
        <Button href={`#${servicios.planCta.id}`} label={servicios.planCta.label} variant="signal" icon="arrow" cursor="Ver planes" />
      </div>
    </Section>
  )
}
