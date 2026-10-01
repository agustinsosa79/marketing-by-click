import { PAGE_COLORS, type PageBg } from '../lib/pageColors'
import { gsap, ScrollTrigger, useGSAP } from '../lib/gsap'
import { DUR } from '../lib/motion'

/**
 * Interpolación del fondo de página: cuando una sección [data-bg] cruza la mitad del viewport,
 * la capa [data-page-bg] de <main> va hacia su color. Es un solo elemento: cambiar una variable CSS
 * en :root obligaba a recalcular los estilos de toda la página en cada frame de la transición.
 */
export function usePageColors() {
  useGSAP(() => {
    const layer = document.querySelector<HTMLElement>('[data-page-bg]')
    if (!layer) return
    const sections = gsap.utils.toArray<HTMLElement>('[data-bg]', document)

    const triggers = sections.map((section) =>
      ScrollTrigger.create({
        trigger: section,
        start: 'top 55%',
        end: 'bottom 55%',
        onToggle: (self) => {
          if (!self.isActive) return
          gsap.to(layer, { backgroundColor: PAGE_COLORS[section.dataset.bg as PageBg], duration: DUR.base, ease: 'power2.inOut', overwrite: true })
        },
      }),
    )
    return () => triggers.forEach((t) => t.kill())
  })
}
