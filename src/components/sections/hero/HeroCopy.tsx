import type { ReactNode } from 'react'
import { hero } from '../../../data/content'

interface HeroCopyProps {
  /** front: va dentro del recorte del video (texto claro). back: sobre el papel (texto azul, es el semántico). */
  variant: 'front' | 'back'
}

const STYLES = {
  front: { text: 'text-brand-paper', accent: 'text-brand-sky', rule: 'bg-brand-paper/30' },
  back: { text: 'text-brand-deep', accent: 'text-brand-electric', rule: 'bg-brand-deep/15' },
}

/** Una línea del titular con su máscara. `index` sincroniza la entrada de ambas copias. */
function Line({ children, index, className = '' }: { children: ReactNode; index: number; className?: string }) {
  return (
    <span className={`block overflow-hidden whitespace-nowrap pb-descender -mb-descender ${className}`}>
      <span data-hero-line={index} className="block">
        {children}
      </span>
    </span>
  )
}

/**
 * Composición del hero. Se renderiza dos veces con la misma geometría:
 * la copia "front" vive dentro del video recortado y la "back" sobre el papel. Cuando el video se achica
 * en tarjeta con el scroll, el mismo titular queda claro adentro y azul afuera, sin moverse.
 */
export function HeroCopy({ variant }: HeroCopyProps) {
  const s = STYLES[variant]
  const front = variant === 'front'
  const Title = front ? 'p' : 'h1'
  const [l1, l2, l3, l4] = hero.headline

  return (
    <div data-hero-copy aria-hidden={front || undefined} className={`absolute inset-0 flex flex-col px-5 pt-24 pb-5 md:px-10 md:pt-28 md:pb-6 ${s.text}`}>
      {/* Arriba: etiqueta + bajada */}
      <div className="grid grid-cols-12 gap-x-6 gap-y-4">
        <div className="col-span-12 self-start md:col-span-3">
          <p data-hero-item className="text-label font-semibold uppercase">
            {hero.meta[0]}
          </p>
        </div>
        <div className="col-span-11 md:col-span-4 lg:col-span-3">
          <p data-hero-item className="text-xl leading-tight font-bold tracking-tight md:text-2xl">
            {hero.title}
          </p>
          <p data-hero-item className="mt-3 text-sm leading-relaxed opacity-85">
            {hero.subtitle}
          </p>
        </div>
      </div>

      {/* Titular */}
      <Title data-hero-title className="mt-auto font-display text-hero">
        <Line index={0}>{l1}</Line>
        <span className="block md:flex md:items-end md:justify-end md:gap-6">
          <Line index={1}>{l2}</Line>
          <Line index={2} className={`font-accent normal-case ${s.accent} pr-italic-overhang`}>
            {l3.replaceAll('*', '')}
          </Line>
        </span>
        <Line index={3}>{l4}</Line>
      </Title>

      {/* Barra inferior: datos + indicador de scroll (el CTA va en la capa interactiva) */}
      <div className="relative mt-5 flex h-14 items-center gap-6 text-label font-semibold md:mt-6">
        <span data-hero-rule aria-hidden="true" className={`absolute inset-x-0 top-0 h-hair origin-left ${s.rule}`} />
        <p data-hero-item className="hidden md:block">{hero.meta[1]}</p>
        <p data-hero-item className="hidden md:block">{hero.meta[2]}</p>
        <p data-hero-item className="flex items-center gap-3 md:hidden lg:flex">
          <span aria-hidden="true" className="relative block h-7 w-4 rounded-full border-2 border-current/40">
            <span data-scroll-line className="absolute top-1 left-1/2 block size-1 -translate-x-1/2 rounded-full bg-current" />
          </span>
          {hero.scroll}
        </p>
      </div>
    </div>
  )
}
