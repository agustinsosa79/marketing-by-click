import { useRef } from 'react'
import { sections, testimonios, type Testimonial } from '../../../data/content'
import { useGSAP } from '../../../lib/gsap'
import { setupReveals } from '../../../lib/motion'
import { deferSetup } from '../../../lib/schedule'
import { Section } from '../../ui/Section'
import { Label, Title } from '../../ui/Title'

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join('')

/** Las comillas las pone la web: si el texto ya las trae, se sacan. */
const unquote = (text: string) => text.trim().replace(/^["“”«»]+|["“”«»]+$/g, '')

function Person({ t }: { t: Testimonial }) {
  return (
    <figcaption className="flex items-center gap-3">
      {t.photo ? (
        <img src={t.photo.src} alt={t.photo.alt || t.name} width={96} height={96} loading="lazy" decoding="async" className="size-11 shrink-0 rounded-full object-cover" />
      ) : (
        <span aria-hidden="true" className="grid size-11 shrink-0 place-items-center rounded-full bg-brand-mist text-sm font-bold text-brand-deep">
          {initials(t.name)}
        </span>
      )}
      <span className="flex flex-col leading-tight">
        <span className="font-bold">{t.name}</span>
        {t.role && <span className="text-sm text-brand-night/70">{t.role}</span>}
      </span>
    </figcaption>
  )
}

/** Tarjeta de un testimonio: texto a tamaño de lectura, nunca de titular. */
function Card({ t }: { t: Testimonial }) {
  return (
    <figure className="flex h-full flex-col gap-4 rounded-3xl bg-white p-6 text-brand-night shadow-lift">
      <span aria-hidden="true" className="font-display text-4xl leading-none text-brand-deep">
        “
      </span>
      <blockquote className="flex-1 leading-relaxed">{unquote(t.text)}</blockquote>
      <div className="border-t border-brand-deep/10 pt-4">
        <Person t={t} />
      </div>
    </figure>
  )
}

/** Columnas según cuántos haya (máximo 4): siempre tarjetas parejas, nunca una cita gigante. */
const COLS = ['', 'md:max-w-xl', 'md:grid-cols-2', 'md:grid-cols-3', 'md:grid-cols-2 xl:grid-cols-4']

/**
 * Testimonios: sección propia sobre el azul Clic, entre Proyectos (azul noche) y Planes (blanco): el cambio de
 * fondo marca que es otro bloque. Es la prueba social justo antes de los precios. Hasta 4 reseñas, que el
 * cliente agrega, edita o borra desde el panel (Testimonios). Sin testimonios, la sección no se muestra.
 */
export function Testimonios() {
  const ref = useRef<HTMLElement>(null)
  useGSAP((_, contextSafe) => deferSetup(contextSafe!(() => setupReveals(ref.current!))), { scope: ref })

  const items = testimonios.items.slice(0, 4)
  if (items.length === 0) return null

  return (
    <Section id={sections.testimonios} ref={ref} bg="deep" className="px-5 py-20 md:px-10 md:py-28">
      <div className="flex flex-col gap-4">
        <Label tone="deep">{testimonios.eyebrow}</Label>
        <Title title={testimonios.title} tone="deep" />
      </div>

      <ul className={`mt-10 grid grid-cols-1 gap-5 md:mt-12 md:gap-6 ${COLS[items.length]}`}>
        {items.map((t, i) => (
          <li key={t.name + i} data-reveal data-reveal-delay={i * 0.08}>
            <Card t={t} />
          </li>
        ))}
      </ul>
    </Section>
  )
}
