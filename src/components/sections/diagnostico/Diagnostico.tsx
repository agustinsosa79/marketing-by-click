import { useRef, useState } from 'react'
import { diagnostico, planes, sections } from '../../../data/content'
import { useLenis } from '../../../hooks/useLenis'
import { useReducedMotion } from '../../../hooks/useReducedMotion'
import { gsap, useGSAP } from '../../../lib/gsap'
import { setupReveals } from '../../../lib/motion'
import { deferSetup } from '../../../lib/schedule'
import { Button } from '../../ui/Button'
import { Check } from '../../ui/Icon'
import { Section } from '../../ui/Section'
import { Label, Title } from '../../ui/Title'

const QUESTIONS = diagnostico.questions
const LETTERS = ['A', 'B', 'C']

/**
 * Diagnóstico rápido: tres preguntas, una por vez. El plan recomendado es el más alto que pida alguna respuesta
 * (anuncios → Plus o Premium, canales → Plus o Premium, llamadas 1:1 semanales → Premium; todo según los planes reales).
 * El resultado abre WhatsApp con el mensaje armado.
 */
export function Diagnostico() {
  const ref = useRef<HTMLElement>(null)
  const card = useRef<HTMLDivElement>(null)
  const [answers, setAnswers] = useState<number[]>([])
  const reduced = useReducedMotion()
  const { scrollTo } = useLenis()
  const step = answers.length
  const done = step >= QUESTIONS.length
  const level = done ? Math.max(...answers) : 0
  const plan = planes.plans[level]

  useGSAP((_, contextSafe) => deferSetup(contextSafe!(() => setupReveals(ref.current!))), { scope: ref })

  // Cada pregunta (y el resultado) entra desde la derecha; las opciones, escalonadas
  const first = useRef(true)
  useGSAP(
    () => {
      if (first.current) {
        first.current = false
        return
      }
      const parts = card.current!.querySelectorAll('[data-step-part]')
      if (reduced) gsap.fromTo(parts, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3 })
      else gsap.fromTo(parts, { autoAlpha: 0, x: 40 }, { autoAlpha: 1, x: 0, duration: 0.7, stagger: 0.06, ease: 'reveal' })
    },
    { scope: ref, dependencies: [step] },
  )

  const message = `${diagnostico.message} ${plan.name}.`
  const whatsapp = `${diagnostico.whatsapp}?text=${encodeURIComponent(message)}`

  return (
    <Section id={sections.diagnostico} ref={ref} bg="night" className="flex min-h-svh flex-col justify-center px-5 pt-20 pb-8 md:px-10 md:pt-28 md:pb-14">
      <div className="grid grid-cols-1 gap-5 md:gap-8 lg:grid-cols-12 lg:items-center lg:gap-10">
        <div className="flex flex-col gap-3 md:gap-4 lg:col-span-5 lg:gap-6">
          <Label tone="night">{diagnostico.eyebrow}</Label>
          <Title title={diagnostico.title} tone="night" />
          <p data-reveal="rise" className="text-lead font-medium text-brand-haze">
            {diagnostico.text}
          </p>

          {/* progreso */}
          <div data-reveal="rise" className="mt-2 flex items-center gap-2" aria-hidden="true">
            {QUESTIONS.map((_, i) => (
              <span key={i} className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/15">
                <span className={`block h-full origin-left rounded-full bg-brand-signal transition-transform duration-700 ease-expo ${i < step ? 'scale-x-100' : 'scale-x-0'}`} />
              </span>
            ))}
          </div>
        </div>

        <div ref={card} data-reveal="fade" aria-live="polite" className="rounded-4xl bg-brand-navy p-4 ring-1 ring-white/10 md:p-10 lg:col-span-7">
          {!done ? (
            <div key={step} className="flex flex-col gap-4 md:gap-6">
              <p data-step-part className="font-label text-label text-brand-haze">
                {diagnostico.step} {step + 1} {diagnostico.of} {QUESTIONS.length}
              </p>
              <h3 data-step-part className="font-display text-big">
                {QUESTIONS[step].text}
              </h3>
              <ul className="flex flex-col gap-2.5">
                {QUESTIONS[step].options.map((option, i) => (
                  <li key={option.label} data-step-part>
                    <button
                      type="button"
                      onClick={() => setAnswers((a) => [...a, option.level])}
                      className="group flex w-full items-center gap-4 rounded-2xl bg-white/5 px-3 py-2.5 text-left font-semibold ring-1 ring-white/10 transition duration-300 ease-expo hover:bg-white hover:text-brand-night active:scale-99 md:p-4 md:text-lg"
                    >
                      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-white/10 text-sm font-bold transition-colors duration-300 group-hover:bg-brand-signal group-hover:text-white">
                        {LETTERS[i]}
                      </span>
                      {option.label}
                    </button>
                  </li>
                ))}
              </ul>
              {step > 0 && (
                <button data-step-part type="button" onClick={() => setAnswers((a) => a.slice(0, -1))} className="link-underline self-start text-sm font-semibold text-brand-haze hover:text-white">
                  {diagnostico.back}
                </button>
              )}
            </div>
          ) : (
            <div key="resultado" className="flex flex-col gap-5">
              <p data-step-part className="font-label text-label text-brand-haze">
                {diagnostico.result}
              </p>
              <p data-step-part className="flex flex-wrap items-end gap-x-4 gap-y-1">
                <span className="font-display text-title">{plan.name}</span>
                <span className="pb-2 font-semibold text-brand-haze">
                  {plan.price} {planes.currency} {planes.period}
                </span>
              </p>
              <ul data-step-part className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm font-medium">
                    <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-brand-signal text-white">
                      <Check className="size-3" />
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
              <p data-step-part className="text-sm text-brand-haze">
                {diagnostico.resultText}
              </p>
              <div data-step-part className="flex flex-wrap items-center gap-x-6 gap-y-3">
                <Button href={whatsapp} label={diagnostico.resultCta} variant="signal" icon="whatsapp" cursor="Escribinos" />
                <a
                  href={`#${sections.planes}`}
                  onClick={(e) => {
                    e.preventDefault()
                    const target = document.getElementById(sections.planes)
                    if (target) scrollTo(target, { duration: 1.4 })
                  }}
                  className="link-underline text-sm font-bold"
                >
                  {diagnostico.seePlans}
                </a>
                <button type="button" onClick={() => setAnswers([])} className="link-underline text-sm font-semibold text-brand-haze hover:text-white">
                  {diagnostico.restart}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Section>
  )
}
