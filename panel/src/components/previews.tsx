import { useState, type ReactNode } from 'react'
import { SITE_URL } from '../../shared/blog'
import type { FaqItem, PlanId, PricesInput, ProjectImage, ProjectInput } from '../../shared/site'

/**
 * Vistas previas: réplicas de las secciones del sitio con los mismos colores, tipografía y estructura,
 * para ver el resultado antes de guardar. (Si cambia el diseño del sitio, actualizar acá también.)
 */

/** Marco "navegador": deja claro que es una vista previa de la web, no parte del panel. */
export function PreviewFrame({ path, children, className = '' }: { path: string; children: ReactNode; className?: string }) {
  return (
    <figure className={`overflow-hidden rounded-2xl bg-white shadow-lift ring-1 ring-brand-deep/10 ${className}`}>
      <figcaption className="flex items-center gap-3 border-b border-brand-deep/10 bg-brand-paper/70 px-4 py-2.5">
        <span aria-hidden="true" className="flex gap-1.5">
          <i className="size-2.5 rounded-full bg-brand-deep/15" />
          <i className="size-2.5 rounded-full bg-brand-deep/15" />
          <i className="size-2.5 rounded-full bg-brand-deep/15" />
        </span>
        <span className="truncate rounded-full bg-white px-3 py-1 text-xs font-semibold text-brand-night/55 ring-1 ring-brand-deep/10">
          {SITE_URL.replace('https://', '')}
          {path}
        </span>
        <span className="ml-auto hidden shrink-0 text-xs font-bold text-brand-deep/60 sm:inline">Vista previa</span>
      </figcaption>
      {children}
    </figure>
  )
}

function Eyebrow({ children, dark = false }: { children: ReactNode; dark?: boolean }) {
  return (
    <p className={`flex items-center gap-2 font-label ${dark ? 'text-brand-haze' : 'text-brand-deep'}`}>
      <span aria-hidden="true" className="block h-0.5 w-5 rounded-full bg-brand-signal" />
      {children}
    </p>
  )
}

const Check = ({ className = '' }: { className?: string }) => (
  <span className={`grid size-4 shrink-0 place-items-center rounded-full ${className}`}>
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-2.5 fill-none stroke-current stroke-3">
      <path d="M5 12.5l4.5 4.5L19 7.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </span>
)

// ---------------------------------------------------------------- planes

/** Textos de cada plan (copia de src/data/content.ts del sitio: acá solo se editan los precios). */
const PLAN_COPY: Record<PlanId, { name: string; tone: 'light' | 'signal' | 'night'; for: string; features: string[] }> = {
  inicial: { name: 'Inicial', tone: 'light', for: 'Para empezar con contenido constante.', features: ['Análisis básico', 'Contenido orgánico, sin anuncios', 'Hasta 2 canales', '6 posteos, 8 historias y 2 reels al mes'] },
  plus: { name: 'Plus', tone: 'signal', for: 'Para sumar anuncios y vender más.', features: ['Análisis avanzado', 'Contenido + 2 campañas de Meta Ads*', 'Hasta 3 canales con contenido adaptado', '8 posteos, 12 historias y 4 reels al mes'] },
  premium: { name: 'Premium', tone: 'night', for: 'Para estar en todas las redes que necesites.', features: ['Análisis avanzado y llamadas 1:1 semanales', 'Hasta 5 campañas de Meta Ads simultáneas*', 'Todas las redes necesarias', '8 posteos, 12 historias y 8 reels al mes'] },
}

const TONE = {
  light: { card: 'bg-white text-brand-night ring-1 ring-brand-deep/10 shadow-soft', muted: 'text-brand-night/70', price: 'text-brand-deep', label: 'text-brand-deep', rule: 'border-brand-deep/10', check: 'bg-brand-signal/10 text-brand-signal', button: 'bg-brand-night text-white' },
  signal: { card: 'bg-brand-signal text-white shadow-lift', muted: 'text-white', price: 'text-white', label: 'text-white', rule: 'border-white/25', check: 'bg-white text-brand-signal', button: 'bg-white text-brand-night' },
  night: { card: 'bg-brand-night text-white ring-1 ring-white/10 shadow-soft', muted: 'text-brand-haze', price: 'text-white', label: 'text-brand-haze', rule: 'border-white/15', check: 'bg-brand-signal text-white', button: 'bg-white text-brand-night' },
}

