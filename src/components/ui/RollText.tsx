import { useEffect, useRef } from 'react'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { gsap, SplitText, useGSAP } from '../../lib/gsap'

interface RollTextProps {
  text: string
  /** Lo controla el padre (hover/focus del link o botón que lo contiene). */
  active?: boolean
  className?: string
}

/**
 * Roll de letras: cada carácter tiene un duplicado debajo que sube con stagger.
 * Mismo componente en menú, botones y CTAs para que la interacción sea coherente.
 * El texto se parte recién la primera vez que se activa (no hay trabajo de más en el arranque).
 */
export function RollText({ text, active = false, className = '' }: RollTextProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const tl = useRef<gsap.core.Timeline | null>(null)
  const build = useRef<(() => gsap.core.Timeline) | null>(null)
  const reduced = useReducedMotion()

  useGSAP(
    (_, contextSafe) => {
      tl.current = null
      build.current = contextSafe!(() => {
        const [top, bottom] = gsap.utils.toArray<HTMLElement>('[data-roll]', ref.current)
        const a = SplitText.create(top, { type: 'chars', aria: 'none' })
        const b = SplitText.create(bottom, { type: 'chars', aria: 'none' })
        gsap.set(bottom, { visibility: 'visible' })
        // 140%: los acentos de mayúsculas (Í, Á) sobresalen del alto de línea y no deben asomar
        return gsap
          .timeline({ paused: true, defaults: { duration: 0.6, ease: 'reveal', stagger: 0.022 } })
          .to(a.chars, { yPercent: -140 }, 0)
          .fromTo(b.chars, { yPercent: 140 }, { yPercent: 0 }, 0)
      })
    },
    { scope: ref, dependencies: [text], revertOnUpdate: true },
  )

  useEffect(() => {
    if (reduced) return
    if (!tl.current) {
      if (!active || !build.current) return
      tl.current = build.current()
    }
    if (active) tl.current.timeScale(1).play()
    else tl.current.timeScale(1.4).reverse()
  }, [active, reduced])

  return (
    <span ref={ref} className={`relative inline-block overflow-hidden pb-descender mb-descender-pull align-bottom ${className}`}>
      <span data-roll className="block whitespace-nowrap">
        {text}
      </span>
      {/* invisible hasta que se arma el roll (si no, se superpone a la copia de arriba) */}
      <span data-roll aria-hidden="true" className="invisible absolute inset-x-0 top-0 block whitespace-nowrap">
        {text}
      </span>
    </span>
  )
}
