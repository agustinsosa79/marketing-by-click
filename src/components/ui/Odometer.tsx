import { useRef } from 'react'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { gsap, useGSAP } from '../../lib/gsap'
import { deferSetup } from '../../lib/schedule'

interface OdometerProps {
  value: string
  className?: string
  /** Punto de entrada del ScrollTrigger. */
  start?: string
}

const DIGITS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']

/**
 * Número tipo odómetro: cada dígito es una columna 0–9 que rueda hasta su valor al entrar en viewport.
 * Los no-dígitos (+, %, espacios) quedan fijos. El valor real va como texto accesible.
 */
export function Odometer({ value, className = '', start = 'top 85%' }: OdometerProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const reduced = useReducedMotion()

  useGSAP(
    (_, contextSafe) =>
      // armado diferido: no compite con el preloader (lib/schedule.ts)
      deferSetup(
        contextSafe!(() => {
          const cols = gsap.utils.toArray<HTMLElement>('[data-odo-col]', ref.current)
          if (reduced) {
            cols.forEach((col) => gsap.set(col, { yPercent: -Number(col.dataset.odoCol) * 10 }))
            gsap.fromTo(ref.current, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.6, scrollTrigger: { trigger: ref.current, start, once: true } })
            return
          }
          cols.forEach((col, i) => {
            const digit = Number(col.dataset.odoCol)
            // vuelta extra: cada columna gira al menos una vez completa antes de frenar
            gsap.fromTo(
              col,
              { yPercent: 0 },
              {
                yPercent: -(digit * 10),
                duration: 1.35 + i * 0.16,
                ease: 'expo.out',
                scrollTrigger: { trigger: ref.current, start, once: true },
              },
            )
          })
        }),
      ),
    { scope: ref, dependencies: [reduced, value] },
  )

  return (
    <span ref={ref} className={`inline-flex leading-none ${className}`}>
      <span className="sr-only">{value}</span>
      {value.split('').map((ch, i) =>
        DIGITS.includes(ch) ? (
          <span key={i} aria-hidden="true" className="relative inline-block overflow-hidden">
            {/* reserva el ancho/alto del dígito final */}
            <span className="invisible">{ch}</span>
            <span data-odo-col={ch} className="absolute inset-x-0 top-0 flex flex-col">
              {DIGITS.map((d) => (
                <span key={d} className="block text-center">
                  {d}
                </span>
              ))}
            </span>
          </span>
        ) : (
          <span key={i} aria-hidden="true">
            {ch}
          </span>
        ),
      )}
    </span>
  )
}
