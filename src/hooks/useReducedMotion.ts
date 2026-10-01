import { useSyncExternalStore } from 'react'

const OVERRIDE_KEY = 'mbc:motion'

/**
 * Política de movimiento:
 *  - por defecto respeta `prefers-reduced-motion` del sistema
 *  - `?motion=reduce` fuerza la versión de fades (queda guardada en la pestaña)
 *  - `?motion=full` fuerza las animaciones completas (escape hatch: en Windows,
 *    “efectos de animación” apagados activa la preferencia del sistema)
 */
function readOverride(): 'reduce' | 'full' | null {
  try {
    const param = new URLSearchParams(window.location.search).get('motion')
    if (param === 'reduce') {
      sessionStorage.setItem(OVERRIDE_KEY, 'reduce')
      return 'reduce'
    }
    if (param === 'full') {
      sessionStorage.setItem(OVERRIDE_KEY, 'full')
      return 'full'
    }
    if (param === 'auto') {
      sessionStorage.removeItem(OVERRIDE_KEY)
      return null
    }
    const stored = sessionStorage.getItem(OVERRIDE_KEY)
    if (stored === 'reduce' || stored === 'full') return stored
  } catch {
    /* sessionStorage puede fallar en iframe / modo privado */
  }
  return null
}

function osPrefersReduce() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function prefersReducedMotion() {
  if (typeof window === 'undefined') return false
  const override = readOverride()
  if (override === 'reduce') return true
  if (override === 'full') return false
  return osPrefersReduce()
}

function applyDataset(reduced: boolean) {
  if (typeof document === 'undefined') return
  document.documentElement.dataset.motion = reduced ? 'reduce' : 'full'
}

if (typeof window !== 'undefined') applyDataset(prefersReducedMotion())

function subscribe(onStoreChange: () => void) {
  const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
  const handler = () => {
    applyDataset(prefersReducedMotion())
    onStoreChange()
  }
  mq.addEventListener('change', handler)
  return () => mq.removeEventListener('change', handler)
}

export function useReducedMotion() {
  return useSyncExternalStore(subscribe, prefersReducedMotion, () => false)
}
