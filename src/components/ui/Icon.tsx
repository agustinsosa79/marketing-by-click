import type { ComponentProps } from 'react'
import type { Service } from '../../data/content'
import { LOGO } from './logoPaths'

/** Íconos dibujados a mano de la marca, como máscara: toman el color del texto. */
export function Icon({ name, className = '' }: { name: 'instagram' | 'whatsapp'; className?: string }) {
  return <span aria-hidden="true" className={`icon-mask icon-${name} ${className}`} />
}

type MarkProps = ComponentProps<'svg'> & {
  /** Relleno de la burbuja (clase fill-*). Por defecto naranja, como sobre azul noche en el manual. */
  bubble?: string
  /** Relleno de las letras (clase fill-*). */
  letters?: string
}

/** Logo completo (manual Clic Studio): burbuja con "clic / studio" adentro. */
export function Logo({ bubble = 'fill-brand-signal', letters = 'fill-white', className = '', ...rest }: MarkProps) {
  return (
    <svg viewBox={LOGO.full.viewBox} aria-hidden="true" className={`block ${className}`} {...rest}>
      <path data-logo-bubble d={LOGO.full.bubble} className={bubble} />
      <path data-logo-letters d={LOGO.full.text} className={letters} />
    </svg>
  )
}

/**
 * Isotipo: burbuja con la "C". `rays` agrega las tres líneas del clic (variante secundaria del manual,
 * "uso en animaciones").
 */
export function Isotipo({ bubble = 'fill-brand-signal', letters = 'fill-white', rays = false, className = '', ...rest }: MarkProps & { rays?: boolean }) {
  return (
    <svg viewBox={LOGO.iso.viewBox} aria-hidden="true" className={`block overflow-visible ${className}`} {...rest}>
      <path data-logo-bubble d={LOGO.iso.bubble} className={bubble} />
      <path data-logo-letters d={LOGO.iso.text} className={letters} />
      {rays && (
        <g data-logo-rays className={`stroke-current ${letters.replace('fill-', 'text-')}`} strokeWidth="26" strokeLinecap="round" fill="none">
          <path d="M432 196L472 160" />
          <path d="M452 276H506" />
          <path d="M432 356L472 392" />
        </g>
      )}
    </svg>
  )
}

/** Burbuja sola: forma del patrón de marca (manual). Decorativa; toma el color con una clase fill-*. */
export function Bubble({ className = '', flip = false, ...rest }: ComponentProps<'svg'> & { flip?: boolean }) {
  return (
    <svg viewBox={LOGO.full.viewBox} aria-hidden="true" className={`block ${flip ? '-scale-x-100' : ''} ${className}`} {...rest}>
      <path d={LOGO.full.bubble} />
    </svg>
  )
}

/** Wordmark en línea "clicstudio": "clic" bold + "studio" regular (versión reducida del manual). */
export function Wordmark({ className = '', ...rest }: ComponentProps<'svg'>) {
  return (
    <svg viewBox={LOGO.wordmark.viewBox} aria-hidden="true" className={`block fill-current ${className}`} {...rest}>
      <path d={LOGO.wordmark.clic} />
      <path d={LOGO.wordmark.studio} />
    </svg>
  )
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

/** Íconos de los servicios fuera de los planes (mismo trazo que los de servicios). */
const EXTRA_PATHS: Record<'web' | 'camera' | 'custom', string[]> = {
  // ventana de navegador
  web: ['M3.5 6.5A1.5 1.5 0 0 1 5 5h14a1.5 1.5 0 0 1 1.5 1.5v11A1.5 1.5 0 0 1 19 19H5a1.5 1.5 0 0 1-1.5-1.5z', 'M3.5 9h17', 'M6.5 7h.01', 'M9 7h.01'],
  // cámara
  camera: ['M4 8.5A1.5 1.5 0 0 1 5.5 7h2l1.5-2h6l1.5 2h2A1.5 1.5 0 0 1 20 8.5v9a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 17.5z', 'M12 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6z'],
  // pieza de rompecabezas: lo que no entra en un plan
  custom: ['M9 4h3a2 2 0 1 1 4 0h0v4h0a2 2 0 1 1 0 4h0v4h-4a2 2 0 1 0-4 0H4v-4a2 2 0 1 0 0-4V4z'],
}

export function ExtraIcon({ name, className = '' }: { name: keyof typeof EXTRA_PATHS; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={`fill-none stroke-current stroke-2 ${className}`} strokeLinecap="round" strokeLinejoin="round">
      {EXTRA_PATHS[name].map((d) => (
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
