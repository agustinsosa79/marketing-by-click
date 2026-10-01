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
 *   lines  → SplitText por líneas con máscara (títulos y párrafos)
 *   words  → palabras con máscara
 *   chars  → letras con máscara
 *   fade   → sube y aparece (default, bloques)
 *   rise   → igual pero más corto: cuerpo de texto y labels
 *   cta    → entrada un poco más marcada (escala + subida) para acciones
 *   rule   → línea divisoria que se dibuja de izquierda a derecha (scaleX)
 *   clip   → imagen que se abre desde abajo con clip-path + zoom-out de la imagen
 *   pop    → escala desde 0 con rebote (stickers, íconos)
 * `data-reveal-delay="0.2"` suma un retraso. Los elementos dentro de [hidden] se ignoran.
 * Se llama desde el useGSAP de cada sección (el contexto revierte todo al desmontar).
 */
export function setupReveals(scope: Element | Document = document) {
  const reduced = prefersReducedMotion()
  const els = gsap.utils.toArray<HTMLElement>('[data-reveal]', scope).filter((el) => !el.closest('[hidden]'))

  for (const el of els) {
    const type = el.dataset.reveal || 'fade'
    const delay = parseFloat(el.dataset.revealDelay ?? '0')
    const start = el.dataset.revealStart ?? 'top 88%'
    const scrollTrigger = { trigger: el, start, once: true }

    if (reduced) {
      gsap.fromTo(el, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.6, ease: 'power1.out', delay, scrollTrigger })
      continue
    }

    if (type === 'lines' || type === 'words' || type === 'chars') {
      const stagger = STAGGER[type]
      // chars: máscara por línea, no por letra (con tracking negativo la máscara por letra corta los bordes)
      SplitText.create(el, {
        type: type === 'chars' ? 'lines,chars' : type,
        mask: type === 'chars' ? 'lines' : type,
        // títulos: aria-label (permitido en headings). Párrafos: sin ARIA, el texto partido por líneas/palabras
        // se sigue leyendo bien y aria-label sobre <p> no está permitido.
        aria: /^H[1-6]$/.test(el.tagName) ? 'auto' : 'none',
        autoSplit: type === 'lines',
        onSplit: (self) =>
          gsap.fromTo(
            self[type],
            { yPercent: 110 },
            { yPercent: 0, duration: type === 'chars' ? DUR.base + 0.2 : DUR.slow, stagger, ease: EASE.reveal, delay, scrollTrigger },
          ),
      })
      continue
    }

    if (type === 'rule') {
      gsap.fromTo(el, { scaleX: 0, transformOrigin: '0% 50%' }, { scaleX: 1, duration: DUR.slow + 0.2, ease: 'expo.inOut', delay, scrollTrigger })
      continue
    }

    if (type === 'clip') {
      const img = el.querySelector('img, video')
      const tl = gsap.timeline({ delay, scrollTrigger })
      tl.fromTo(el, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: DUR.slow + 0.2, ease: 'expo.inOut' })
      if (img) tl.fromTo(img, { scale: 1.3 }, { scale: 1, duration: DUR.slow + 0.6, ease: EASE.reveal }, 0)
      continue
    }

    if (type === 'pop') {
      gsap.fromTo(el, { scale: 0, rotate: -25 }, { scale: 1, rotate: 0, duration: DUR.slow, ease: 'back.out(1.7)', delay, scrollTrigger })
      continue
    }

    if (type === 'rise') {
      gsap.fromTo(el, { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: DUR.base, ease: EASE.reveal, delay, scrollTrigger })
      continue
    }

    if (type === 'cta') {
      gsap.fromTo(
        el,
        { autoAlpha: 0, y: 28, scale: 0.97 },
        { autoAlpha: 1, y: 0, scale: 1, duration: DUR.slow, ease: EASE.reveal, delay, scrollTrigger },
      )
      continue
    }

    gsap.fromTo(el, { autoAlpha: 0, y: 28 }, { autoAlpha: 1, y: 0, duration: DUR.slow, ease: EASE.reveal, delay, scrollTrigger })
  }
}
