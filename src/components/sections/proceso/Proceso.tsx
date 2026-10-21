import { useRef } from 'react'
import { proceso, sections } from '../../../data/content'
import { useGSAP } from '../../../lib/gsap'
import { setupReveals } from '../../../lib/motion'
import { deferSetup } from '../../../lib/schedule'
import { Button } from '../../ui/Button'
import { Section } from '../../ui/Section'
import { Label, Title } from '../../ui/Title'

function LoopIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={`fill-none stroke-current stroke-2 ${className}`} strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 12a8 8 0 0 1-14.3 4.9M4 12a8 8 0 0 1 14.3-4.9M18.5 3v4h-4M5.5 21v-4h4" />
    </svg>
  )
}

/**
 * Cómo trabajamos: el primer mes en tres pasos, una línea cada uno, unidos por una línea de tiempo.
 * Debajo, lo que se repite desde el mes 2 (el trabajo es un ciclo). Sin fijar la sección al scrollear:
 * se lee de un vistazo y no corta el ritmo de la página. Va sobre el azul Clic, entre Proyectos (azul noche) y Planes (blanco).
 */
export function Proceso() {
  const ref = useRef<HTMLElement>(null)
  useGSAP((_, contextSafe) => deferSetup(contextSafe!(() => setupReveals(ref.current!))), { scope: ref })

  return (
    <Section id={sections.proceso} ref={ref} bg="deep" className="px-5 pt-24 pb-20 md:px-10 md:pt-32 md:pb-28">
      <div>
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between lg:gap-10">
          <div className="flex flex-col gap-4">
            <Label tone="deep">{proceso.eyebrow}</Label>
            <Title title={proceso.title} tone="deep" />
          </div>
          <div data-reveal className="shrink-0">
            <Button href={proceso.cta.href} label={proceso.cta.label} variant="signal" icon="whatsapp" cursor="Escribinos" />
          </div>
        </div>

        <ol className="mt-10 grid grid-cols-1 gap-8 md:mt-14 md:grid-cols-3 md:gap-6">
          {proceso.stages.map((stage, i) => (
            <li key={stage.name} data-reveal data-reveal-delay={i * 0.08} className="relative flex flex-col gap-3 md:pt-10">
              {/* línea de tiempo: punto + tramo hacia el paso siguiente */}
              <span aria-hidden="true" className="absolute top-0 left-0 hidden h-0.5 w-full bg-white/30 md:block" />
              <span aria-hidden="true" className="absolute -top-1.5 left-0 hidden size-3.5 rounded-full bg-white ring-4 ring-brand-deep md:block" />
              <p className="flex items-baseline gap-3">
                <span className="font-display text-big text-white">0{i + 1}</span>
                <span className="font-label text-label text-white">{stage.when}</span>
              </p>
              <h3 className="font-display text-3xl md:text-4xl">{stage.name}</h3>
              <p className="text-lg text-white">{stage.text}</p>
            </li>
          ))}
        </ol>

        <p data-reveal className="mt-10 flex flex-col gap-3 rounded-3xl rounded-bl-md bg-brand-night/30 px-5 py-4 ring-1 ring-white/20 sm:flex-row sm:items-center sm:gap-4 md:mt-14">
          <span className="flex items-center gap-2.5 font-bold whitespace-nowrap">
            <span className="grid size-9 place-items-center rounded-full bg-white text-brand-night">
              <LoopIcon className="size-4" />
            </span>
            {proceso.monthly.name}
            <span className="font-label text-label font-normal text-white">{proceso.monthly.when}</span>
          </span>
          <span className="text-white">{proceso.monthly.text}</span>
        </p>
      </div>
    </Section>
  )
}
