import { useRef } from 'react'
import { asesoria, extras, sections } from '../../../data/content'
import { useGSAP } from '../../../lib/gsap'
import { splitHeadline } from '../../../lib/headline'
import { setupReveals } from '../../../lib/motion'
import { deferSetup } from '../../../lib/schedule'
import { Button } from '../../ui/Button'
import { Arrow, ExtraIcon } from '../../ui/Icon'
import { Section } from '../../ui/Section'
import { Label } from '../../ui/Title'

/**
 * Más allá de los planes: la asesoría 1:1 y los servicios que se cotizan por proyecto (web, sesión de fotos, a medida).
 * Jerarquía: va después de Planes y pesa menos que ellos (sin títulos de sección gigantes ni precios grandes),
 * pero con dos bloques bien distintos para que no pasen desapercibidos:
 *   izquierda → la asesoría, en blanco, con la foto de Ian en videollamada
 *   derecha   → "También hacemos", en azul Clic, cada servicio con su WhatsApp ya escrito
 */
export function Asesoria() {
  const ref = useRef<HTMLElement>(null)
  const [before, em, after] = splitHeadline(asesoria.title)

  useGSAP((_, contextSafe) => deferSetup(contextSafe!(() => setupReveals(ref.current!))), { scope: ref })

  return (
    <Section id={sections.asesoria} ref={ref} bg="paper" className="px-5 pt-20 pb-16 md:px-10 md:pt-24 md:pb-24 short:pt-20 short:pb-16">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-5">
        {/* Asesoría 1:1 */}
        <article className="grid grid-cols-1 gap-3 rounded-4xl bg-white p-3 shadow-soft ring-1 ring-brand-deep/10 sm:grid-cols-5 md:p-4 lg:col-span-7">
          <figure data-reveal="clip" className="relative h-56 overflow-hidden rounded-3xl bg-brand-night sm:col-span-2 sm:h-auto">
            <img
              src={asesoria.image.src}
              alt={asesoria.image.alt}
              width={asesoria.image.width}
              height={asesoria.image.height}
              loading="lazy"
              decoding="async"
              className="absolute inset-0 size-full object-cover object-center"
            />
            <span className="absolute top-3 left-3 rounded-full bg-white px-3 py-1 font-display text-sm text-brand-deep md:top-4 md:left-4">1:1</span>
          </figure>

          <div className="flex flex-col gap-4 px-2 pt-2 pb-3 sm:col-span-3 sm:py-4 sm:pr-3 sm:pl-2 md:gap-5 lg:py-6">
            <div className="flex flex-col gap-3">
              <Label>{asesoria.eyebrow}</Label>
              <p data-reveal="rise" className="text-sm font-semibold text-brand-night/60">
                {asesoria.kicker}
              </p>
              <h2 data-reveal="lines" className="font-display text-big text-brand-deep">
                {before}
                {em && <span className="text-brand-signal">{em}</span>}
                {after}
              </h2>
              <p data-reveal="rise" className="text-base font-medium text-brand-night/75">
                {asesoria.text}
              </p>
            </div>

            <ol className="flex flex-col gap-2">
              {asesoria.points.map((point, i) => (
                <li key={point} data-reveal="rise" data-reveal-delay={i * 0.06} className="flex items-center gap-3 rounded-2xl bg-brand-paper px-3 py-2.5 text-sm font-bold text-brand-deep">
                  <span className="font-label text-label text-brand-signal">0{i + 1}</span>
                  {point}
                </li>
              ))}
            </ol>

            <div data-reveal="cta" className="mt-auto flex flex-wrap items-center gap-x-5 gap-y-3">
              <Button href={asesoria.cta.href} label={asesoria.cta.label} variant="signal" icon="whatsapp" cursor="Escribinos" />
              {asesoria.price && (
                <p className="flex items-baseline gap-2 text-brand-deep">
                  <span className="font-display text-3xl">{asesoria.price.value}</span>
                  <span className="text-sm font-semibold text-brand-night/60">
                    {asesoria.price.currency} {asesoria.price.detail}
                  </span>
                </p>
              )}
            </div>
          </div>
        </article>

        {/* Fuera de los planes */}
        <aside aria-labelledby="extras-title" data-reveal="fade" className="flex flex-col gap-5 rounded-4xl bg-brand-deep p-5 text-white md:p-7 lg:col-span-5">
          <div className="flex flex-col gap-3">
            <Label tone="deep">{extras.eyebrow}</Label>
            <h2 id="extras-title" className="font-display text-3xl md:text-4xl">
              {extras.title}
            </h2>
          </div>
          <ul className="flex flex-1 flex-col gap-2">
            {extras.items.map((item) => (
              <li key={item.name} className="flex-1">
                <a
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-cursor={extras.cta}
                  className="group flex h-full items-start gap-3 rounded-3xl bg-brand-night/35 p-4 ring-1 ring-white/10 transition duration-500 ease-expo hover:bg-brand-night/60 hover:ring-white/25 sm:items-center sm:gap-4"
                >
                  <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-brand-signal text-white transition-transform duration-500 ease-expo group-hover:-rotate-6 sm:size-12">
                    <ExtraIcon name={item.icon} className="size-5 sm:size-6" />
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col gap-1">
                    <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span className="font-bold md:text-lg">{item.name}</span>
                      {item.price && <span className="rounded-full bg-white px-2.5 py-0.5 text-xs font-bold text-brand-deep">{item.price}</span>}
                    </span>
                    <span className="text-sm text-brand-haze">{item.text}</span>
                    {/* celular: la fila entera es el link; la acción va escrita abajo en vez de la flecha */}
                    <span className="mt-1 flex items-center gap-1 text-sm font-bold text-white sm:hidden">
                      {extras.cta}
                      <Arrow className="size-3.5" />
                    </span>
                  </span>
                  <span className="hidden size-9 shrink-0 place-items-center rounded-full bg-white text-brand-deep transition duration-500 ease-expo group-hover:bg-brand-signal group-hover:text-white sm:grid">
                    <Arrow className="size-4 transition-transform duration-500 ease-expo group-hover:rotate-45" />
                  </span>
                  <span className="sr-only">por WhatsApp</span>
                </a>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </Section>
  )
}
