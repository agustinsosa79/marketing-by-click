import { asesoria, extras, sections } from '../../../data/content'
import { splitHeadline } from '../../../lib/headline'
import { Button } from '../../ui/Button'
import { Arrow, ExtraIcon } from '../../ui/Icon'

/**
 * Fuera de los planes, como una fila debajo de ellos (dentro de la sección Planes): pesa menos que los planes
 * pero se ve a la primera. Mantiene el ancla #asesoria (la usa el navbar).
 *   izquierda → la asesoría 1:1: foto, título, una frase, precio y WhatsApp
 *   derecha   → "También hacemos": web, sesión de fotos y a medida, cada uno con su WhatsApp ya escrito
 */
export function Asesoria() {
  const [before, em, after] = splitHeadline(asesoria.title)

  return (
    <div id={sections.asesoria} className="grid scroll-mt-24 grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-5">
      <article data-reveal className="flex flex-col gap-5 rounded-4xl bg-white p-5 shadow-soft ring-1 ring-brand-deep/10 sm:flex-row sm:items-center md:p-6 lg:col-span-7">
        <figure className="relative h-44 shrink-0 overflow-hidden rounded-3xl bg-brand-night sm:h-auto sm:w-40 sm:self-stretch">
          <img
            src={asesoria.image.src}
            alt={asesoria.image.alt}
            width={asesoria.image.width}
            height={asesoria.image.height}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 size-full object-cover object-center"
          />
          <span className="absolute top-3 left-3 rounded-full rounded-bl-sm bg-white px-3 py-1 font-display text-sm text-brand-deep">1:1</span>
        </figure>

        <div className="flex flex-col gap-3">
          <p className="font-label text-label text-brand-deep">{asesoria.eyebrow}</p>
          <h3 className="font-display text-3xl text-brand-night md:text-4xl">
            {before}
            {em && <span className="italic text-brand-flame">{em}</span>}
            {after}
          </h3>
          <p className="text-brand-night/75">{asesoria.text}</p>
          <div className="mt-1 flex flex-wrap items-center gap-x-5 gap-y-3">
            <Button href={asesoria.cta.href} label={asesoria.cta.label} variant="night" icon="whatsapp" cursor="Escribinos" />
            {asesoria.price && (
              <p className="flex items-baseline gap-2 text-brand-night">
                <span className="font-display text-3xl">{asesoria.price.value}</span>
                <span className="text-sm font-bold text-brand-night/70">
                  {asesoria.price.currency} {asesoria.price.detail}
                </span>
              </p>
            )}
          </div>
        </div>
      </article>

      <aside aria-labelledby="extras-title" data-reveal data-reveal-delay={0.08} className="flex flex-col gap-3 rounded-4xl bg-white p-5 shadow-soft ring-1 ring-brand-deep/10 md:p-6 lg:col-span-5">
        <h3 id="extras-title" className="font-label text-label text-brand-deep">
          {extras.eyebrow}
        </h3>
        <ul className="flex flex-1 flex-col">
          {extras.items.map((item) => (
            <li key={item.name} className="flex-1 border-b border-brand-deep/10 last:border-b-0">
              <a href={item.href} target="_blank" rel="noopener noreferrer" data-cursor={extras.cta} className="group flex h-full items-center gap-4 py-3">
                <span className="grid size-11 shrink-0 place-items-center rounded-2xl rounded-bl-md bg-brand-paper text-brand-deep transition duration-500 ease-expo group-hover:bg-brand-signal group-hover:text-brand-ink">
                  <ExtraIcon name={item.icon} className="size-5" />
                </span>
                <span className="flex min-w-0 flex-1 flex-wrap items-center gap-x-2 gap-y-1">
                  <span className="font-bold text-brand-night md:text-lg">{item.name}</span>
                  {item.price && <span className="rounded-full bg-brand-paper px-2.5 py-0.5 text-xs font-bold text-brand-deep">{item.price}</span>}
                </span>
                <Arrow className="size-5 shrink-0 text-brand-deep transition-transform duration-500 ease-expo group-hover:rotate-45" />
                <span className="sr-only">: {extras.cta} por WhatsApp</span>
              </a>
            </li>
          ))}
        </ul>
      </aside>
    </div>
  )
}
