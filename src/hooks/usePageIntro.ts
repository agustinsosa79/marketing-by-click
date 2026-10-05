import { gsap, useGSAP } from '../lib/gsap'
import { releaseDeferred } from '../lib/schedule'
import { useLenis } from './useLenis'
import { useReducedMotion } from './useReducedMotion'

/**
 * Entrada de las páginas sin preloader (blog, notas, 404): aparece la navbar, arranca Lenis y se liberan
 * las animaciones diferidas. El contenido de arriba entra con CSS (clase intro-*), sin esperar al JS.
 */
export function usePageIntro() {
  const { start } = useLenis()
  const reduced = useReducedMotion()

  useGSAP(() => {
    const shell = document.querySelector('[data-navbar]')
    const blocks = gsap.utils.toArray<HTMLElement>('[data-nav-block]', document)
    if (reduced) gsap.set([shell, ...blocks], { autoAlpha: 1 })
    else {
      gsap.set(shell, { autoAlpha: 1 })
      gsap.fromTo(blocks, { autoAlpha: 0, yPercent: -120 }, { autoAlpha: 1, yPercent: 0, duration: 1, stagger: 0.07, delay: 0.15 })
    }
    document.documentElement.dataset.ready = ''
    start()
    releaseDeferred()
  })
}
