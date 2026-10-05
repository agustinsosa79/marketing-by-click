import { useRef, useState, type KeyboardEvent } from 'react'
import { sections, servicios } from '../../../data/content'
import { useReducedMotion } from '../../../hooks/useReducedMotion'
import { gsap, useGSAP } from '../../../lib/gsap'
import { setupReveals } from '../../../lib/motion'
import { deferSetup } from '../../../lib/schedule'
import { Button } from '../../ui/Button'
import { Arrow, Check, ServiceIcon } from '../../ui/Icon'
import { Section } from '../../ui/Section'
import { Label, Title } from '../../ui/Title'
import { ServiceDemo } from './ServiceDemo'

const ITEMS = servicios.items

/**
 * Servicios: un servicio a la vez.
 *  - izquierda: los cuatro servicios (click o flechas del teclado para cambiar) y los extras
 *  - derecha: panel azul Clic con la mini animación del servicio, qué incluye y dos salidas (WhatsApp o su página)
 */
export function Servicios() {
  const ref = useRef<HTMLElement>(null)
  const panel = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)
  const reduced = useReducedMotion()
  const first = useRef(true)
  const item = ITEMS[active]

  useGSAP((_, contextSafe) => deferSetup(contextSafe!(() => setupReveals(ref.current!))), { scope: ref })

  // Al cambiar de servicio, el texto del panel entra de nuevo (la animación del servicio va en ServiceDemo)
  useGSAP(
    () => {
      if (first.current) {
        first.current = false
        return
      }
      const parts = panel.current!.querySelectorAll('[data-panel-part]')
      if (reduced) gsap.fromTo(parts, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3 })
      else gsap.fromTo(parts, { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.05, ease: 'reveal' })
    },
    { scope: ref, dependencies: [active] },
  )

  const onKey = (e: KeyboardEvent) => {
    if (!['ArrowDown', 'ArrowUp', 'ArrowRight', 'ArrowLeft'].includes(e.key)) return
    e.preventDefault()
    const next = (active + (e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1 : -1) + ITEMS.length) % ITEMS.length
    setActive(next)
    ref.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]')[next]?.focus()
  }

  return (
    <Section id={sections.servicios} ref={ref} bg="paper" className="flex min-h-svh flex-col justify-center px-5 pt-20 pb-8 md:px-10 md:pt-28 md:pb-14">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-10">
        <div className="flex flex-col gap-5 lg:col-span-5 lg:gap-6">
          <div className="flex flex-col gap-4">
            <Label>{servicios.eyebrow}</Label>
            <Title title={servicios.title} tone="paper" className="text-brand-deep" />
          </div>

          <div role="tablist" aria-label={servicios.listAria} onKeyDown={onKey} className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 lg:mx-0 lg:flex-col lg:gap-1 lg:overflow-visible lg:px-0">
            {ITEMS.map((s, i) => {
              const on = i === active
              return (
                <button
                  key={s.slug}
                  type="button"
                  role="tab"
                  id={`servicio-tab-${s.slug}`}
                  aria-selected={on}
                  aria-controls="servicio-panel"
                  tabIndex={on ? 0 : -1}
                  onClick={() => setActive(i)}
                  className={`group flex shrink-0 items-center gap-3 rounded-full py-2 pr-4 pl-2 text-left transition duration-500 ease-expo lg:rounded-3xl lg:py-2 lg:pr-5 lg:pl-2 ${
                    on ? 'bg-white shadow-soft ring-1 ring-brand-deep/10' : 'hover:bg-white/60'
                  }`}
                >
                  <span className={`grid size-9 shrink-0 place-items-center rounded-2xl transition duration-500 ease-expo lg:size-11 ${on ? 'bg-brand-signal text-white' : 'bg-brand-deep/5 text-brand-deep'}`}>
                    <ServiceIcon name={s.icon} className="size-4 lg:size-6" />
                  </span>
                  <span className={`font-display text-base whitespace-nowrap transition-colors duration-500 lg:flex-1 lg:text-xl ${on ? 'text-brand-deep' : 'text-brand-deep/75 group-hover:text-brand-deep'}`}>{s.name}</span>
                  <Arrow className={`hidden size-5 text-brand-signal transition duration-500 ease-expo lg:block ${on ? 'rotate-45 opacity-100' : 'opacity-0'}`} />
                </button>
              )
            })}
          </div>

          {/* extras en una línea (el detalle está en las páginas de servicio y en preguntas frecuentes) */}
          <p data-reveal="rise" className="hidden items-center gap-x-3 border-t border-brand-deep/15 pt-4 text-sm lg:flex lg:flex-wrap">
            <span className="font-label text-label text-brand-deep">{servicios.extrasLabel}</span>
            {servicios.extras.map((extra) => (
              <span key={extra.name} className="flex items-center gap-1.5 font-bold text-brand-deep">
                <span aria-hidden="true" className="text-brand-signal">
                  +
                </span>
                {extra.name}
              </span>
            ))}
          </p>
        </div>

        <div
          ref={panel}
          id="servicio-panel"
          role="tabpanel"
          aria-labelledby={`servicio-tab-${item.slug}`}
          data-reveal="fade"
          className="flex flex-col gap-4 rounded-4xl bg-brand-deep p-3 text-white md:gap-5 md:p-4 lg:col-span-7 lg:h-panel"
        >
          <div className="h-44 shrink-0 overflow-hidden rounded-3xl bg-brand-night/40 md:h-64 lg:h-auto lg:flex-1">
            {ITEMS.map((s, i) => (
              <div key={s.slug} className={i === active ? 'size-full' : 'hidden'}>
                <ServiceDemo name={s.icon} active={i === active} />
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-4 px-2 pb-2 md:px-4 md:pb-4 lg:flex-row lg:items-end lg:justify-between lg:gap-8">
            <div className="flex flex-col gap-3">
              <h3 data-panel-part className="font-display text-big">
                {item.name}
              </h3>
              <p data-panel-part className="text-base text-brand-haze md:text-lg">
                {item.text}
              </p>
              {/* en mobile el detalle queda en la página del servicio */}
              <ul data-panel-part className="hidden flex-wrap gap-2 md:flex">
                {item.includes.slice(0, 3).map((inc, i) => (
                  <li key={inc} className={`items-center gap-1.5 rounded-full bg-white/10 py-1 pr-3 pl-1.5 text-xs font-semibold ${i > 1 ? 'hidden md:flex' : 'flex'}`}>
                    <span className="grid size-4 place-items-center rounded-full bg-white text-brand-deep">
                      <Check className="size-2.5" />
                    </span>
                    {inc}
                  </li>
                ))}
              </ul>
            </div>
            <div data-panel-part className="flex shrink-0 flex-wrap items-center gap-x-5 gap-y-3 lg:flex-col lg:items-end">
              <Button href={servicios.ctaHref} label={servicios.cta} variant="white" icon="whatsapp" cursor={servicios.cursor} />
              <a href={`/servicios/${item.slug}`} className="group flex items-center gap-2 text-sm font-bold">
                <span className="link-underline">{servicios.more}</span>
                <Arrow className="size-4 transition-transform duration-500 ease-expo group-hover:rotate-45" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </Section>
  )
}
