import type { RefObject } from 'react'
import { brand, preloader } from '../../data/content'
import { Isotipo } from '../ui/Icon'

export interface PreloaderRefs {
  stage: RefObject<HTMLDivElement | null>
  title: RefObject<HTMLDivElement | null>
  isotipo: RefObject<HTMLDivElement | null>
  tagline: RefObject<HTMLParagraphElement | null>
  caption: RefObject<HTMLParagraphElement | null>
}

/**
 * Capas del preloader. Viven dentro del Hero para que el video (que va entre ambas capas)
 * sea el mismo elemento que después queda de fondo:
 *   z-10  stage   → fondo paper, wordmark, isotipo, microtexto  (el video pasa POR DELANTE)
 *   z-20  video   → (en Hero)
 *   z-30  caption → frase debajo del video
 * Posiciones según reference/preloader-measurements.json (1920×912).
 */
export function Preloader({ refs }: { refs: PreloaderRefs }) {
  return (
    <>
      <div ref={refs.stage} aria-hidden="true" className="absolute inset-0 z-10 bg-brand-paper text-brand-deep">
        {/* Wordmark: una línea en desktop (~96% del ancho), dos en mobile. Centrado vertical. */}
        <div
          ref={refs.title}
          className="absolute inset-x-0 top-1/2 -translate-y-1/2 text-center font-display text-wordmark md:text-wordmark-wide md:whitespace-nowrap"
        >
          {/* Espacio tipográfico real entre palabras (escala con la fuente); en mobile, una palabra por línea */}
          {brand.wordmark.map((word, i) => (
            <span key={word} className="block md:inline">
              {i > 0 && ' '}
              {/* palabra entera (sin máscara ni split): pinta completa en su primer frame, que es el LCP */}
              <span data-preloader-word className="inline-block whitespace-nowrap align-top">
                <span data-preloader-inner className={`inline-block animate-rise ${i > 0 ? 'animation-delay-word' : ''}`}>
                  {word}
                </span>
              </span>
            </span>
          ))}
        </div>

        {/* Isotipo centrado a ~90% del alto; sube con el título y queda tapado por el video.
            Visible desde el primer paint (viene en el HTML prerenderizado). */}
        <div ref={refs.isotipo} className="absolute inset-x-0 bottom-12 flex justify-center">
          <Isotipo className="w-14 md:w-20" />
        </div>

        <p ref={refs.tagline} className="invisible absolute right-5 bottom-5 text-right text-xs leading-snug text-brand-mid md:right-8 md:bottom-6">
          {preloader.microtext.map((line) => (
            <span key={line} className="block overflow-hidden">
              <span data-tagline-line className="block">
                {line}
              </span>
            </span>
          ))}
        </p>
      </div>

      {/* Frase debajo del video: termina centrada a ~89.6% del alto */}
      <p
        ref={refs.caption}
        aria-hidden="true"
        className="invisible absolute inset-x-0 bottom-20 z-30 px-6 text-center text-sm font-black tracking-wide text-brand-deep uppercase md:text-xl"
      >
        {preloader.caption}
      </p>
    </>
  )
}
