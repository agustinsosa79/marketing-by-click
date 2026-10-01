import { useContext } from 'react'
import { LenisContext } from '../app/lenisContext'

export function useLenis() {
  const api = useContext(LenisContext)
  if (!api) throw new Error('useLenis debe usarse dentro de <LenisProvider>')
  return api
}
