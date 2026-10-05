import type { RefObject } from 'react'
import { useLenis } from '../../hooks/useLenis'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { fontReady } from '../../lib/fonts'
import { gsap, useGSAP } from '../../lib/gsap'
import { releaseDeferred } from '../../lib/schedule'
import { cameFromSite } from '../../lib/visit'
import type { PreloaderRefs } from './Preloader'

interface Options {
  scope: RefObject<HTMLElement | null>
  refs: PreloaderRefs
  onComplete: () => void
}

const circle = (r: number, x: number, y: number) => `circle(${r}px at ${x}px ${y}px)`

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
 * Preloader "by Clic": un clic que termina en contacto. Labels de la timeline:
 *   intro    → termina la entrada del wordmark (empezó con CSS)
 *   enter    → el cursor cruza la pantalla en arco hasta "CLIC"
 *   hover    → "CLIC" se subraya como un link
 *   click    → el cursor se hunde, salen dos ondas y se abre el círculo azul Clic desde la punta
 *   message  → dentro del azul, la frase de la marca
 *   collapse → el círculo se cierra sobre el botón "Hablemos por WhatsApp" del hero
 *   handoff  → navbar + titular palabra por palabra + foto, lenis.start()
 * Debug: ?debug=preloader deja la timeline en pausa en window.__preloaderTl.
 */
