/**
 * Diálogos del panel (reemplazan a window.confirm / window.prompt, que se ven como avisos del navegador).
 * Se piden desde cualquier lugar y devuelven una promesa; los muestra <DialogHost /> (montado en App).
 *   if (await ask({ title: '¿Salir sin guardar?', ... })) …
 *   const url = await askText({ title: 'Agregar enlace', ... })
 */

export interface AskOptions {
  title: string
  text?: string
  confirmLabel: string
  cancelLabel?: string
  /** danger: acción que pierde algo (botón rojo) */
  tone?: 'primary' | 'danger'
}

export interface AskTextOptions extends AskOptions {
  label: string
  placeholder?: string
  initial?: string
  /** Devuelve un mensaje de error si el valor no sirve (el diálogo no se cierra). */
  validate?: (value: string) => string | null
}

export type DialogRequest =
  | ({ kind: 'confirm'; resolve: (ok: boolean) => void } & AskOptions)
  | ({ kind: 'text'; resolve: (value: string | null) => void } & AskTextOptions)

let show: ((request: DialogRequest) => void) | null = null

/** Lo llama DialogHost al montarse. */
export const registerDialogHost = (fn: typeof show) => {
  show = fn
}

export const ask = (options: AskOptions) =>
  new Promise<boolean>((resolve) => {
    if (!show) return resolve(false)
    show({ kind: 'confirm', resolve, ...options })
  })

export const askText = (options: AskTextOptions) =>
  new Promise<string | null>((resolve) => {
    if (!show) return resolve(null)
    show({ kind: 'text', resolve, ...options })
  })
