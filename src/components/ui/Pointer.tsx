import type { ComponentProps } from 'react'

/**
 * Puntero clásico de la firma "by Clic" (preloader y Contacto). La punta está en (3, 2) del viewBox de 24:
 * para alinearla con un punto, desplazar el svg xPercent -12.5 / yPercent -8.33.
 */
export function Pointer(props: ComponentProps<'svg'>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path d="M3 2v17l4.6-4.3 3 6.6 3-1.4-3-6.4H17z" className="fill-brand-night stroke-white" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  )
}
