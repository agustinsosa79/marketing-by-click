import { useRef, useState, type KeyboardEvent } from 'react'
import { extras, sections } from '../../../data/content'
import { useLenis } from '../../../hooks/useLenis'
import { useReducedMotion } from '../../../hooks/useReducedMotion'
import { gsap, useGSAP } from '../../../lib/gsap'
import { splitHeadline } from '../../../lib/headline'
import { setupReveals } from '../../../lib/motion'
import { deferSetup } from '../../../lib/schedule'
import { Button } from '../../ui/Button'
import { ExtraIcon } from '../../ui/Icon'
import { Section } from '../../ui/Section'
import { Label, Title } from '../../ui/Title'

const ITEMS = extras.items

function Chevron({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={`fill-none stroke-current stroke-2 ${className}`} strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 6l6 6-6 6" />
    </svg>
  )
}

/**
 * Servicios (después del diagnóstico, sobre blanco): la asesoría 1:1 y lo que se hace por proyecto.
 * A la izquierda la lista (click o flechas del teclado); a la derecha el detalle del elegido: foto, qué es,
 * precio si tiene y el WhatsApp con el mensaje ya escrito. Mantiene el ancla #asesoria para links viejos.
 */
export function ServiciosSection() {
  const ref = useRef<HTMLElement>(null)
  const panel = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)
  const reduced = useReducedMotion()
  const { scrollTo } = useLenis()
  const first = useRef(true)

  // en el celular el detalle queda debajo de la lista: al elegir, la página baja hasta él
  const choose = (i: number) => {
    setActive(i)
    if (window.matchMedia('(max-width: 1023px)').matches && panel.current) scrollTo(panel.current, { offset: -96, duration: 0.9 })
  }
  const item = ITEMS[active]
  const [before, em, after] = splitHeadline(item.title)

  useGSAP((_, contextSafe) => deferSetup(contextSafe!(() => setupReveals(ref.current!))), { scope: ref })

  // al cambiar de servicio, el detalle entra de nuevo (la misma subida corta del resto del sitio)
  useGSAP(
    () => {
      if (first.current) {
        first.current = false
        return
      }
      const parts = panel.current!.querySelectorAll('[data-panel-part]')
      if (reduced) gsap.fromTo(parts, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3 })
      else gsap.fromTo(parts, { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.04, ease: 'reveal' })
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
    <Section id={sections.servicios} ref={ref} bg="paper" className="px-5 pt-24 pb-20 md:px-10 md:pt-32 md:pb-28">
      <span id={sections.asesoria} aria-hidden="true" className="absolute top-0" />
      <div className="flex flex-col gap-4">
        <Label>{extras.eyebrow}</Label>
        <Title title={extras.title} tone="paper" />
      </div>

      <div className="mt-10 grid grid-cols-1 gap-4 md:mt-14 lg:grid-cols-12 lg:gap-5">
        {/* Lista */}
        <div data-reveal className="rounded-4xl bg-white p-3 shadow-soft ring-1 ring-brand-deep/10 md:p-4 lg:col-span-4">
          <div role="tablist" aria-label={extras.listAria} aria-orientation="vertical" onKeyDown={onKey} className="flex flex-col gap-1">
            {ITEMS.map((s, i) => {
              const on = i === active
              return (
                <button
                  key={s.key}
                  type="button"
                  role="tab"
                  id={`oferta-tab-${s.key}`}
                  aria-selected={on}
                  aria-controls="oferta-panel"
                  tabIndex={on ? 0 : -1}
                  onClick={() => choose(i)}
                  className={`group flex items-center gap-3 rounded-2xl p-2.5 text-left transition duration-300 ease-expo ${on ? 'bg-brand-night text-white' : 'text-brand-night hover:bg-brand-mist'}`}
                >
                  <span className={`grid size-10 shrink-0 place-items-center rounded-xl transition-colors duration-300 ${on ? 'bg-white/15 text-white' : 'bg-brand-mist text-brand-deep'}`}>
                    <ExtraIcon name={s.icon} className="size-5" />
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="font-bold md:text-lg">{s.name}</span>
                    {s.price && <span className={`text-sm ${on ? 'text-brand-haze' : 'text-brand-night/70'}`}>{s.price}</span>}
                  </span>
                  <Chevron className={`size-5 shrink-0 transition-transform duration-300 ${on ? 'translate-x-0.5 text-white' : 'text-brand-deep/60 group-hover:translate-x-0.5'}`} />
                </button>
              )
            })}
          </div>
        </div>

        {/* Detalle del elegido */}
        <div
          ref={panel}
          id="oferta-panel"
          role="tabpanel"
          aria-labelledby={`oferta-tab-${item.key}`}
          data-reveal
          className="grid grid-cols-1 gap-5 rounded-4xl bg-white p-3 shadow-soft ring-1 ring-brand-deep/10 sm:grid-cols-5 md:p-4 lg:col-span-8"
        >
          <figure data-panel-part className="relative aspect-4/3 overflow-hidden rounded-3xl bg-brand-mist sm:col-span-2 sm:aspect-auto sm:min-h-72">
            <img key={item.image.src} src={item.image.src} alt={item.image.alt} width={item.image.width} height={item.image.height} loading="lazy" decoding="async" className="absolute inset-0 size-full object-cover" />
          </figure>
          <div className="flex flex-col justify-center gap-4 px-2 pb-3 sm:col-span-3 sm:py-4 sm:pr-4">
            <p data-panel-part className="font-label text-label text-brand-deep">
              {item.name}
            </p>
            <h3 data-panel-part className="font-display text-big text-brand-night">
              {before}
              {em && <span className="italic text-brand-flame">{em}</span>}
              {after}
            </h3>
            <p data-panel-part className="text-lg text-brand-night/75">
              {item.text}
            </p>
            {item.price && (
              <p data-panel-part className="font-bold text-brand-night">
                {item.price}
              </p>
            )}
            <div data-panel-part className="mt-1">
              <Button href={item.cta.href} label={item.cta.label} variant="night" icon="whatsapp" cursor="Escribinos" />
            </div>
          </div>
        </div>
      </div>
    </Section>
  )
}
