import Lenis from 'lenis'
import { prefersReducedMotion } from '../hooks/useReducedMotion'
import { gsap, ScrollTrigger } from './gsap'

let lenisInstance: Lenis | null = null
let tick: ((time: number) => void) | null = null

/**
 * Única instancia de Lenis, sincronizada con el ticker de GSAP y con ScrollTrigger.
 * Con movimiento reducido el lerp sube (scroll más directo) sin cortar el desplazamiento.
 * `respectReducedMotion: false` evita que Lenis fuerce lerp 1 por su cuenta; lo resolvemos acá.
 */
export function initLenis() {
  if (lenisInstance) return lenisInstance

  const reduced = prefersReducedMotion()
  lenisInstance = new Lenis({
    autoRaf: false,
    lerp: reduced ? 0.18 : 0.06,
    smoothWheel: true,
    wheelMultiplier: 1,
    respectReducedMotion: false,
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
