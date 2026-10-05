import type { ComponentProps } from 'react'
import type { Service } from '../../data/content'

/** Íconos dibujados a mano de la marca, como máscara: toman el color del texto. */
export function Icon({ name, className = '' }: { name: 'instagram' | 'whatsapp'; className?: string }) {
  return <span aria-hidden="true" className={`icon-mask icon-${name} ${className}`} />
}

export function Logo({ className = '', ...rest }: ComponentProps<'span'>) {
  return <span aria-hidden="true" className={`icon-mask logo-mask block ${className}`} {...rest} />
}

export function Isotipo({ className = '', ...rest }: ComponentProps<'span'>) {
  return <span aria-hidden="true" className={`icon-mask isotipo-mask block ${className}`} {...rest} />
}

/** Íconos de línea de los servicios (24×24, trazo redondeado, color del texto). */
const SERVICE_PATHS: Record<Service['icon'], string[]> = {
  // diana con flecha
  strategy: ['M12 3a9 9 0 1 0 9 9', 'M12 7.5a4.5 4.5 0 1 0 4.5 4.5', 'M12 12l8-8', 'M16.5 4H20v3.5'],
  // pieza de contenido con play
  content: ['M4 5.5A1.5 1.5 0 0 1 5.5 4h13A1.5 1.5 0 0 1 20 5.5v13a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 18.5z', 'M10 9v6l5-3z'],
  // gráfico que sube
  ads: ['M4 20h16', 'M6 16l4-4 3 3 6-7', 'M15 8h4v4'],
  // pluma de diseño
  branding: ['M12 3l6 7-6 11-6-11z', 'M12 10v4', 'M6 10h12'],
}

export function ServiceIcon({ name, className = '' }: { name: Service['icon']; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={`fill-none stroke-current stroke-2 ${className}`} strokeLinecap="round" strokeLinejoin="round">
      {SERVICE_PATHS[name].map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  )
}

export function Check({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={`fill-none stroke-current stroke-3 ${className}`} strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  )
}

export function Arrow({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={`fill-none stroke-current stroke-2 ${className}`} strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 17L17 7M9 7h8v8" />
    </svg>
  )
}
