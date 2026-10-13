import { useEffect } from 'react'
import { ask } from './dialog'

/** Navegación del panel (rutas con hash: ver App.tsx). */
export const go = (hash: string) => {
  window.location.hash = hash
}

/** Cambios sin guardar en la pantalla actual: la navegación del panel pregunta antes de salir. */
export const unsaved = { current: false }

/** Si hay cambios sin guardar, pregunta (con el modal del panel) antes de salir de la pantalla. */
export async function confirmLeave() {
  if (!unsaved.current) return true
  const ok = await ask({
    title: '¿Salir sin guardar?',
    text: 'Hay cambios en esta pantalla que todavía no se guardaron. Si salís ahora, se pierden.',
    confirmLabel: 'Salir sin guardar',
    cancelLabel: 'Seguir editando',
    tone: 'danger',
  })
  if (ok) unsaved.current = false
  return ok
}

/** Sale a otra pantalla del panel, preguntando antes si hay cambios sin guardar. */
export async function leaveTo(hash: string) {
  if (await confirmLeave()) go(hash)
}

/**
 * Marca la pantalla con cambios sin guardar: la navegación del panel pregunta antes de salir.
 * Al cerrar o recargar la pestaña el aviso lo muestra el navegador (es el único que puede hacerlo).
 */
export function useLeaveGuard(dirty: boolean) {
  useEffect(() => {
    unsaved.current = dirty
    if (!dirty) return
    const warn = (e: BeforeUnloadEvent) => e.preventDefault()
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty])
}
