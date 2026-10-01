import { useRef, type RefObject } from 'react'
import { useLenis } from '../../hooks/useLenis'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { gsap, useGSAP } from '../../lib/gsap'

interface Options {
  open: boolean
  panel: RefObject<HTMLDivElement | null>
  page: RefObject<HTMLDivElement | null>
  toggle: RefObject<HTMLButtonElement | null>
  /** id de sección elegida en el menú: al cerrar, la página reaparece ya posicionada ahí. */
  target: RefObject<string | null>
}

/**
 * Apertura: la página (wrapper de main, no la navbar) se recorta al viewport y se achica hacia el centro
 * como una tarjeta (1 → 0.25 → 0) mientras los items del menú pasan de blur fuerte a nítido.
 * Cierre: los items se desenfocan y la página vuelve a crecer desde una tarjeta chiquita.
 */
export function useMenuAnimation({ open, panel, page, toggle, target }: Options) {
  const { stop, start, scrollTo } = useLenis()
  const reduced = useReducedMotion()
  const prevOpen = useRef(open)
  const tl = useRef<gsap.core.Timeline | null>(null)

  useGSAP(
    () => {
      if (prevOpen.current === open) return
      prevOpen.current = open

      const panelEl = panel.current!
      const pageEl = page.current!
      const items = gsap.utils.toArray<HTMLElement>('[data-menu-item]', panelEl)
      const secondary = gsap.utils.toArray<HTMLElement>('[data-menu-secondary]', panelEl)

      // Recorte y origen calculados según el scroll actual: el centro de la tarjeta es el del viewport
      const geometry = () => {
        const y = window.scrollY
        const vh = window.innerHeight
        const bottom = Math.max(0, pageEl.offsetHeight - y - vh)
        return {
          origin: `50% ${y + vh / 2}px`,
          clip: (radius: number) => `inset(${y}px 0px ${bottom}px 0px round ${radius}rem)`,
        }
      }

      tl.current?.kill()

      if (open) {
        stop()
        const g = geometry()
        gsap.set(pageEl, { transformOrigin: g.origin, clipPath: g.clip(0), willChange: 'transform' })
        gsap.set(panelEl, { autoAlpha: 1 })
        const focusFirst = () => panelEl.querySelector<HTMLElement>('[data-menu-item] a')?.focus({ preventScroll: true })

        if (reduced) {
          tl.current = gsap
            .timeline({ onComplete: focusFirst })
            .to(pageEl, { autoAlpha: 0, duration: 0.35, ease: 'power1.out' })
            .fromTo([...items, ...secondary], { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4, stagger: 0.03, ease: 'power1.out' })
          return
        }

        tl.current = gsap
          .timeline({ onComplete: focusFirst })
          .fromTo(pageEl, { scale: 1, clipPath: g.clip(0) }, { scale: 0.25, clipPath: g.clip(6), duration: 1, ease: 'expo.inOut' })
          .to(pageEl, { scale: 0, autoAlpha: 0, duration: 0.5, ease: 'power3.in' })
          .fromTo(
            items,
            { autoAlpha: 0, filter: 'blur(28px)', scale: 1.05 },
            { autoAlpha: 1, filter: 'blur(0px)', scale: 1, duration: 1.1, stagger: 0.07, ease: 'expo.out' },
            '-=0.55',
          )
          .fromTo(secondary, { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.06, ease: 'expo.out' }, '<0.4')
        return
      }

      // --- Cierre
      const id = target.current
      target.current = null
      if (id) {
        const section = document.getElementById(id)
        if (section) {
          // Lenis detenido bloquea el scroll programático: se libera un instante para saltar a la sección
          start()
          scrollTo(section.offsetTop, { immediate: true, force: true })
          stop()
        }
      }

      const g = geometry()
      const finish = () => {
        gsap.set(pageEl, { clearProps: 'transform,transformOrigin,clipPath,opacity,visibility,willChange' })
        gsap.set(panelEl, { autoAlpha: 0 })
        start()
        toggle.current?.focus({ preventScroll: true })
      }

      if (reduced) {
        gsap.set(pageEl, { clearProps: 'transform,clipPath' })
        tl.current = gsap
          .timeline({ onComplete: finish })
          .to([...items, ...secondary], { autoAlpha: 0, duration: 0.3, ease: 'power1.in' })
          .to(pageEl, { autoAlpha: 1, duration: 0.35, ease: 'power1.out' })
        return
      }

      gsap.set(pageEl, { transformOrigin: g.origin, clipPath: g.clip(6) })
      tl.current = gsap
        .timeline({ onComplete: finish })
        .to([...items, ...secondary], { autoAlpha: 0, filter: 'blur(16px)', duration: 0.4, stagger: 0.025, ease: 'power2.in' })
        .fromTo(pageEl, { scale: 0.06, autoAlpha: 1, clipPath: g.clip(6) }, { scale: 1, clipPath: g.clip(0), duration: 1.15, ease: 'expo.inOut', immediateRender: false }, '-=0.15')
    },
    { dependencies: [open, reduced] },
  )
}
