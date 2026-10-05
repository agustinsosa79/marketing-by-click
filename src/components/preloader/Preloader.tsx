import type { RefObject } from 'react'
import { brand, preloader } from '../../data/content'
import { splitHeadline } from '../../lib/headline'
import { Isotipo } from '../ui/Icon'
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
 * Preloader "by Clic" (lo anima usePreloaderTimeline):
 *   z-10  stage   → papel + wordmark (entra con CSS antes del JS: es el LCP) + isotipo
 *   z-20  fill    → círculo azul Clic que se abre desde el clic, con la frase; después se cierra sobre el CTA del hero
 *   z-30  cursor  → puntero que cruza la pantalla, subraya "CLIC" como un link y hace clic
 *         ripple  → ondas del clic
 */
export function Preloader({ refs }: { refs: PreloaderRefs }) {
  const [first, second] = brand.wordmark
  const [by, clic] = second.split(' ')
  const [before, em] = splitHeadline(preloader.caption)

  return (
    <div data-preloader aria-hidden="true" className="absolute inset-x-0 top-0 z-50 h-svh overflow-hidden">
      <div ref={refs.stage} className="absolute inset-0 z-10 bg-brand-paper text-brand-deep">
        {/* Wordmark: una línea en desktop (~96% del ancho), dos en mobile */}
        <div ref={refs.title} className="absolute inset-x-0 top-1/2 -translate-y-1/2 text-center font-wordmark text-wordmark md:text-wordmark-wide md:whitespace-nowrap">
          <span className="block md:inline">
            <span className="inline-block whitespace-nowrap align-top">
              <span data-preloader-inner className="inline-block animate-rise">
                {first}
              </span>
            </span>
          </span>{' '}
          <span className="block md:inline">
            <span className="inline-block whitespace-nowrap align-top">
              <span data-preloader-inner className="animation-delay-word inline-block animate-rise">
                {by}{' '}
                {/* "CLIC": el cursor lo subraya como un link antes de hacer clic */}
                <span ref={refs.clic} className="relative inline-block">
                  {clic}
                  <span data-clic-line className="absolute inset-x-0 -bottom-1 block h-1.5 origin-left scale-x-0 rounded-full bg-brand-signal md:h-2.5" />
                </span>
              </span>
            </span>
          </span>
        </div>

        <div className="absolute inset-x-0 bottom-10 flex justify-center">
          <Isotipo data-preloader-mark className="w-10 opacity-0 md:w-12" />
        </div>
      </div>

      {/* Círculo del clic: arranca cerrado (inline, para que el HTML prerenderizado no lo muestre) */}
      <div ref={refs.fill} className="absolute inset-0 z-20 grid place-items-center bg-brand-deep px-6" style={{ clipPath: 'circle(0px at 50% 50%)' }}>
        <p ref={refs.caption} className="overflow-hidden pb-descender text-center font-display text-title text-white md:w-3/4">
          <span data-caption-inner className="block">
            {before}
            <span className="text-brand-haze">{em}</span>
          </span>
        </p>
      </div>

      {/* Ondas + cursor (GSAP los ubica en el punto del clic) */}
      <div ref={refs.ripple} className="pointer-events-none absolute top-0 left-0 z-30">
        <span data-ring className="absolute top-0 left-0 block size-24 scale-0 rounded-full border-2 border-brand-signal" />
        <span data-ring className="absolute top-0 left-0 block size-24 scale-0 rounded-full border-2 border-brand-signal" />
      </div>
      <div ref={refs.cursor} className="pointer-events-none invisible absolute top-0 left-0 z-30 w-12 md:w-20">
        {/* puntero clásico: la punta está en (3, 2) del viewBox; GSAP la alinea con el punto */}
        <Pointer data-cursor-svg className="block w-full overflow-visible" />
      </div>
    </div>
  )
}
