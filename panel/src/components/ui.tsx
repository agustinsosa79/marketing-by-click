import { useEffect, useRef, type ButtonHTMLAttributes, type ReactNode } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-brand-signal text-white hover:bg-brand-deep',
  secondary: 'bg-white text-brand-night ring-1 ring-brand-deep/15 hover:ring-brand-deep/40',
  ghost: 'text-brand-deep hover:bg-brand-deep/5',
  danger: 'bg-red-700 text-white hover:bg-red-800',
}

export function Button({ variant = 'primary', className = '', children, ...rest }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      type="button"
      {...rest}
      className={`inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold transition duration-200 ease-expo active:scale-97 disabled:pointer-events-none disabled:opacity-50 ${VARIANTS[variant]} ${className}`}
    >
      {children}
    </button>
  )
}

export function Spinner({ className = '' }: { className?: string }) {
  return <span aria-hidden="true" className={`inline-block size-4 animate-spin rounded-full border-2 border-current border-r-transparent ${className}`} />
}

/** Campo con etiqueta, ayuda y contador opcional (el contador cambia de color fuera del rango ideal para Google). */
export function Field({
  label,
  hint,
  count,
  ideal,
  children,
  htmlFor,
}: {
  label: string
  hint?: ReactNode
  count?: number
  ideal?: [number, number]
  children: ReactNode
  htmlFor?: string
}) {
  const inRange = ideal && count !== undefined ? count >= ideal[0] && count <= ideal[1] : true
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={htmlFor} className="text-sm font-bold text-brand-deep">
          {label}
        </label>
        {count !== undefined && (
          <span className={`text-xs font-semibold tabular-nums ${inRange ? 'text-emerald-700' : 'text-amber-700'}`}>
            {count}
            {ideal ? ` · ideal ${ideal[0]}–${ideal[1]}` : ''}
          </span>
        )}
      </div>
      {children}
      {hint && <p className="text-xs leading-relaxed text-brand-night/60">{hint}</p>}
    </div>
  )
}

export const inputClass =
  'w-full rounded-xl bg-white px-4 py-3 text-[0.95rem] text-brand-night ring-1 ring-brand-deep/15 transition placeholder:text-brand-night/35 focus:ring-2 focus:ring-brand-signal focus:outline-none'

export function Badge({ tone, children }: { tone: 'live' | 'draft' | 'neutral'; children: ReactNode }) {
  const tones = { live: 'bg-emerald-50 text-emerald-800 ring-emerald-200', draft: 'bg-amber-50 text-amber-800 ring-amber-200', neutral: 'bg-brand-deep/5 text-brand-deep ring-brand-deep/10' }
  return <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold ring-1 ${tones[tone]}`}>{children}</span>
}

/** Diálogo de confirmación nativo (<dialog>): accesible, con foco atrapado y cierre con Escape. */
export function ConfirmDialog({
  open,
  title,
  text,
  confirmLabel,
  busy,
  onConfirm,
  onClose,
}: {
  open: boolean
  title: string
  text: ReactNode
  confirmLabel: string
  busy?: boolean
  onConfirm: () => void
  onClose: () => void
}) {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])
  return (
    <dialog ref={ref} onClose={onClose} className="m-auto w-full max-w-md rounded-3xl p-0 shadow-lift backdrop:bg-brand-night/50 backdrop:backdrop-blur-sm">
      <div className="flex flex-col gap-4 p-6">
        <h2 className="text-xl font-extrabold tracking-tight text-brand-deep">{title}</h2>
        <div className="text-sm leading-relaxed text-brand-night/75">{text}</div>
        <div className="mt-2 flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose} disabled={busy}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={onConfirm} disabled={busy}>
            {busy && <Spinner />}
            {confirmLabel}
          </Button>
        </div>
      </div>
    </dialog>
  )
}

export interface ToastData {
  tone: 'ok' | 'error'
  title: string
  text?: ReactNode
}

export function Toast({ toast, onClose }: { toast: ToastData | null; onClose: () => void }) {
  useEffect(() => {
    if (!toast || toast.tone === 'error') return
    const id = window.setTimeout(onClose, 9000)
    return () => window.clearTimeout(id)
  }, [toast, onClose])
  if (!toast) return null
  return (
    <div role="status" className="fixed right-4 bottom-4 left-4 z-50 sm:left-auto sm:w-96">
      <div className={`flex gap-3 rounded-2xl p-4 shadow-lift ring-1 ${toast.tone === 'ok' ? 'bg-brand-night text-white ring-white/10' : 'bg-white text-red-800 ring-red-200'}`}>
        <span aria-hidden="true" className={`mt-0.5 grid size-6 shrink-0 place-items-center rounded-full text-xs font-black ${toast.tone === 'ok' ? 'bg-brand-signal' : 'bg-red-100'}`}>
          {toast.tone === 'ok' ? '✓' : '!'}
        </span>
        <div className="flex-1 text-sm">
          <p className="font-bold">{toast.title}</p>
          {toast.text && <div className={`mt-1 leading-relaxed ${toast.tone === 'ok' ? 'text-brand-haze' : 'text-red-700'}`}>{toast.text}</div>}
        </div>
        <button type="button" onClick={onClose} aria-label="Cerrar aviso" className="self-start text-lg leading-none opacity-60 hover:opacity-100">
          ×
        </button>
      </div>
    </div>
  )
}
