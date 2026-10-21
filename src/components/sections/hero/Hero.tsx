import { Fragment, useRef, useState } from 'react'
import { hero, nav, nosotros, sections } from '../../../data/content'
import { useLenis } from '../../../hooks/useLenis'
import { playFounderVideo } from '../../../lib/events'
import { splitHeadline } from '../../../lib/headline'
import { Preloader, type PreloaderRefs } from '../../preloader/Preloader'
import { usePreloaderTimeline } from '../../preloader/usePreloaderTimeline'
import { Button } from '../../ui/Button'
import { Icon } from '../../ui/Icon'

// Palabras del titular con su parte destacada
const [before, emphasis, after] = splitHeadline(hero.title)
const WORDS = [
  ...before.split(' ').filter(Boolean).map((word) => ({ word, em: false })),
  ...emphasis.split(' ').filter(Boolean).map((word) => ({ word, em: true })),
  ...after.split(' ').filter(Boolean).map((word) => ({ word, em: false })),
]

/**
 * Hero en una pantalla, sin animación de scroll:
 *  - izquierda: titular (palabra por palabra, cada una con su máscara), bajada y dos salidas: WhatsApp o ver planes
 *  - derecha: foto real de Ian en la Patagonia, nítida y sin overlay, con el acceso a su video
 * El preloader vive acá: su imagen sube como un telón y deja ver el hero.
 */
export function Hero() {
  const scope = useRef<HTMLElement>(null)
  const refs: PreloaderRefs = {
    stage: useRef(null),
    title: useRef(null),
    caption: useRef(null),
    clic: useRef(null),
    cursor: useRef(null),
    ripple: useRef(null),
    fill: useRef(null),
  }
  const [preloaderDone, setPreloaderDone] = useState(false)
  const { scrollTo } = useLenis()

  usePreloaderTimeline({
    scope,
    refs,
    onComplete: () => {
      setPreloaderDone(true)
      // llegada con ancla (ej. /#planes desde el blog): baja a la sección cuando ya está montada
      const id = decodeURIComponent(location.hash.slice(1))
      if (!id) return
      window.setTimeout(() => {
        const target = document.getElementById(id)
        if (target) scrollTo(target, { duration: 1.4 })
      }, 500)
    },
  })

  const openIan = () => {
    playFounderVideo()
    const target = document.getElementById(sections.nosotros)
    if (target) scrollTo(target, { duration: 1.6 })
  }

  return (
    <section id={sections.hero} ref={scope} data-bg="paper" className="relative isolate bg-brand-paper">
      <div className="flex min-h-svh flex-col gap-5 px-5 pt-20 pb-5 md:px-10 md:pt-28 md:pb-8 lg:grid lg:h-svh lg:grid-cols-12 lg:gap-10">
        {/* Texto */}
        <div className="flex flex-col lg:col-span-7 lg:justify-center lg:pt-6">
          <h1 className="mt-4 font-display text-hero text-brand-night">
            {WORDS.map(({ word, em }, i) => (
              <Fragment key={i}>
                {/* espacio fuera de la máscara: el titular corta línea donde le corresponde */}
                {i > 0 && ' '}
                <span className="inline-block overflow-hidden pb-descender mb-descender-pull align-top">
                  <span data-hero-line={i} className={`inline-block ${em ? 'text-brand-flame italic' : ''}`}>
                    {word}
                  </span>
                </span>
              </Fragment>
            ))}
          </h1>

          <p data-hero-item className="mt-4 text-lead font-medium text-brand-night/75 md:mt-6 lg:w-4/5">
            {hero.subtitle}
          </p>

          <div data-hero-item className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-7 md:mt-10">
            <div data-hero-cta>
              <Button href={hero.cta.href} label={hero.cta.label} icon="whatsapp" variant="signal" size="lg" cursor={nav.ctaCursor} className="w-full sm:w-auto" />
            </div>
            <a
              href={`#${hero.secondary.id}`}
              onClick={(e) => {
                e.preventDefault()
                const target = document.getElementById(hero.secondary.id)
                if (target) scrollTo(target, { duration: 1.6 })
              }}
              className="group flex items-center gap-2 self-center font-bold text-brand-night sm:self-auto"
            >
              <span className="link-underline">{hero.secondary.label}</span>
              <span aria-hidden="true" className="transition-transform duration-500 ease-expo group-hover:translate-y-1">
                ↓
              </span>
            </a>
          </div>
        </div>

        {/* Foto de Ian */}
        <figure data-hero-media className="relative min-h-64 flex-1 overflow-hidden rounded-4xl bg-brand-night shadow-lift lg:col-span-5 lg:h-full">
          <img
            src={hero.image.src}
            srcSet={hero.image.srcSet}
            sizes="(min-width: 1024px) 40vw, 100vw"
            alt={hero.image.alt}
            width={hero.image.width}
            height={hero.image.height}
            fetchPriority="high"
            decoding="async"
            className="absolute inset-0 size-full object-cover object-center"
          />

          <figcaption data-hero-item className="absolute top-4 left-4 flex items-center gap-2 rounded-3xl rounded-bl-md bg-white py-1.5 pr-4 pl-1.5 text-sm font-bold text-brand-night shadow-soft md:top-5 md:left-5">
            <a href={nosotros.instagram.href} target="_blank" rel="noopener noreferrer" aria-label={nosotros.instagram.label} className="grid size-7 place-items-center rounded-full bg-brand-signal text-brand-ink transition-transform duration-500 ease-expo hover:-rotate-12">
              <Icon name="instagram" className="size-3.5" />
            </a>
            {hero.founderTag}
          </figcaption>

          <button
            type="button"
            data-hero-item
            data-cursor={nosotros.player.cursorPlay}
            onClick={openIan}
            className="group absolute right-4 bottom-4 left-4 flex items-center gap-3 rounded-full bg-white p-1.5 pr-5 text-left text-brand-night shadow-lift transition-transform duration-500 ease-expo hover:-translate-y-1 active:scale-97 md:right-auto md:bottom-5 md:left-5"
          >
            <span className="relative grid size-11 shrink-0 place-items-center rounded-full bg-brand-signal text-brand-ink transition-transform duration-500 ease-expo group-hover:scale-110">
              <svg viewBox="0 0 24 24" aria-hidden="true" className="size-4 translate-x-px fill-current">
                <path d="M7 4v16l13-8z" />
              </svg>
            </span>
            <span className="text-sm leading-tight">
              <span className="block font-bold">{hero.ianTeaser.label}</span>
              <span className="block font-medium text-brand-night/60">{hero.ianTeaser.hint}</span>
            </span>
          </button>
        </figure>
      </div>

      {!preloaderDone && <Preloader refs={refs} />}
    </section>
  )
}