export function usePreloaderTimeline({ scope, refs, onComplete }: Options) {
  const { start } = useLenis()
  const reduced = useReducedMotion()

  useGSAP(
    (_, contextSafe) => {
      // document explícito: la navbar está fuera del scope del hero
      const navBlocks = gsap.utils.toArray<HTMLElement>('[data-nav-block]', document)
      const navShell = document.querySelector<HTMLElement>('[data-navbar]')
      const stage = refs.stage.current!
      const title = refs.title.current!
      const clic = refs.clic.current!
      const cursor = refs.cursor.current!
      const ripple = refs.ripple.current!
      const fill = refs.fill.current!
      const inners = [...title.querySelectorAll<HTMLElement>('[data-preloader-inner]')]
      const mark = stage.querySelector('[data-preloader-mark]')
      const line = clic.querySelector('[data-clic-line]')
      const rings = ripple.querySelectorAll('[data-ring]')
      const captionInner = refs.caption.current!.querySelector('[data-caption-inner]')
      const heroMedia = scope.current!.querySelector<HTMLElement>('[data-hero-media]')
      const heroCta = scope.current!.querySelector<HTMLElement>('[data-hero-cta]')
      const heroLines = gsap.utils.toArray<HTMLElement>('[data-hero-line]', scope.current)
      const heroItems = gsap.utils.toArray<HTMLElement>('[data-hero-item]', scope.current)
      const debug = new URLSearchParams(location.search).get('debug') === 'preloader'

      // Estado inicial sincrónico (antes del primer paint): nada del hero/nav visible
      gsap.set(navShell, { autoAlpha: 0 })
      gsap.set(navBlocks, { autoAlpha: 0, yPercent: -120 })
      gsap.set(heroLines, { yPercent: 115 })
      gsap.set(heroItems, { autoAlpha: 0 })
      gsap.set(rings, { xPercent: -50, yPercent: -50, scale: 0 })
      // la punta del puntero (3, 2 en un viewBox de 24) queda en el punto exacto
      gsap.set(cursor.querySelector('[data-cursor-svg]'), { xPercent: -12.5, yPercent: -8.33 })

      const finish = () => {
        document.documentElement.dataset.ready = ''
        start()
        onComplete()
      }

      const revealHero = (tl: gsap.core.Timeline, at: string | number) => {
        const later = typeof at === 'string' ? `${at}+=0.2` : at + 0.2
        tl.to(navShell, { autoAlpha: 1, duration: 0.6 }, at)
          .to(navBlocks, { autoAlpha: 1, yPercent: 0, duration: 1, stagger: 0.07 }, at)
          .to(heroLines, { yPercent: 0, duration: 1.15, stagger: 0.045, ease: 'reveal' }, at)
          .fromTo(heroItems, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 1, stagger: 0.06, ease: 'reveal' }, later)
        if (heroMedia) {
          tl.fromTo(heroMedia, { clipPath: 'inset(100% 0% 0% 0% round 2rem)' }, { clipPath: 'inset(0% 0% 0% 0% round 2rem)', duration: 1.2, ease: 'hop' }, at).fromTo(
            heroMedia.querySelector('img'),
            { scale: 1.2 },
            { scale: 1, duration: 1.6, ease: 'reveal' },
            at,
          )
        }
      }

      // --- Llegada desde otra página del sitio (ej. del blog a /#planes): sin preloader, entrada corta del hero
      const buildQuick = contextSafe!(() => {
        const tl = gsap.timeline({ defaults: { ease: 'reveal' }, onComplete: finish })
        tl.call(start)
        revealHero(tl, 0)
        releaseDeferred()
      })

      // --- Versión reducida (?motion=reduce): mismo relato, solo fades
      const buildReduced = contextSafe!(() => {
        takeOverIntro(inners)
        gsap.set(navBlocks, { yPercent: 0 })
        gsap.set(heroLines, { yPercent: 0 })
        gsap
          .timeline({ defaults: { ease: 'power1.inOut' }, onComplete: finish })
          .to(inners, { opacity: 1, y: 0, duration: 0.6 })
          .to({}, { duration: 1 })
          .to(stage, { autoAlpha: 0, duration: 0.8 })
          .call(start)
          .fromTo([navShell, ...navBlocks, ...heroItems], { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.7, stagger: 0.03 }, '-=0.2')
        releaseDeferred()
      })

      const build = contextSafe!(() => {
        takeOverIntro(inners)
        const vw = window.innerWidth
        const vh = window.innerHeight

        // Punto del clic: sobre "CLIC", un poco a la derecha del centro (donde un usuario cliquearía)
        const c = clic.getBoundingClientRect()
        const x = c.left + c.width * 0.58
        const y = c.top + c.height * 0.55
        // Radio que cubre toda la pantalla desde ese punto
        const R = Math.hypot(Math.max(x, vw - x), Math.max(y, vh - y)) + 8
        // Centro del CTA del hero: ahí se cierra el círculo
        const cta = heroCta?.getBoundingClientRect()
        const cx = cta ? cta.left + cta.width / 2 : vw / 2
        const cy = cta ? cta.top + cta.height / 2 : vh / 2

        gsap.set(ripple, { x, y })
        gsap.set(fill, { clipPath: circle(0, x, y) })
        gsap.set(captionInner, { yPercent: 110 })

        const tl = gsap.timeline({ defaults: { ease: 'reveal' }, onComplete: finish })

        tl.addLabel('intro', 0)
          .to(inners, { opacity: 1, y: 0, duration: 0.8, stagger: 0.1 }, 'intro')
          .to(mark, { opacity: 1, duration: 0.6, ease: 'power1.out' }, 'intro+=0.3')

          // El cursor entra desde abajo a la derecha: x e y con curvas distintas = trayectoria en arco
          .addLabel('enter', 'intro+=0.5')
          .set(cursor, { autoAlpha: 1, x: vw * 0.94, y: vh * 1.08, rotate: 14 }, 'enter')
          .to(cursor, { x, duration: 1.1, ease: 'power3.inOut' }, 'enter')
          .to(cursor, { y, duration: 1.1, ease: 'power2.inOut' }, 'enter')
          .to(cursor, { rotate: 0, duration: 1.1, ease: 'power2.out' }, 'enter')

          // Hover: "CLIC" se subraya como un link
          .addLabel('hover', 'enter+=0.95')
          .to(line, { scaleX: 1, duration: 0.45, ease: 'power3.out' }, 'hover')

          // Clic: el cursor se hunde y rebota, dos ondas y el círculo azul se abre desde la punta
          .addLabel('click', 'hover+=0.4')
          .to(cursor, { scale: 0.78, duration: 0.11, ease: 'power2.in' }, 'click')
          .to(cursor, { scale: 1, duration: 0.55, ease: 'elastic.out(1, 0.45)' }, 'click+=0.11')
          .to(rings, { scale: 3.2, autoAlpha: 0, duration: 0.85, stagger: 0.12, ease: 'power2.out' }, 'click+=0.08')
          .to(fill, { clipPath: circle(R, x, y), duration: 1.15, ease: 'hop' }, 'click+=0.14')
          .to(cursor, { autoAlpha: 0, scale: 0.6, duration: 0.35, ease: 'power2.in' }, 'click+=0.55')

          // Mensaje dentro del azul
          .addLabel('message', 'click+=0.85')
          .to(captionInner, { yPercent: 0, duration: 0.9 }, 'message')
          .set(stage, { autoAlpha: 0 }, 'message+=0.4')

          // El círculo se cierra sobre el CTA del hero mientras entra el inicio
          .addLabel('collapse', 'message+=1.25')
          .to(captionInner, { yPercent: -110, duration: 0.5, ease: 'power3.in' }, 'collapse-=0.3')
          .to(fill, { clipPath: circle(0, cx, cy), duration: 1.05, ease: 'power3.inOut' }, 'collapse')
          .addLabel('handoff', 'collapse+=0.15')
          .call(start, undefined, 'handoff')
        revealHero(tl, 'handoff')

        if (debug || import.meta.env.DEV) (window as unknown as { __preloaderTl: gsap.core.Timeline }).__preloaderTl = tl
        if (debug) tl.pause()
        releaseDeferred()
      })

      // Medir con la fuente del wordmark ya cargada (guarda para el doble montaje de StrictMode)
      let alive = true
      fontReady('900 1em "Montserrat Display"', { googleSheet: false }).then(() => {
        if (!alive) return
        if (cameFromSite()) buildQuick()
        else if (reduced) buildReduced()
        else build()
      })
      return () => {
        alive = false
      }
    },
    { scope, dependencies: [reduced] },
  )
}
