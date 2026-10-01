import type { RefObject } from 'react'
import { useLenis } from '../../hooks/useLenis'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { fontReady } from '../../lib/fonts'
import { releaseDeferred } from '../../lib/schedule'
import { gsap, useGSAP } from '../../lib/gsap'
import type { PreloaderRefs } from './Preloader'

interface Options {
  scope: RefObject<HTMLElement | null>
  refs: PreloaderRefs
  video: RefObject<HTMLDivElement | null>
  overlay: RefObject<HTMLDivElement | null>
  onComplete: () => void
}

const inset = (t: number, r: number, b: number, l: number) => `inset(${t}% ${r}% ${b}% ${l}%)`

/**
 * Geometría medida en reference/preloader-ref.mp4 (1920×912), en % del viewport.
 * Ver reference/preloader-measurements.json.
 */
const GEOMETRY = {
  // captionCenter: centro vertical final de la frase (desktop medido: 89.6%; mobile, justo debajo del video)
  // El ancho del wordmark (96% / 88%) lo resuelve el CSS: tokens text-wordmark-wide / text-wordmark.
  desktop: { x: 16.1, top: 17.1, bottom: 16.9, captionCenter: 0.896 },
  mobile: { x: 6, top: 30, bottom: 30, captionCenter: 0.78 },
}
/** Fracción inferior de la ÚLTIMA línea del wordmark que queda tapada por el video (medido: 41.5%). */
const TITLE_COVERED = 0.415
/** Cuánto sube la frase al entrar: viene desde el borde inferior, sin fade. */
const CAPTION_TRAVEL = 0.11
/** Duración de la entrada de letras, antes del t=0 de la referencia. */
const INTRO = 0.9

/**
 * El wordmark entra con una animación CSS (pinta antes del JS, ver Preloader.tsx).
 * Cuando el JS llega, GSAP la toma exactamente donde está y sigue desde ahí.
 */
function takeOverIntro(inners: HTMLElement[]) {
  for (const el of inners) {
    const cs = getComputedStyle(el)
    const opacity = parseFloat(cs.opacity)
    const y = cs.transform === 'none' ? 0 : new DOMMatrixReadOnly(cs.transform).m42
    el.style.animation = 'none'
    gsap.set(el, { opacity, y })
  }
}

/**
 * Timeline única del preloader → hero. Labels:
 *   intro  → letras entran con máscara (antes del t=0 de la referencia)
 *   ref    → t=0 de la referencia (todo lo demás se mide desde acá)
 *   line   → ref+0.27  tajo de video de 1px que crece desde el centro
 *   open   → ref+0.40  apertura vertical simétrica + el título sube (curva "aperture", medida)
 *   hold   → ref+1.45  el freno: todo quieto, solo el video
 *   expand → ref+2.2   pantalla completa con "hop"
 *   handoff→ ref+3.1   navbar + hero (las dos copias del titular en sincronía), lenis.start()
 *
 * Debug: ?debug=preloader expone window.__preloaderTl y la deja en pausa (scripts/compare-preloader.mjs).
 */