/** Precio vacío o inválido: se marca para que se note antes de guardar. */
const shownPrice = (value: string) => (/^\d{1,6}$/.test(value) ? value : '—')

export function PlansPreview({ prices, highlight }: { prices: PricesInput; highlight?: PlanId | null }) {
  return (
    <div className="bg-brand-paper px-4 py-6 sm:px-6">
      <Eyebrow>Planes</Eyebrow>
      <p className="mt-2 font-display text-2xl text-brand-deep sm:text-3xl">
        Hagamos <span className="text-brand-signal">crecer</span> tus redes.
      </p>
      <div className="no-scrollbar -mx-4 mt-4 flex items-center gap-3 overflow-x-auto px-4 py-5 sm:mx-0 sm:px-0 xl:grid xl:grid-cols-13 xl:overflow-visible">
        {(['inicial', 'plus', 'premium'] as const).map((id) => {
          const plan = PLAN_COPY[id]
          const t = TONE[plan.tone]
          const featured = id === 'plus'
          return (
            <article
              key={id}
              className={`relative flex shrink-0 flex-col rounded-3xl transition xl:w-auto ${t.card} ${featured ? 'z-10 w-64 p-5 ring-4 ring-brand-signal/15 xl:col-span-5 xl:py-8' : 'w-56 p-4 xl:col-span-4'} ${highlight === id ? 'outline-3 outline-offset-3 outline-brand-signal/50' : ''}`}
            >
              <header className="flex items-center justify-between gap-2">
                <span className={`font-label ${t.label}`}>{plan.name}</span>
                {featured && <span className="rounded-full bg-white px-2 py-0.5 text-[0.6rem] font-bold text-brand-signal">Más elegido</span>}
              </header>
              <p className="mt-3 flex items-end gap-1.5">
                <span className={`font-display ${featured ? 'text-5xl' : 'text-4xl'} ${t.price}`}>{shownPrice(prices.plans[id])}</span>
                <span className={`pb-1 text-[0.65rem] font-semibold ${t.muted}`}>{prices.currency} por mes</span>
              </p>
              <p className={`mt-1.5 text-[0.7rem] font-medium ${t.muted}`}>{plan.for}</p>
              <ul className={`mt-3 flex flex-1 flex-col gap-1.5 border-t pt-3 ${t.rule}`}>
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-[0.65rem] leading-snug font-medium">
                    <Check className={t.check} />
                    {f}
                  </li>
                ))}
              </ul>
              <span className={`mt-3 rounded-full px-3 py-2 text-center text-[0.7rem] font-bold ${t.button}`}>Quiero este plan</span>
            </article>
          )
        })}
      </div>
      <p className="mt-1 text-[0.65rem] text-brand-night/60">*La inversión en publicidad se cotiza aparte.</p>
    </div>
  )
}

