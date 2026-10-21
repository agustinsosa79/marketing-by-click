import { useEffect, useRef, type ReactNode } from 'react'
import { useLenis } from '../../hooks/useLenis'

interface ModalProps {
  open: boolean
  onClose: () => void
  /** Título visible de la ventana (también es su nombre accesible). */
  title: string
  label?: string
  /** Ancho máximo: md para formularios cortos, xl para tablas. */
  size?: 'md' | 'xl'
  children: ReactNode
}

/**
 * Ventana sobre la página (<dialog> nativo: foco atrapado, Escape cierra, el fondo queda inerte).
 * Mientras está abierta, Lenis se detiene y el contenido scrollea por dentro (data-lenis-prevent).
 * Entra con una subida corta (mismo lenguaje que el resto del sitio) y cierra con el fondo o la X.
 */
export function Modal({ open, onClose, title, label, size = 'md', children }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null)
  const { stop, start } = useLenis()

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) {
      dialog.showModal()
      stop()
    }
    if (!open && dialog.open) dialog.close()
  }, [open, stop])

  return (
    <dialog
      ref={ref}
      aria-label={title}
      onClose={() => {
        start()
        onClose()
      }}
      onClick={(e) => {
        // click en el fondo (fuera de la caja) = cerrar
        if (e.target === ref.current) ref.current.close()
      }}
      className={`modal m-auto max-h-modal-h w-modal-w overflow-hidden rounded-4xl bg-white p-0 text-brand-night shadow-lift backdrop:bg-brand-night/60 backdrop:backdrop-blur-sm ${size === 'xl' ? 'max-w-4xl' : 'max-w-2xl'}`}
    >
      <div data-lenis-prevent className="flex max-h-modal-h flex-col overflow-y-auto overscroll-contain">
        <header className="sticky top-0 z-10 flex items-start justify-between gap-4 bg-white/95 px-5 pt-5 pb-3 backdrop-blur md:px-8 md:pt-7">
          <div className="flex flex-col gap-1">
            {label && <p className="font-label text-label text-brand-deep">{label}</p>}
            <h2 className="font-display text-3xl md:text-4xl">{title}</h2>
          </div>
          <button
            type="button"
            onClick={() => ref.current?.close()}
            aria-label="Cerrar"
            className="grid size-10 shrink-0 place-items-center rounded-full bg-brand-paper text-brand-night transition duration-300 ease-expo hover:rotate-90 hover:bg-brand-signal hover:text-brand-ink"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" className="size-4 fill-none stroke-current stroke-2" strokeLinecap="round">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </header>
        <div className="px-5 pb-6 md:px-8 md:pb-8">{children}</div>
      </div>
    </dialog>
  )
}
