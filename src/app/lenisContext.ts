import type Lenis from 'lenis'
import { createContext } from 'react'

type ScrollTarget = Parameters<Lenis['scrollTo']>[0]
type ScrollOptions = Parameters<Lenis['scrollTo']>[1]

export interface LenisApi {
  getLenis: () => Lenis | null
  stop: () => void
  start: () => void
  scrollTo: (target: ScrollTarget, options?: ScrollOptions) => void
}

export const LenisContext = createContext<LenisApi | null>(null)
