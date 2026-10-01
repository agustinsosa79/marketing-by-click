/** Íconos dibujados a mano de la marca, como máscara: toman el color del texto. */
export function Icon({ name, className = '' }: { name: 'instagram' | 'whatsapp'; className?: string }) {
  return <span aria-hidden="true" className={`icon-mask icon-${name} ${className}`} />
}

export function Logo({ className = '' }: { className?: string }) {
  return <span aria-hidden="true" className={`icon-mask logo-mask block ${className}`} />
}

export function Isotipo({ className = '' }: { className?: string }) {
  return <span aria-hidden="true" className={`icon-mask isotipo-mask block ${className}`} />
}
