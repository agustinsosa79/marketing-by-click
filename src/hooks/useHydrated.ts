import { useSyncExternalStore } from 'react'

const subscribe = () => () => {}

/**
 * false en el prerender y durante la hidratación, true después.
 * Para montar partes solo-cliente (las secciones lazy) sin desajustes de hidratación.
 */
export function useHydrated() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  )
}
