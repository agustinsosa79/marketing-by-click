import { useEffect, useRef, useState } from 'react'
import { founder, hero, sections } from '../../../data/content'
import { useLenis } from '../../../hooks/useLenis'
import { useReducedMotion } from '../../../hooks/useReducedMotion'
import { playFounderVideo } from '../../../lib/events'
import { gsap, ScrollTrigger, useGSAP } from '../../../lib/gsap'
import { Preloader, type PreloaderRefs } from '../../preloader/Preloader'
import { usePreloaderTimeline } from '../../preloader/usePreloaderTimeline'
import { Button } from '../../ui/Button'
import { HeroCopy } from './HeroCopy'

/** Tarjeta final del video, en % del viewport (top, right, bottom, left). */
const CARD = {
  desktop: [15, 2.2, 41, 58],
  mobile: [37, 5, 37, 5],
}

// la tarjeta final tiene las esquinas redondeadas (mismo formato en ambos extremos para que interpole)
const inset = ([t, r, b, l]: number[], round = 0) => `inset(${t}% ${r}% ${b}% ${l}% round ${round}rem)`

/**
 * Hero (200svh con contenido sticky):
 *  - después del preloader el video ocupa toda la pantalla con el titular encima
 *  - con el scroll el video se recorta en una tarjeta: adentro el titular queda claro, afuera azul sobre papel
 */
export function Hero() {
  const scope = useRef<HTMLElement>(null)
  const refs: PreloaderRefs = {
    stage: useRef(null),
    title: useRef(null),
    isotipo: useRef(null),
    tagline: useRef(null),
    caption: useRef(null),
  }
  const video = useRef<HTMLDivElement>(null)
  const videoEl = useRef<HTMLVideoElement>(null)
  const overlay = useRef<HTMLDivElement>(null)
  const [preloaderDone, setPreloaderDone] = useState(false)
  const reduced = useReducedMotion()
  const { scrollTo } = useLenis()

  usePreloaderTimeline({ scope, refs, video, overlay, onComplete: () => setPreloaderDone(true) })

  // Con la versión reducida el video queda en pausa (se ve el poster). En la completa lo arranca el preloader.
  useEffect(() => {
    if (reduced) videoEl.current?.pause()
  }, [reduced])

  // Indicador de scroll: un segmento que baja en loop
  useGSAP(
    () => {
      if (reduced) return
      const loop = gsap.fromTo('[data-scroll-line]', { y: 0, autoAlpha: 1 }, { y: 10, autoAlpha: 0, duration: 1.4, ease: 'power2.in', repeat: -1 })
      // solo mientras el hero está en pantalla
      ScrollTrigger.create({ trigger: scope.current, start: 'top bottom', end: 'bottom top', onToggle: (self) => (self.isActive ? loop.play() : loop.pause()) })
    },
    { scope, dependencies: [reduced] },
  )

  // Video → tarjeta con el scroll (recién cuando terminó el preloader: antes el recorte es suyo)
  useGSAP(
    () => {
      if (!preloaderDone) return
      const card = () => (window.innerWidth < 768 ? CARD.mobile : CARD.desktop)
      const lines = gsap.utils.toArray<HTMLElement>('[data-hero-copy] [data-hero-title]', scope.current)

      if (reduced) {
        gsap.set(video.current, { clipPath: inset([0, 0, 0, 0]) })
        return
      }

      // el video del hero solo se decodifica mientras se ve
      const v = videoEl.current
      ScrollTrigger.create({
        trigger: scope.current,
        start: 'top bottom',
        end: 'bottom top',
        onToggle: (self) => (self.isActive ? v?.play().catch(() => {}) : v?.pause()),
      })

      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: { trigger: scope.current, start: 'top top', end: 'bottom bottom', scrub: true, invalidateOnRefresh: true },
      })
      tl.fromTo(video.current, { clipPath: inset([0, 0, 0, 0]) }, { clipPath: () => inset(card(), 1.75), duration: 0.8, ease: 'power2.inOut' }, 0.12)
        .fromTo(videoEl.current, { scale: 1 }, { scale: 1.18, duration: 0.92 }, 0.08)
        .fromTo(overlay.current, { opacity: 1 }, { opacity: 0.45, duration: 0.8 }, 0.12)
        .fromTo(lines, { yPercent: 0 }, { yPercent: -6, duration: 1 }, 0)
    },
    { scope, dependencies: [preloaderDone, reduced] },
  )

  return (
    <section id={sections.hero} ref={scope} data-bg="paper" className="relative isolate h-hero">
      <div className="sticky top-0 h-svh overflow-hidden bg-transparent">
        {/* z-0: copia sobre el papel (la semántica: h1) */}
        <div className="absolute inset-0 z-0">
          <HeroCopy variant="back" />
        </div>

        {/* z-10 / z-30: preloader (vive acá para usar el mismo video) */}
        {!preloaderDone && <Preloader refs={refs} />}

        {/* z-20: el video del preloader queda de fondo: nunca se desmonta */}
        {/* Arranca cerrado (inline: el HTML prerenderizado no debe mostrar el video antes de tiempo). El recorte lo maneja GSAP. */}
        <div ref={video} className="absolute inset-0 z-20 bg-brand-night" style={{ clipPath: 'inset(50% 50% 50% 50%)' }}>
          <video
            ref={videoEl}
            className="size-full object-cover"
            poster={hero.video.poster}
            muted
            loop
            playsInline
            preload="none"
            aria-hidden="true"
          >
            <source src={hero.video.src} type="video/mp4" />
          </video>
          <div ref={overlay} className="absolute inset-0 bg-brand-night/30">
            <div className="absolute inset-0 bg-brand-night/45" />
          </div>
          <HeroCopy variant="front" />
        </div>

        {/* z-40: capa interactiva (no se duplica) */}
        <div className="pointer-events-none absolute inset-x-0 bottom-5 z-40 flex h-14 items-center justify-end gap-4 px-5 md:bottom-6 md:gap-6 md:px-10">
          <button
            type="button"
            data-hero-item
            data-cursor={founder.player.cursorPlay}
            onClick={() => {
              playFounderVideo()
              const target = document.getElementById(sections.founder)
              if (target) scrollTo(target, { offset: -80, duration: 1.6 })
            }}
            className="group pointer-events-auto invisible hidden items-center gap-3 rounded-sm bg-white py-1.5 pr-5 pl-1.5 text-left text-brand-night transition-transform duration-300 ease-expo hover:-translate-y-1 active:scale-97 md:flex"
          >
            <span className="relative block size-11 overflow-hidden rounded-full">
              <img src={founder.video.poster} alt="" width={832} height={464} loading="lazy" decoding="async" className="size-full object-cover transition-transform duration-700 ease-expo group-hover:scale-115" />
              <span aria-hidden="true" className="absolute inset-0 grid place-items-center bg-brand-night/30 text-brand-paper">
                <svg viewBox="0 0 24 24" className="size-4 fill-current">
                  <path d="M7 4v16l13-8z" />
                </svg>
              </span>
            </span>
            <span className="text-label leading-tight">
              <span className="block font-bold">{hero.ianTeaser.label}</span>
              <span className="block font-medium opacity-70">{hero.ianTeaser.hint}</span>
            </span>
          </button>

          <div data-hero-item className="pointer-events-auto invisible">
            <Button href={hero.cta.href} label={hero.cta.label} icon="whatsapp" variant="sky" magnetic cursor="Escribinos" />
          </div>
        </div>
      </div>
    </section>
  )
}
