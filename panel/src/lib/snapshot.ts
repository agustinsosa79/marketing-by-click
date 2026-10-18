import { useState } from 'react'

/**
 * ¿Hay cambios respecto de lo último guardado? Compara el contenido, no "si se tocó algo":
 * si se cambia un dato y se vuelve a dejar como estaba, no hay cambios (y el botón de guardar se apaga).
 *  - El primer valor que llega (al cargar, o el formulario vacío al crear) es la referencia.
 *  - Después de guardar, `markSaved(lo guardado)` mueve la referencia.
 * `normalize` deja afuera lo que no cuenta (por ejemplo, ids internos de la pantalla).
 */
export function useSnapshot<T>(value: T | null, normalize: (v: T) => unknown = (v) => v) {
  const key = value === null ? null : JSON.stringify(normalize(value))
  const [saved, setSaved] = useState<string | null>(key)
  // el contenido llegó después del primer render (pantallas que cargan del servidor): es la referencia
  if (saved === null && key !== null) setSaved(key)
  return {
    dirty: saved !== null && key !== null && key !== saved,
    markSaved: (next: T) => setSaved(JSON.stringify(normalize(next))),
  }
}
