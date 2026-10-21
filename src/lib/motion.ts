import { prefersReducedMotion } from '../hooks/useReducedMotion'
import { gsap, SplitText } from './gsap'

/**
 * Sistema de motion: un solo vocabulario para todo el sitio.
 * Eases registrados en lib/gsap.ts: "reveal" (expo.out), "hop" (transiciones grandes) y power3.out (UI).
 */
export const EASE = {
  reveal: 'reveal',
  hop: 'hop',
  ui: 'power3.out',
} as const

export const DUR = {
  micro: 0.22,
  fast: 0.35,
  base: 0.8,
  slow: 1.2,
} as const

export const STAGGER = {
  chars: 0.02,
  words: 0.04,
  lines: 0.08,
} as const

type Targets = gsap.TweenTarget

// Valor final de cada propiedad de entrada: siempre explícito (fromTo), nunca leído del DOM.
const REST: Record<string, number> = { x: 0, y: 0, xPercent: 0, yPercent: 0, scale: 1, scaleX: 1, scaleY: 1, rotate: 0, opacity: 1, autoAlpha: 1 }

/**
 * Reveal de entrada al hacer scroll.
 * - Usa fromTo con estado final explícito: un `from` que lee el valor actual puede quedar
 *   animando "de 0 a 0" y dejar el elemento invisible para siempre.
 * - En la versión reducida (?motion=reduce) queda solo el fade.
 */
export function revealFrom(targets: Targets, vars: gsap.TweenVars) {
  const reduced = prefersReducedMotion()
  const { scrollTrigger, stagger, duration, ease, delay, ...fromProps } = vars

  const from: gsap.TweenVars = reduced ? { opacity: 0 } : { opacity: 0, ...fromProps }
  const to: gsap.TweenVars = {
    scrollTrigger,
    delay,
    stagger: reduced ? (stagger ? 0.04 : 0) : stagger,
    duration: reduced ? 0.6 : (duration ?? DUR.slow),
    ease: reduced ? 'power1.out' : (ease ?? EASE.reveal),
    immediateRender: true,
  }
  for (const key of Object.keys(from)) to[key] = REST[key] ?? 0

  return gsap.fromTo(targets, from, to)
}

/**
 * Entradas declarativas: cualquier elemento con `data-reveal` dentro de `scope` anima al entrar en viewport.
 * Un solo lenguaje para todo el sitio (fluidez): sube un poco y aparece, siempre igual, sin importar el tipo.
 * La única excepción es `chars` (letra por letra), reservada para el cierre ("¿Hablamos?").
 * Los valores viejos (lines, words, rise, cta, rule, clip, pop, fade) quedan como sinónimos de la entrada común.
 * `data-reveal-delay="0.2"` suma un retraso (escalonado de listas). Los elementos dentro de [hidden] se ignoran.
 * Se llama desde el useGSAP de cada sección (el contexto revierte todo al desmontar).
 */
export function setupReveals(scope: Element | Document = document) {
  const reduced = prefersReducedMotion()
  const els = gsap.utils.toArray<HTMLElement>('[data-reveal]', scope).filter((el) => !el.closest('[hidden]'))

  for (const el of els) {
    const type = el.dataset.reveal || 'fade'
    const delay = parseFloat(el.dataset.revealDelay ?? '0')
    const start = el.dataset.revealStart ?? 'top 90%'
    const scrollTrigger = { trigger: el, start, once: true }

    if (reduced) {
      gsap.fromTo(el, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.6, ease: 'power1.out', delay, scrollTrigger })
      continue
    }

    if (type === 'chars') {
      // máscara por línea, no por letra (con tracking negativo la máscara por letra corta los bordes)
      SplitText.create(el, {
        type: 'lines,chars',
        mask: 'lines',
        linesClass: 'split-line',
        aria: /^H[1-6]$/.test(el.tagName) ? 'auto' : 'none',
        onSplit: (self) => gsap.fromTo(self.chars, { yPercent: 110 }, { yPercent: 0, duration: DUR.base + 0.2, stagger: STAGGER.chars, ease: EASE.reveal, delay, scrollTrigger }),
      })
      continue
    }

    gsap.fromTo(el, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: DUR.base + 0.1, ease: EASE.reveal, delay, scrollTrigger })
  }
}
