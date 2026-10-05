import { useRef, useState } from 'react'
import { proceso, sections } from '../../../data/content'
import { useLenis } from '../../../hooks/useLenis'
import { useReducedMotion } from '../../../hooks/useReducedMotion'
import { gsap, ScrollTrigger, useGSAP } from '../../../lib/gsap'
import { setupReveals } from '../../../lib/motion'
import { deferSetup } from '../../../lib/schedule'
import { Button } from '../../ui/Button'
import { Check } from '../../ui/Icon'
import { Section } from '../../ui/Section'
import { Label, Title } from '../../ui/Title'

const STAGES = proceso.stages
const COUNT = STAGES.length

function LoopIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={`fill-none stroke-current stroke-2 ${className}`} strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 12a8 8 0 0 1-14.3 4.9M4 12a8 8 0 0 1 14.3-4.9M18.5 3v4h-4M5.5 21v-4h4" />
    </svg>
  )
}

/**
 * Cómo trabajamos.
 * Desktop: la sección queda fija mientras se scrollea y muestra UNA etapa por vez (scrollytelling):
 *  - izquierda: la lista de etapas con una línea de progreso que se llena; la activa se resalta (click = ir a esa etapa)
 *  - derecha: el detalle de la etapa activa (cuándo, qué pasa y los pasos reales)
 *  - la última etapa ("Cada mes") muestra que el trabajo es un ciclo, no una línea que termina
 * Mobile: lista vertical con conector, sin fijar.
 */
export function Proceso() {
  const ref = useRef<HTMLElement>(null)
  const progressLine = useRef<HTMLSpanElement>(null)
  const trigger = useRef<ScrollTrigger | null>(null)
  const [active, setActive] = useState(0)
  const reduced = useReducedMotion()
  const { scrollTo } = useLenis()

  useGSAP(
    (_, contextSafe) =>
      deferSetup(
        contextSafe!(() => {
          setupReveals(ref.current!)
          const mm = gsap.matchMedia()
          mm.add('(min-width: 1024px)', () => {
            const setLine = gsap.quickSetter(progressLine.current, 'scaleY')
            trigger.current = ScrollTrigger.create({
              trigger: ref.current,
              start: 'top top',
              // ~80% de pantalla de scroll por etapa
              end: () => `+=${window.innerHeight * (COUNT - 1) * 0.8}`,
              pin: true,
              invalidateOnRefresh: true,
              onUpdate: (self) => {
                setLine(self.progress)
                setActive(Math.min(COUNT - 1, Math.floor(self.progress * COUNT)))
              },
            })
            return () => {
              trigger.current = null
            }
          })
          return () => mm.revert()
        }),
      ),
    { scope: ref },
  )

  // Click en una etapa: baja hasta el tramo del scroll que le corresponde
  const goTo = (i: number) => {
    const st = trigger.current
    if (!st) return
    scrollTo(st.start + ((i + 0.5) / COUNT) * (st.end - st.start), { duration: 1.2 })
  }

  const fade = reduced ? '' : 'transition duration-700 ease-expo'

  return (
    <Section id={sections.proceso} ref={ref} bg="deep" className="flex min-h-svh flex-col justify-center overflow-hidden px-5 pt-20 pb-8 md:px-10 md:pt-28 md:pb-14 lg:h-svh">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-10">
        {/* Título + etapas */}
        <div className="flex flex-col gap-6 lg:col-span-5 lg:justify-center lg:gap-10">
          <div className="flex flex-col gap-4">
            <Label tone="deep">{proceso.eyebrow}</Label>
            <Title title={proceso.title} tone="deep" />
          </div>

          <ol className="relative flex flex-col gap-4 lg:gap-2">
            {/* conector: base tenue + progreso (desktop) */}
            <span aria-hidden="true" className="absolute top-5 bottom-5 left-5 w-0.5 -translate-x-1/2 rounded-full bg-white/20" />
            <span ref={progressLine} aria-hidden="true" className="absolute top-5 bottom-5 left-5 hidden w-0.5 origin-top -translate-x-1/2 scale-y-0 rounded-full bg-white lg:block" />

            {STAGES.map((stage, i) => {
              const on = i === active
              const reached = i <= active
              const loop = 'loop' in stage
              return (
                <li key={stage.name} data-reveal="rise" data-reveal-delay={i * 0.06} className="relative">
                  <button
                    type="button"
                    onClick={() => goTo(i)}
                    aria-current={on ? 'step' : undefined}
                    className="group flex w-full items-start gap-4 text-left lg:items-center lg:py-2"
                  >
                    <span
                      className={`relative grid size-10 shrink-0 place-items-center rounded-full bg-white text-brand-deep ring-2 ring-white transition duration-500 ease-expo ${
                        reached ? '' : 'lg:bg-brand-deep lg:text-white lg:ring-white/30'
                      }`}
                    >
                      {loop ? <LoopIcon className="size-4" /> : <Check className="size-4" />}
                    </span>
                    <span className="flex flex-1 flex-col gap-0.5 lg:flex-row lg:items-baseline lg:justify-between lg:gap-4">
                      <span className={`font-display text-xl lg:text-2xl ${fade} ${on ? '' : 'lg:text-white/60 lg:group-hover:text-white'}`}>{stage.name}</span>
                      <span className={`text-sm font-semibold text-brand-haze ${fade} ${on ? '' : 'lg:text-white/60'}`}>{stage.when}</span>
                      {/* mobile: los pasos van en la misma lista */}
                      <span className="mt-1 text-sm text-white/85 lg:hidden">{stage.steps.join(' · ')}</span>
                    </span>
                  </button>
                </li>
              )
            })}
          </ol>

          <div data-reveal="cta">
            <Button href={proceso.cta.href} label={proceso.cta.label} variant="white" icon="whatsapp" cursor="Escribinos" />
          </div>
        </div>

        {/* Detalle de la etapa activa (desktop) */}
        <div className="relative hidden lg:col-span-7 lg:block">
          {STAGES.map((stage, i) => {
            const on = i === active
            return (
              <article
                key={stage.name}
                aria-hidden={!on}
                className={`absolute inset-0 flex flex-col justify-center rounded-4xl bg-brand-night/35 p-12 ring-1 ring-white/10 ${fade} ${
                  on ? 'translate-y-0 opacity-100' : i < active ? 'pointer-events-none -translate-y-8 opacity-0' : 'pointer-events-none translate-y-8 opacity-0'
                }`}
              >
                <p className="flex items-center gap-3 font-label text-label text-brand-haze">
                  {'loop' in stage && <LoopIcon className="size-4" />}
                  {stage.when}
                </p>
                <h3 className="mt-4 font-display text-title">{stage.name}</h3>
                <p className="mt-5 text-lead font-medium text-brand-haze">{stage.text}</p>
                <ul className="mt-10 flex flex-col border-t border-white/15">
                  {stage.steps.map((step) => (
                    <li key={step} className="flex items-center gap-4 border-b border-white/15 py-4 text-lg font-semibold">
                      <span className="grid size-7 shrink-0 place-items-center rounded-full bg-white text-brand-deep">
                        <Check className="size-3.5" />
                      </span>
                      {step}
                    </li>
                  ))}
                </ul>
              </article>
            )
          })}
        </div>
      </div>
    </Section>
  )
}
