import Lenis from 'lenis'
import { gsap, ScrollTrigger } from './gsap'

let lenisInstance: Lenis | null = null
let tick: ((time: number) => void) | null = null

/**
 * Única instancia de Lenis (configuración del cliente), sincronizada con el ticker de GSAP y con ScrollTrigger.
 * `respectReducedMotion: false`: Lenis trae `true` por defecto y, con "efectos de animación"
 * desactivados en Windows, forzaba lerp 1 (scroll sin suavizado).
 */
export function initLenis() {
  if (lenisInstance) return lenisInstance

  lenisInstance = new Lenis({
    autoRaf: false,
    lerp: 0.06,
    smoothWheel: true,
    wheelMultiplier: 1,
    respectReducedMotion: false, // ignora la preferencia de accesibilidad del usuario
    anchors: true,
  })

  lenisInstance.on('scroll', ScrollTrigger.update)
  tick = (time: number) => lenisInstance?.raf(time * 1000)
  gsap.ticker.add(tick)
  gsap.ticker.lagSmoothing(0)

  // Arranca detenida: el preloader la libera en el handoff al hero
  lenisInstance.stop()

  if (import.meta.env.DEV || new URLSearchParams(location.search).has('debug')) {
    ;(window as unknown as { __lenis: Lenis }).__lenis = lenisInstance
  }

  return lenisInstance
}

export function getLenis() {
  return lenisInstance
}

export function destroyLenis() {
  if (tick) gsap.ticker.remove(tick)
  lenisInstance?.destroy()
  lenisInstance = null
  tick = null
}