/** La tarjeta de la asesoría 1:1 (solo la parte del precio y el botón cambia). */
export function AsesoriaPreview({ price, detail, currency }: { price: string; detail: string; currency: string }) {
  return (
    <div className="bg-brand-paper px-4 py-6 sm:px-6">
      <div className="grid grid-cols-3 gap-3 rounded-3xl bg-white p-2.5 ring-1 ring-brand-deep/10">
        <div className="rounded-2xl bg-brand-night bg-cover bg-center" style={{ backgroundImage: 'url(/asesoria.webp)' }} />
        <div className="col-span-2 flex flex-col gap-2 py-2 pr-2">
          <Eyebrow>Asesoría 1:1</Eyebrow>
          <p className="font-display text-lg text-brand-deep">
            Una asesoría 1:1, <span className="text-brand-signal">100% personalizada.</span>
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-brand-signal px-3 py-1.5 text-[0.7rem] font-bold text-white">Quiero una asesoría</span>
            {/^\d{1,6}$/.test(price) ? (
              <span className="flex items-baseline gap-1 text-brand-deep">
                <span className="font-display text-xl">{price}</span>
                <span className="text-[0.65rem] font-semibold text-brand-night/60">
                  {currency} {detail}
                </span>
              </span>
            ) : (
              <span className="text-[0.65rem] font-semibold text-brand-night/45">Sin precio: se consulta por WhatsApp</span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

/** El bloque "También hacemos" (al lado de la asesoría), donde aparece la sesión de fotos con su precio. */
export function SesionPreview({ price, detail, currency }: { price: string; detail: string; currency: string }) {
  const text = [detail, /^\d{1,6}$/.test(price) ? `${price} ${currency}` : '—'].filter(Boolean).join(' · ')
  const rows = [
    { name: 'Sitio web / e-commerce', text: 'Tu web o tu tienda online, pensada para que te encuentren y te escriban.', price: '' },
    { name: 'Sesión de fotos y videos', text: 'Contenido propio para tus redes, hecho en una sola jornada.', price: text },
    { name: 'Soluciones a medida', text: 'Planificamos estrategias creativas y prácticas para conectar con tus clientes.', price: '' },
  ]
  return (
    <div className="bg-brand-paper px-4 py-6 sm:px-6">
      <div className="flex flex-col gap-3 rounded-3xl bg-brand-deep p-4 text-white">
        <Eyebrow dark>También hacemos</Eyebrow>
        <p className="font-display text-xl">Proyectos fuera de los planes</p>
        {rows.map((row) => (
          <div key={row.name} className={`flex items-center gap-3 rounded-2xl bg-brand-night/35 p-3 ring-1 ${row.price ? 'ring-brand-signal' : 'ring-white/10'}`}>
            <span className="size-8 shrink-0 rounded-xl bg-brand-signal" />
            <span className="flex min-w-0 flex-col gap-0.5">
              <span className="flex flex-wrap items-center gap-2 text-sm font-bold">
                {row.name}
                {row.price && <span className="rounded-full bg-white px-2 py-0.5 text-[0.65rem] text-brand-deep">{row.price}</span>}
              </span>
              <span className="text-[0.7rem] text-brand-haze">{row.text}</span>
            </span>
          </div>
        ))}
      </div>
      <p className="mt-3 text-[0.7rem] text-brand-night/60">También aparece en la página de Contenido: “Sesión de fotos y videos opcional: {text}”.</p>
    </div>
  )
}

// ---------------------------------------------------------------- preguntas frecuentes

export function FaqPreview({ items, focus }: { items: FaqItem[]; focus?: number | null }) {
  const [open, setOpen] = useState(focus ?? 0)
  // abre la pregunta que se está editando (y se puede seguir abriendo otras con un clic)
  const [lastFocus, setLastFocus] = useState(focus)
  if (focus !== lastFocus) {
    setLastFocus(focus)
    if (focus !== null && focus !== undefined) setOpen(focus)
  }
  const current = open
  const visible = items.filter((i) => i.q.trim() || i.a.trim())
  return (
    <div className="bg-brand-paper px-4 py-6 sm:px-6">
      <Eyebrow>Preguntas frecuentes</Eyebrow>
      <p className="mt-2 font-display text-2xl text-brand-deep sm:text-3xl">
        Lo que siempre <span className="text-brand-signal">nos preguntan.</span>
      </p>
      {visible.length === 0 ? (
        <p className="mt-6 rounded-2xl bg-white p-6 text-center text-sm text-brand-night/60 ring-1 ring-brand-deep/10">Sin preguntas: la sección no se muestra.</p>
      ) : (
        <ul className="mt-5 border-t border-brand-deep/15">
          {items.map((item, i) => {
            if (!item.q.trim() && !item.a.trim()) return null
            const on = current === i
            return (
              <li key={i} className="border-b border-brand-deep/15">
                <button type="button" onClick={() => setOpen(on ? -1 : i)} className="flex w-full items-center justify-between gap-4 py-3 text-left">
                  <span className={`text-sm font-bold ${on ? 'text-brand-signal' : 'text-brand-deep'} ${item.q.trim() ? '' : 'opacity-40'}`}>{item.q.trim() || 'Falta la pregunta'}</span>
                  <span aria-hidden="true" className={`grid size-6 shrink-0 place-items-center rounded-full text-sm leading-none transition ${on ? 'rotate-45 bg-brand-signal text-white' : 'bg-white text-brand-deep ring-1 ring-brand-deep/15'}`}>
                    +
                  </span>
                </button>
                {on && <p className={`pr-8 pb-4 text-xs leading-relaxed text-brand-night/75 ${item.a.trim() ? '' : 'opacity-50'}`}>{item.a.trim() || 'Falta la respuesta'}</p>}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

// ---------------------------------------------------------------- proyectos

type Resolve = (src: string) => string

const Chip = ({ children, className = '' }: { children: ReactNode; className?: string }) => <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[0.65rem] font-bold ${className}`}>{children}</span>

function Img({ image, resolve, className = '' }: { image: ProjectImage | null; resolve: Resolve; className?: string }) {
  if (!image) return <div className={`grid place-items-center bg-brand-paper text-xs font-semibold text-brand-night/40 ${className}`}>Sin imagen</div>
  return <img src={resolve(image.src)} alt={image.alt} className={className} />
}

const metaOf = (p: ProjectInput) => [p.sector, p.location, p.year].filter((s) => s.trim()).join(' · ')

/** Tarjeta del proyecto (como en /proyectos y en el inicio). */
export function ProjectCardPreview({ project, resolve }: { project: ProjectInput; resolve: Resolve }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-4/3 overflow-hidden rounded-2xl bg-white ring-1 ring-brand-deep/10">
        <Img image={project.cover} resolve={resolve} className="size-full object-cover" />
        {project.services.length > 0 && (
          <div className="absolute top-3 left-3 flex flex-wrap gap-1">
            {project.services.map((s) => (
              <Chip key={s} className="bg-white text-brand-deep">
                {s}
              </Chip>
            ))}
          </div>
        )}
      </div>
      <div className="flex flex-col gap-1">
        {metaOf(project) && <p className="text-xs font-semibold text-brand-night/60">{metaOf(project)}</p>}
        <p className="font-display text-xl text-brand-deep">{project.brand || 'Nombre de la marca'}</p>
        {project.title && <p className="line-clamp-2 text-sm text-brand-night/70">{project.title}</p>}
        <p className="mt-1 text-xs font-bold text-brand-signal">Ver el proyecto ↗</p>
      </div>
    </div>
  )
}

/** Párrafos separados por una línea en blanco (igual que en el sitio). */
const paragraphs = (text: string) =>
  text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)

/** La página del proyecto (/proyectos/<slug>), en versión compacta. */
export function ProjectPagePreview({ project, resolve }: { project: ProjectInput; resolve: Resolve }) {
  const facts = [
    ['Rubro', project.sector],
    ['Ubicación', project.location],
    ['Año', project.year],
  ].filter(([, v]) => v.trim())
  const steps = project.process.filter((s) => s.title.trim() || s.text.trim() || s.image)

  return (
    <div className="bg-brand-paper">
      <header className="grid grid-cols-1 items-center gap-6 px-5 py-8 sm:px-8 lg:grid-cols-12">
        <div className="flex flex-col items-start gap-3 lg:col-span-5">
          <p className="text-[0.65rem] font-semibold text-brand-night/55">
            Inicio / Proyectos / <span className="text-brand-deep">{project.brand || 'Marca'}</span>
          </p>
          {project.services.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {project.services.map((s) => (
                <Chip key={s} className="bg-brand-signal text-white">
                  {s}
                </Chip>
              ))}
            </div>
          )}
          <p className="font-display text-4xl text-brand-deep">{project.brand || 'Nombre de la marca'}</p>
          {project.title && <p className="text-base font-semibold text-brand-deep">{project.title}</p>}
          {project.summary && <p className="text-sm text-brand-night/75">{project.summary}</p>}
          {facts.length > 0 && (
            <dl className="flex w-full flex-wrap gap-x-6 gap-y-3 border-t border-brand-deep/15 pt-4">
              {facts.map(([label, value]) => (
                <div key={label}>
                  <dt className="font-label text-[0.6rem] text-brand-night/55">{label}</dt>
                  <dd className="text-sm font-bold text-brand-deep">{value}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
        <div className="overflow-hidden rounded-3xl bg-white ring-1 ring-brand-deep/10 lg:col-span-7">
          <Img image={project.cover} resolve={resolve} className="aspect-4/3 w-full object-cover" />
        </div>
      </header>

      {project.challenge.trim() && (
        <section className="mx-5 grid grid-cols-1 gap-3 border-t border-brand-deep/15 py-8 sm:mx-8 lg:grid-cols-12">
          <p className="font-display text-2xl text-brand-deep lg:col-span-4">El desafío</p>
          <div className="flex flex-col gap-3 lg:col-span-8">
            {paragraphs(project.challenge).map((p, i) => (
              <p key={i} className="text-base leading-snug font-semibold text-brand-deep">
                {p}
              </p>
            ))}
          </div>
        </section>
      )}

      {steps.length > 0 && (
        <section className="bg-brand-deep px-5 py-8 text-white sm:px-8">
          <Eyebrow dark>{project.brand || 'Marca'}</Eyebrow>
          <p className="mt-2 font-display text-2xl">Cómo lo hicimos</p>
          <ol className="mt-5 flex flex-col gap-3">
            {steps.map((step, i) => (
              <li key={i} className="grid grid-cols-1 items-center gap-4 rounded-3xl bg-brand-night/35 p-2.5 ring-1 ring-white/10 sm:grid-cols-12">
                {step.image && (
                  <div className={`overflow-hidden rounded-2xl bg-brand-night sm:col-span-7 ${i % 2 ? 'sm:order-2' : ''}`}>
                    <Img image={step.image} resolve={resolve} className="h-auto w-full" />
                  </div>
                )}
                <div className={`flex flex-col gap-1.5 px-2 pb-2 ${step.image ? 'sm:col-span-5' : 'sm:col-span-12 sm:py-3'}`}>
                  <span className="font-label text-[0.6rem] text-brand-haze">{String(i + 1).padStart(2, '0')}</span>
                  {step.title && <p className="font-display text-xl">{step.title}</p>}
                  {paragraphs(step.text).map((p, k) => (
                    <p key={k} className="text-sm text-brand-haze">
                      {p}
                    </p>
                  ))}
                </div>
              </li>
            ))}
          </ol>
        </section>
      )}

      {project.result.trim() && (
        <section className="grid grid-cols-1 gap-3 px-5 py-8 sm:px-8 lg:grid-cols-12">
          <p className="font-display text-2xl text-brand-deep lg:col-span-4">El resultado</p>
          <div className="flex flex-col gap-3 border-l-4 border-brand-signal pl-4 lg:col-span-8">
            {paragraphs(project.result).map((p, i) => (
              <p key={i} className="text-base leading-snug font-semibold text-brand-deep">
                {p}
              </p>
            ))}
          </div>
        </section>
      )}

      {project.gallery.length > 0 && (
        <section className="px-5 pb-8 sm:px-8">
          <p className="font-label text-brand-deep">Más piezas</p>
          <div className="mt-3 columns-2 gap-3 lg:columns-3">
            {project.gallery.map((img) => (
              <div key={img.src} className="mb-3 break-inside-avoid overflow-hidden rounded-2xl bg-white ring-1 ring-brand-deep/10">
                <Img image={img} resolve={resolve} className="w-full" />
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="bg-brand-deep px-5 py-6 sm:px-8">
        <p className="font-display text-xl text-white">
          ¿Querés algo así para <span className="text-brand-haze">tu marca?</span>
        </p>
      </div>
    </div>
  )
}
