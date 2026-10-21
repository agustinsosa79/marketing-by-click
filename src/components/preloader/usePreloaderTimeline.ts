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
 * Preloader "un clic": un clic que termina en contacto. Labels de la timeline:
 *   intro    → termina la entrada del wordmark (empezó con CSS)
 *   enter    → el cursor cruza la pantalla en arco hasta "clic"
 *   hover    → "clic" se subraya como un link
 *   click    → el cursor se hunde, saltan las tres líneas del clic y se abre la burbuja naranja desde la punta
 *   message  → sobre la burbuja, la frase de la marca
 *   collapse → la burbuja se achica hasta el botón "Hablemos por WhatsApp" del hero
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
      const rays = ripple.querySelectorAll('[data-ray]')
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
      gsap.set(rays, { svgOrigin: '0 0', scale: 0.2, autoAlpha: 0 })
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
        // Escala de la burbuja para cubrir toda la pantalla desde ese punto. El rectángulo seguro adentro de
        // la forma (sin las curvas ni la cola) mide ~76% del ancho y ~48% del alto de la caja, centrado.
        const bw = fill.offsetWidth
        const bh = fill.offsetHeight
        const S = Math.max(Math.max(x, vw - x) / (0.38 * bw), Math.max(y, vh - y) / (0.24 * bh)) * 1.05
        // Centro del CTA del hero: ahí se cierra el círculo
        const cta = heroCta?.getBoundingClientRect()
        const cx = cta ? cta.left + cta.width / 2 : vw / 2
        const cy = cta ? cta.top + cta.height / 2 : vh / 2

        gsap.set(ripple, { x, y })
        gsap.set(fill, { x, y, xPercent: -50, yPercent: -50, scale: 0, rotate: -8 })
        gsap.set(captionInner, { yPercent: 110 })

        const tl = gsap.timeline({ defaults: { ease: 'reveal' }, onComplete: finish })

        tl.addLabel('intro', 0)
          .to(inners, { opacity: 1, y: 0, duration: 0.6, stagger: 0.08 }, 'intro')
          .to(mark, { opacity: 1, duration: 0.5, ease: 'power1.out' }, 'intro+=0.2')

          // El cursor entra desde abajo a la derecha: x e y con curvas distintas = trayectoria en arco
          .addLabel('enter', 'intro+=0.25')
          .set(cursor, { autoAlpha: 1, x: vw * 0.94, y: vh * 1.08, rotate: 14 }, 'enter')
          .to(cursor, { x, duration: 0.75, ease: 'power3.inOut' }, 'enter')
          .to(cursor, { y, duration: 0.75, ease: 'power2.inOut' }, 'enter')
          .to(cursor, { rotate: 0, duration: 0.75, ease: 'power2.out' }, 'enter')

          // Hover: "CLIC" se subraya como un link
          .addLabel('hover', 'enter+=0.65')
          .to(line, { scaleX: 1, duration: 0.3, ease: 'power3.out' }, 'hover')

          // Clic: el cursor se hunde y rebota, saltan las líneas y la burbuja se abre desde la punta
          .addLabel('click', 'hover+=0.25')
          .to(cursor, { scale: 0.78, duration: 0.11, ease: 'power2.in' }, 'click')
          .to(cursor, { scale: 1, duration: 0.55, ease: 'elastic.out(1, 0.45)' }, 'click+=0.11')
          .to(rays, { scale: 1, autoAlpha: 1, duration: 0.25, stagger: 0.03, ease: 'back.out(2.5)' }, 'click+=0.04')
          .to(rays, { scale: 1.5, autoAlpha: 0, duration: 0.35, stagger: 0.03, ease: 'power2.in' }, 'click+=0.3')
          .to(fill, { scale: 0.9, rotate: 0, duration: 0.3, ease: 'back.out(2)' }, 'click+=0.12')
          .to(fill, { scale: S, duration: 0.8, ease: 'hop' }, 'click+=0.35')
          .to(cursor, { autoAlpha: 0, scale: 0.6, duration: 0.3, ease: 'power2.in' }, 'click+=0.5')

          // Mensaje sobre la burbuja
          .addLabel('message', 'click+=0.7')
          .set(refs.caption.current, { autoAlpha: 1 }, 'message')
          .to(captionInner, { yPercent: 0, duration: 0.6 }, 'message')
          .set(stage, { autoAlpha: 0 }, 'message+=0.4')

          // La burbuja se achica hasta el CTA del hero mientras entra el inicio
          .addLabel('collapse', 'message+=0.7')
          .to(captionInner, { yPercent: -110, duration: 0.4, ease: 'power3.in' }, 'collapse-=0.2')
          .set(refs.caption.current, { autoAlpha: 0 }, 'collapse+=0.2')
          .to(fill, { x: cx, y: cy, scale: 0, duration: 0.85, ease: 'power3.inOut' }, 'collapse')
          .addLabel('handoff', 'collapse+=0.1')
          .call(start, undefined, 'handoff')
        revealHero(tl, 'handoff')

        // Quien no quiere esperar la intro: con un clic (o tap) o una tecla, la animación se acelera y termina.
        // El scroll NO la controla: rueda y arrastre del dedo no la tocan (click no se dispara al arrastrar)
        // (la intro es parte de la marca, pero nunca un muro). Se quita sola al terminar.
        const events = ['click', 'keydown'] as const
        const skip = () => {
          tl.timeScale(5)
          events.forEach((e) => window.removeEventListener(e, skip))
        }
        if (!debug) events.forEach((e) => window.addEventListener(e, skip, { passive: true }))
        tl.eventCallback('onComplete', () => {
          events.forEach((e) => window.removeEventListener(e, skip))
          finish()
        })

        if (debug || import.meta.env.DEV) (window as unknown as { __preloaderTl: gsap.core.Timeline }).__preloaderTl = tl
        if (debug) tl.pause()
        releaseDeferred()
      })

      // Medir con la fuente del wordmark ya cargada (guarda para el doble montaje de StrictMode)
      let alive = true
      fontReady('700 1em Carlito').then(() => {
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
