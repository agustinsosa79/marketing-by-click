import { useSyncExternalStore } from 'react'

const OVERRIDE_KEY = 'mbc:motion'

/**
 * Política de movimiento: animaciones completas SIEMPRE, sin leer `prefers-reduced-motion`
 * del sistema (decisión del cliente: con "efectos de animación" apagados en Windows el sitio
 * quedaba sin preloader, sin scroll suave y sin animaciones).
 * La versión de fades sigue disponible solo a pedido:
 *   ?motion=reduce → versión reducida (queda guardada en la pestaña)
 *   ?motion=full   → vuelve a las animaciones completas
 */
function readOverride(): boolean {
  try {
    const param = new URLSearchParams(window.location.search).get('motion')
    if (param === 'reduce') sessionStorage.setItem(OVERRIDE_KEY, 'reduce')
    if (param === 'full' || param === 'auto') sessionStorage.removeItem(OVERRIDE_KEY)
    return sessionStorage.getItem(OVERRIDE_KEY) === 'reduce'
  } catch {
    return false
  }
}

const reduced = typeof window !== 'undefined' && readOverride()
if (typeof document !== 'undefined' && reduced) document.documentElement.dataset.motion = 'reduce'

export function prefersReducedMotion() {
  return reduced
}

const subscribe = () => () => {}

export function useReducedMotion() {
  return useSyncExternalStore(subscribe, prefersReducedMotion, () => false)
}