export function usePreloaderTimeline({ scope, refs, video, overlay, onComplete }: Options) {
  const { start } = useLenis()
  const reduced = useReducedMotion()

  useGSAP(
    (_, contextSafe) => {
      // document explícito: la navbar está fuera del scope del hero
      const navBlocks = gsap.utils.toArray<HTMLElement>('[data-nav-block]', document)
      const navShell = document.querySelector<HTMLElement>('[data-navbar]')
      const stage = refs.stage.current!
      const title = refs.title.current!
      const isotipo = refs.isotipo.current!
      const tagline = refs.tagline.current!
      const caption = refs.caption.current!
      const videoWrap = video.current!
      const videoInner = videoWrap.querySelector('video')
      // Hero: dos copias del titular (front/back) + capa interactiva
      const heroCopies = gsap.utils.toArray<HTMLElement>('[data-hero-copy]', scope.current)
      const heroLines = gsap.utils.toArray<HTMLElement>('[data-hero-line]', scope.current)
      const heroRules = gsap.utils.toArray<HTMLElement>('[data-hero-rule]', scope.current)
      const heroItems = gsap.utils.toArray<HTMLElement>('[data-hero-item]', scope.current)
      const debug = new URLSearchParams(location.search).get('debug') === 'preloader'

      // Estado inicial sincrónico (antes del primer paint): nada del hero/nav visible, video cerrado.
      gsap.set(videoWrap, { clipPath: inset(50, 50, 50, 50) })
      gsap.set(videoInner, { scale: 1.08 })
      gsap.set(overlay.current, { autoAlpha: 0 })
      gsap.set(navShell, { autoAlpha: 0 })
      gsap.set(navBlocks, { autoAlpha: 0, yPercent: -120 })
      gsap.set(heroLines, { yPercent: 115 })
      gsap.set(heroRules, { scaleX: 0 })
      gsap.set(heroItems, { autoAlpha: 0 })

      // El video empieza a bajar recién cuando arranca el preloader (no compite con JS y fuentes)
      const startVideo = () => {
        if (!videoInner) return
        videoInner.preload = 'auto'
        videoInner.play().catch(() => {})
      }

      const finish = () => {
        gsap.set(videoWrap, { clearProps: 'clipPath' })
        document.documentElement.dataset.ready = ''
        start()
        onComplete()
      }

      // --- Versión reducida (solo con ?motion=reduce): mismo relato, solo fades
      const buildReduced = contextSafe!(() => {
        takeOverIntro([...title.querySelectorAll<HTMLElement>('[data-preloader-inner]')])
        gsap.set(navBlocks, { yPercent: 0 })
        gsap.set(videoInner, { scale: 1 })
        gsap
          .timeline({ defaults: { ease: 'power1.inOut' }, onComplete: finish })
          .to(title.querySelectorAll('[data-preloader-inner]'), { opacity: 1, y: 0, duration: 0.6 })
          .fromTo(tagline, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.7 }, '-=0.4')
          .to({}, { duration: 1 })
          .set(videoWrap, { clipPath: inset(0, 0, 0, 0) })
          .to(stage, { autoAlpha: 0, duration: 0.9 })
          .fromTo(overlay.current, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.9 }, '<')
          .call(start)
          .set([...heroLines, ...heroRules], { yPercent: 0, scaleX: 1 })
          .fromTo(navShell, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.7 }, '-=0.3')
          .fromTo([...navBlocks, ...heroItems], { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.7, stagger: 0.04 }, '-=0.3')
        releaseDeferred()
      })

      const build = contextSafe!(() => {
        const vw = window.innerWidth
        const vh = window.innerHeight
        const g = vw < 768 ? GEOMETRY.mobile : GEOMETRY.desktop

        // Palabras enteras con fade + subida (sin máscara ni split: el wordmark es el LCP y tiene que pintar entero)
        const inners = [...title.querySelectorAll<HTMLElement>('[data-preloader-inner]')]
        takeOverIntro(inners)
        startVideo()
        const taglineLines = tagline.querySelectorAll('[data-tagline-line]')

        // El título sube hasta que el video le tapa el 41.5% de abajo de la última línea
        // (en mobile el wordmark va en dos líneas: la de arriba queda entera a la vista)
        const words = title.querySelectorAll<HTMLElement>('[data-preloader-word]')
        const last = words[words.length - 1].getBoundingClientRect()
        const rectTopPx = (g.top / 100) * vh
        const titleShift = rectTopPx + last.height * TITLE_COVERED - last.bottom

        // La frase termina centrada en g.captionCenter
        const c = caption.getBoundingClientRect()
        const captionY = g.captionCenter * vh - (c.top + c.height / 2)

        const lineY = 49.95 // tajo de ~1px
        const rect = inset(g.top, g.x, g.bottom, g.x)

        const tl = gsap.timeline({ defaults: { ease: 'reveal' }, onComplete: finish })

        tl.addLabel('intro', 0)
          .set(tagline, { visibility: 'visible' }, 'intro')
          // termina la entrada que empezó el CSS (si ya terminó, no hace nada visible)
          .to(inners, { opacity: 1, y: 0, duration: 0.8, stagger: 0.12 }, 'intro')
          .from(taglineLines, { yPercent: 110, duration: 0.7, stagger: 0.08 }, 'intro+=0.35')

          // t=0 de la referencia
          .addLabel('ref', INTRO)

          // La línea: tajo finísimo que va por delante del título y crece desde el centro
          .addLabel('line', `ref+=0.27`)
          .fromTo(videoWrap, { clipPath: inset(lineY, 50, lineY, 50) }, { clipPath: inset(lineY, g.x, lineY, g.x), duration: 0.13, ease: 'power2.out' }, 'line')

          // Apertura vertical simétrica + título e isotipo suben juntos (el isotipo queda tapado por el video)
          .addLabel('open', 'ref+=0.40')
          .fromTo(videoWrap, { clipPath: inset(lineY, g.x, lineY, g.x) }, { clipPath: rect, duration: 1.05, ease: 'aperture', immediateRender: false }, 'open')
          .to([title, isotipo], { y: titleShift, duration: 1.05, ease: 'aperture' }, 'open')
          // en desktop el video ya lo tapa; en mobile (video más bajo) se desvanece al llegar al borde
          .to(isotipo, { autoAlpha: 0, duration: 0.3, ease: 'power1.in' }, 'open+=0.45')

          // Frase debajo del video: sube y aparece
          .set(caption, { visibility: 'visible' }, 'ref+=1.1')
          .fromTo(caption, { y: captionY + CAPTION_TRAVEL * vh }, { y: captionY, duration: 0.36, ease: 'power3.out' }, 'ref+=1.1')

          // El freno
          .addLabel('hold', 'ref+=1.45')

          // Expansión automática a pantalla completa
          .addLabel('expand', 'ref+=2.2')
          .fromTo(videoWrap, { clipPath: rect }, { clipPath: inset(0, 0, 0, 0), duration: 1.2, ease: 'hop', immediateRender: false }, 'expand')
          .fromTo(videoInner, { scale: 1.08 }, { scale: 1, duration: 1.2, ease: 'hop', immediateRender: false }, 'expand')
          .to(inners, { yPercent: -40, autoAlpha: 0, duration: 0.75, stagger: 0.06, ease: 'power3.inOut' }, 'expand')
          .to([caption, tagline], { autoAlpha: 0, duration: 0.4, ease: 'power1.out' }, 'expand')
          .to(overlay.current, { autoAlpha: 1, duration: 0.9, ease: 'power2.inOut' }, 'expand+=0.5')
          .set(stage, { autoAlpha: 0 }, 'expand+=1.2')

          // Handoff: el mismo video queda de fondo; entran navbar y hero
          .addLabel('handoff', 'ref+=3.1')
          .call(start, undefined, 'handoff')
          .to(navShell, { autoAlpha: 1, duration: 0.7 }, 'handoff')
          .to(navBlocks, { autoAlpha: 1, yPercent: 0, duration: 1, stagger: 0.1 }, 'handoff')

        // Cada copia anima igual y en el mismo instante: el titular claro y el azul quedan alineados
        heroCopies.forEach((copy) => {
          const lines = [...copy.querySelectorAll<HTMLElement>('[data-hero-line]')].sort((a, b) => Number(a.dataset.heroLine) - Number(b.dataset.heroLine))
          tl.to(lines, { yPercent: 0, duration: 1.2, stagger: 0.08 }, 'handoff+=0.05')
            .to(copy.querySelectorAll('[data-hero-rule]'), { scaleX: 1, duration: 1.4, ease: 'expo.inOut' }, 'handoff+=0.1')
            .fromTo(copy.querySelectorAll('[data-hero-item]'), { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 1, stagger: 0.06 }, 'handoff+=0.35')
        })
        const uiItems = heroItems.filter((el) => !el.closest('[data-hero-copy]'))
        tl.fromTo(uiItems, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 1, stagger: 0.08 }, 'handoff+=0.55')

        if (debug || import.meta.env.DEV) (window as unknown as { __preloaderTl: gsap.core.Timeline }).__preloaderTl = tl
        if (debug) tl.pause()
        releaseDeferred()
      })

      // Medir y partir el texto con las fuentes ya cargadas (guarda para el doble montaje de StrictMode)
      let alive = true
      fontReady('900 1em "Montserrat Display"', { googleSheet: false }).then(() => alive && (reduced ? buildReduced() : build()))
      return () => {
        alive = false
      }
    },
    { scope, dependencies: [reduced] },
  )
}
