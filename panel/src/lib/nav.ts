import { useEffect } from 'react'

/** Navegación del panel (rutas con hash: ver App.tsx). */
export const go = (hash: string) => {
  window.location.hash = hash
}

/** Cambios sin guardar en la pantalla actual: la barra del panel pregunta antes de salir. */
export const unsaved = { current: false }

export const leaveOk = () => !unsaved.current || window.confirm('Hay cambios sin guardar. ¿Salir igual?')

/** Marca la pantalla con cambios sin guardar: avisa al cambiar de sección y al cerrar la pestaña. */
export function useLeaveGuard(dirty: boolean) {
  useEffect(() => {
    unsaved.current = dirty
    if (!dirty) return
    const warn = (e: BeforeUnloadEvent) => e.preventDefault()
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty])
}
