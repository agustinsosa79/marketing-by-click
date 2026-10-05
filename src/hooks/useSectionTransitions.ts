import { gsap, ScrollTrigger, useGSAP } from '../lib/gsap'
import { useReducedMotion } from './useReducedMotion'
import { deferSetup } from '../lib/schedule'

const bgOf = (el: Element | null) => (el?.matches('[data-bg]') ? el : el?.querySelector('[data-bg]'))?.getAttribute('data-bg')

/**
 * Transición entre secciones: cuando una sección oscura viene después de una clara, entra como una tarjeta
 * redondeada y se expande a todo el ancho mientras sube (clip-path con scrub). Entre dos oscuras no hace falta.
 */
export function useSectionTransitions() {
  const reduced = useReducedMotion()

  useGSAP(
    (_, contextSafe) =>
      deferSetup(
        contextSafe!(() => {
          if (reduced) return
          const mm = gsap.matchMedia()
          mm.add({ desktop: '(min-width: 768px)', mobile: '(max-width: 767px)' }, (ctx) => {
            const side = ctx.conditions?.desktop ? 3 : 2.5
            const radius = ctx.conditions?.desktop ? 3 : 2
            gsap.utils.toArray<HTMLElement>('main [data-bg="night"], main [data-bg="deep"]').forEach((section) => {
              // el anterior puede ser el contenedor del pin de "Cómo trabajamos"
              const prev = section.parentElement?.classList.contains('pin-spacer') ? section.parentElement.previousElementSibling : section.previousElementSibling
              if (bgOf(prev) !== 'paper') return
              gsap.fromTo(
                section,
                { clipPath: `inset(0% ${side}% 0% ${side}% round ${radius}rem ${radius}rem 0rem 0rem)` },
                {
                  clipPath: 'inset(0% 0% 0% 0% round 0rem 0rem 0rem 0rem)',
                  ease: 'none',
                  scrollTrigger: { trigger: section, start: 'top bottom', end: 'top 20%', scrub: true },
                },
              )
            })
          })
          ScrollTrigger.refresh()
          return () => mm.revert()
        }),
      ),
    { dependencies: [reduced] },
  )
}
