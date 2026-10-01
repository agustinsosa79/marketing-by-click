import { useCallback, useEffect, useMemo, useRef, type ReactNode } from 'react'
import { destroyLenis, getLenis, initLenis } from '../lib/lenis'
import { LenisContext, type LenisApi } from './lenisContext'

export function LenisProvider({ children }: { children: ReactNode }) {
  // Si alguien pide start/stop antes de que exista la instancia, se aplica al crearla.
  const wantsRunning = useRef(false)

  useEffect(() => {
    history.scrollRestoration = 'manual'
    window.scrollTo(0, 0)
    const lenis = initLenis()
    if (wantsRunning.current) lenis.start()
    return () => destroyLenis()
  }, [])

  const stop = useCallback(() => {
    wantsRunning.current = false
    getLenis()?.stop()
  }, [])

  const start = useCallback(() => {
    wantsRunning.current = true
    getLenis()?.start()
  }, [])

  const scrollTo = useCallback<LenisApi['scrollTo']>((target, options) => {
    getLenis()?.scrollTo(target, options)
  }, [])

  const api = useMemo<LenisApi>(() => ({ getLenis, stop, start, scrollTo }), [stop, start, scrollTo])

  return <LenisContext.Provider value={api}>{children}</LenisContext.Provider>
}
