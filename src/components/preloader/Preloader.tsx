import type { RefObject } from 'react'
import { preloader } from '../../data/content'
import { splitHeadline } from '../../lib/headline'
import { Bubble, Isotipo, WordmarkPart } from '../ui/Icon'
import { Pointer } from '../ui/Pointer'

export interface PreloaderRefs {
  stage: RefObject<HTMLDivElement | null>
  title: RefObject<HTMLDivElement | null>
  clic: RefObject<HTMLSpanElement | null>
  cursor: RefObject<HTMLDivElement | null>
  ripple: RefObject<HTMLDivElement | null>
  fill: RefObject<HTMLDivElement | null>
  caption: RefObject<HTMLParagraphElement | null>
}

/**
 * Preloader "un clic" (lo anima usePreloaderTimeline):
 *   z-10  stage   → papel + logo tipográfico "clicstudio" (entra con CSS antes del JS: es el LCP) + isotipo
 *   z-20  fill    → burbuja naranja de la marca que se abre desde el clic; después se cierra sobre el CTA del hero
 *         caption → la frase, encima de la burbuja (no escala con ella)
 *   z-30  cursor  → puntero que cruza la pantalla, subraya "clic" como un link y hace clic
 *         ripple  → las tres líneas del clic (variante secundaria del logo)
 */
export function Preloader({ refs }: { refs: PreloaderRefs }) {
  const [before, em] = splitHeadline(preloader.caption)

  return (
    <div data-preloader aria-hidden="true" className="absolute inset-x-0 top-0 z-50 h-svh overflow-hidden">
      <div ref={refs.stage} className="absolute inset-0 z-10 bg-brand-paper text-brand-night">
        {/* Logo tipográfico original (trazos del archivo del cliente): "clic" y "studio" comparten la misma
            caja de alto, así quedan con la proporción y la línea de base exactas del logo */}
        <div ref={refs.title} className="absolute inset-x-0 top-1/2 flex -translate-y-1/2 justify-center">
          <span className="block">
            <span data-preloader-inner className="block animate-rise">
              {/* "clic": el cursor lo subraya como un link antes de hacer clic */}
              <span ref={refs.clic} className="relative block">
                <WordmarkPart part="clic" className="h-wordmark" />
                <span data-clic-line className="absolute inset-x-0 -bottom-1 block h-1.5 origin-left scale-x-0 rounded-full bg-brand-signal md:-bottom-2 md:h-3" />
              </span>
            </span>
          </span>
          <span className="block">
            <span data-preloader-inner className="animation-delay-word block animate-rise">
              <WordmarkPart part="studio" className="h-wordmark" />
            </span>
          </span>
        </div>

        <div className="absolute inset-x-0 bottom-10 flex justify-center">
          <Isotipo data-preloader-mark className="w-10 opacity-0 md:w-12" />
        </div>
      </div>

      {/* Burbuja del clic: arranca en escala 0 (inline, para que el HTML prerenderizado no la muestre) */}
      <div ref={refs.fill} className="absolute top-0 left-0 z-20 w-64" style={{ transform: 'scale(0)' }}>
        <Bubble className="w-full fill-brand-signal" />
      </div>
      <div className="pointer-events-none absolute inset-0 z-20 grid place-items-center px-6">
        <p ref={refs.caption} className="invisible overflow-hidden pb-descender text-center font-display text-title text-brand-ink md:w-3/4">
          <span data-caption-inner className="block">
            {before}
            <span className="italic">{em}</span>
          </span>
        </p>
      </div>

      {/* Líneas del clic + cursor (GSAP los ubica en el punto del clic) */}
      <div ref={refs.ripple} className="pointer-events-none absolute top-0 left-0 z-30">
        <svg viewBox="-60 -60 120 120" className="absolute top-0 left-0 block size-28 -translate-1/2 overflow-visible stroke-brand-signal md:size-36" fill="none" strokeWidth="7" strokeLinecap="round">
          {/* arriba, arriba-izquierda e izquierda: el cuerpo del puntero ocupa abajo a la derecha */}
          <path data-ray d="M2 -26V-50" />
          <path data-ray d="M-18 -18L-36 -36" />
          <path data-ray d="M-26 2H-50" />
        </svg>
      </div>
      <div ref={refs.cursor} className="pointer-events-none invisible absolute top-0 left-0 z-30 w-12 md:w-20">
        {/* puntero clásico: la punta está en (3, 2) del viewBox; GSAP la alinea con el punto */}
        <Pointer data-cursor-svg className="block w-full overflow-visible" />
      </div>
    </div>
  )
}
