import { useRef, useState } from 'react'
import { diagnostico, planes } from '../../../data/content'
import { useReducedMotion } from '../../../hooks/useReducedMotion'
import { gsap, useGSAP } from '../../../lib/gsap'
import { Button } from '../../ui/Button'
import { Section } from '../../ui/Section'
import { Label, Title } from '../../ui/Title'
import { useLenis } from '../../../hooks/useLenis'
import { setupReveals } from '../../../lib/motion'
import { deferSetup } from '../../../lib/schedule'
import { sections } from '../../../data/content'
import { Check } from '../../ui/Icon'

const QUESTIONS = diagnostico.questions
const LETTERS = ['A', 'B', 'C']

/**
 * Diagnóstico rápido (sección propia, después de Planes): tres preguntas, una por vez.
 * El plan recomendado es el más alto que pida alguna respuesta (anuncios → Plus o Premium, canales → Plus o Premium,
 * llamadas 1:1 semanales → Premium; todo según los planes reales). El resultado abre WhatsApp con el mensaje armado.
 */
export function Diagnostico({ onSeePlans }: { onSeePlans: () => void }) {
  const ref = useRef<HTMLDivElement>(null)
  const [answers, setAnswers] = useState<number[]>([])
  const reduced = useReducedMotion()
  const step = answers.length
  const done = step >= QUESTIONS.length
  const level = done ? Math.max(...answers) : 0
  const plan = planes.plans[level]

  // Cada pregunta (y el resultado) entra con la misma subida corta del resto del sitio
  const first = useRef(true)
  useGSAP(
    () => {
      if (first.current) {
        first.current = false
        return
      }
      const parts = ref.current!.querySelectorAll('[data-step-part]')
      if (reduced) gsap.fromTo(parts, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3 })
      else gsap.fromTo(parts, { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.05, ease: 'reveal' })
    },
    { scope: ref, dependencies: [step] },
  )

  const message = `${diagnostico.message} ${plan.name}.`
  const whatsapp = `${diagnostico.whatsapp}?text=${encodeURIComponent(message)}`

  return (
    <div ref={ref} aria-live="polite" className="flex flex-col gap-5">
      {/* progreso */}
      <div className="flex items-center gap-2" aria-hidden="true">
        {QUESTIONS.map((_, i) => (
          <span key={i} className="h-1.5 flex-1 overflow-hidden rounded-full bg-brand-deep/10">
            <span className={`block h-full origin-left rounded-full bg-brand-deep transition-transform duration-700 ease-expo ${i < step || done ? 'scale-x-100' : 'scale-x-0'}`} />
          </span>
        ))}
      </div>

      {!done ? (
        <div key={step} className="flex flex-col gap-4">
          <p data-step-part className="text-brand-night/70">
            {`${diagnostico.step} ${step + 1} ${diagnostico.of} ${QUESTIONS.length}`}
          </p>
          <h3 data-step-part className="font-display text-3xl md:text-4xl">
            {QUESTIONS[step].text}
          </h3>
          <ul className="flex flex-col gap-2.5">
            {QUESTIONS[step].options.map((option, i) => (
              <li key={option.label} data-step-part>
                <button
                  type="button"
                  onClick={() => setAnswers((a) => [...a, option.level])}
                  className="group flex w-full items-center gap-4 rounded-2xl bg-brand-mist p-3 text-left text-lg font-bold ring-1 ring-brand-deep/10 transition duration-300 ease-expo hover:bg-brand-night hover:text-white active:scale-99 md:p-4"
                >
                  <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-white text-sm text-brand-deep transition-colors duration-300 group-hover:bg-brand-signal group-hover:text-brand-ink">
                    {LETTERS[i]}
                  </span>
                  {option.label}
                </button>
              </li>
            ))}
          </ul>
          {step > 0 && (
            <button data-step-part type="button" onClick={() => setAnswers((a) => a.slice(0, -1))} className="link-underline self-start text-sm font-bold text-brand-deep">
              {diagnostico.back}
            </button>
          )}
        </div>
      ) : (
        <div key="resultado" className="flex flex-col gap-5">
          <p data-step-part className="font-label text-label text-brand-deep">
            {diagnostico.result}
          </p>
          <p data-step-part className="flex flex-wrap items-end gap-x-4 gap-y-1">
            <span className="font-display text-title">{plan.name}</span>
            <span className="pb-2 font-bold text-brand-night/70">
              {plan.price} {planes.currency} {planes.period}
            </span>
          </p>
          <ul data-step-part className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {plan.features.map((f) => (
              <li key={f} className="flex items-start gap-2.5 font-medium">
                <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-brand-signal text-brand-ink">
                  <Check className="size-3" />
                </span>
                {f}
              </li>
            ))}
          </ul>
          <p data-step-part className="text-brand-night/70">
            {diagnostico.resultText}
          </p>
          <div data-step-part className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <Button href={whatsapp} label={diagnostico.resultCta} variant="signal" icon="whatsapp" cursor="Escribinos" />
            <button type="button" onClick={onSeePlans} className="link-underline text-sm font-bold text-brand-deep">
              {diagnostico.seePlans}
            </button>
            <button type="button" onClick={() => setAnswers([])} className="link-underline text-sm font-bold text-brand-night/70">
              {diagnostico.restart}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * Sección del diagnóstico, después de los planes y antes de la asesoría: sobre el azul Clic,
 * título y bajada a la izquierda; las preguntas en una tarjeta blanca a la derecha.
 */
export function DiagnosticoSection() {
  const ref = useRef<HTMLElement>(null)
  const { scrollTo } = useLenis()
  useGSAP((_, contextSafe) => deferSetup(contextSafe!(() => setupReveals(ref.current!))), { scope: ref })
  return (
    <Section id={sections.diagnostico} ref={ref} bg="deep" className="px-5 pt-24 pb-20 md:px-10 md:pt-32 md:pb-28">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-center lg:gap-10">
        <div className="flex flex-col gap-4 lg:col-span-5 lg:gap-6">
          <Label tone="deep">{diagnostico.eyebrow}</Label>
          <Title title={diagnostico.title} tone="deep" />
          <p data-reveal className="text-lead text-white">
            {diagnostico.text}
          </p>
        </div>
        <div data-reveal className="rounded-4xl bg-white p-5 text-brand-night shadow-lift md:p-8 lg:col-span-7">
          <Diagnostico
            onSeePlans={() => {
              const target = document.getElementById(sections.planes)
              if (target) scrollTo(target, { duration: 1.4 })
            }}
          />
        </div>
      </div>
    </Section>
  )
}
