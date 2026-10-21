import type { ReactNode } from 'react'
import type { PricesInput } from '../../shared/site'
import type { TextReader } from '../lib/texts'
import { Check, Eyebrow, PlansPreview } from './previews'

/**
 * Vistas previas de la sección "Textos": réplicas compactas de cada sección del sitio, con los textos
 * que se están editando. Los títulos bloqueados se muestran tal cual están en la web.
 * (Si cambia el diseño del sitio, actualizar acá también.)
 */

const Title = ({ children, dark = false }: { children: ReactNode; dark?: boolean }) => (
  <p className={`mt-2 font-display text-2xl leading-tight ${dark ? 'text-white' : 'text-brand-deep'}`}>{children}</p>
)
const Em = ({ children, haze = false, dark = false }: { children: ReactNode; haze?: boolean; dark?: boolean }) => <span className={haze ? 'italic text-white' : dark ? 'italic text-brand-signal' : 'italic text-brand-flame'}>{children}</span>

/** Botón como los de la web: pastilla con el círculo del ícono. */
function Pill({ children, tone = 'signal' }: { children: ReactNode; tone?: 'signal' | 'white' | 'night' }) {
  const face = { signal: 'bg-brand-signal text-brand-ink', white: 'bg-white text-brand-night', night: 'bg-brand-night text-white' }[tone]
  const badge = { signal: 'bg-brand-ink text-white', white: 'bg-brand-night text-white', night: 'bg-brand-signal text-brand-ink' }[tone]
  return (
    <span className={`inline-flex items-center gap-3 rounded-full py-1 pr-1 pl-4 text-xs font-bold ${face}`}>
      {children}
      <span className={`grid size-6 place-items-center rounded-full text-[0.65rem] ${badge}`}>↗</span>
    </span>
  )
}

/** Mensaje de WhatsApp que se abre al tocar el botón. */
const Bubble = ({ text }: { text: string }) => (
  <p className="mt-3 max-w-xs rounded-2xl rounded-tl-sm bg-[#dcf8c6] px-3 py-2 text-[0.7rem] leading-snug text-[#111]">
    <span className="mb-0.5 block text-[0.6rem] font-bold text-[#075e54]">Mensaje de WhatsApp</span>
    {text}
  </p>
)

const Steps = ({ items, dark = false }: { items: string[]; dark?: boolean }) => (
  <ul className="mt-2 flex flex-col gap-1.5">
    {items.map((s, i) => (
      <li key={i} className={`flex items-start gap-2 text-[0.7rem] leading-snug font-medium ${dark ? 'text-white' : 'text-brand-night'}`}>
        <Check className={dark ? 'bg-brand-signal text-brand-ink' : 'bg-brand-signal/10 text-brand-ember'} />
        {s}
      </li>
    ))}
  </ul>
)

const SERVICES = [
  { slug: 'estrategia', name: 'Estrategia' },
  { slug: 'contenido', name: 'Contenido' },
  { slug: 'meta-ads', name: 'Meta Ads' },
  { slug: 'branding', name: 'Branding' },
]
const STAGES = [
  { key: 'diagnostico', name: 'Diagnóstico', when: 'Semanas 1 y 2' },
  { key: 'estrategia', name: 'Estrategia', when: 'Semanas 1 y 2' },
  { key: 'ejecucion', name: 'Ejecución', when: 'Semanas 3 y 4' },
  { key: 'mensual', name: 'Cada mes', when: 'Desde el mes 2' },
]

interface Props {
  id: string
  tx: TextReader
  prices: PricesInput | null
  /** Grupo de campos que se está editando (para mostrar esa parte). */
  group: number
}

export function TextSectionPreview({ id, tx, prices, group }: Props) {
  switch (id) {
    case 'hero':
      return (
        <div className="bg-brand-paper px-5 py-7">
          <p className="font-display text-3xl leading-none text-brand-night">
            Agencia de marketing digital y <Em>redes sociales.</Em>
          </p>
          <p className="mt-3 text-xs text-brand-night/75">Convertimos tus redes en un sistema de ventas con estrategia, contenido y anuncios en Instagram y Facebook.</p>
          <div className="mt-4 flex items-center gap-4">
            <Pill>Hablemos por WhatsApp</Pill>
            <span className="text-[0.7rem] font-bold text-brand-night underline">Ver planes ↓</span>
          </div>
        </div>
      )

    case 'servicios': {
      const active = SERVICES[Math.min(group, 3)]
      return (
        <div className="bg-brand-paper px-5 py-7">
          <Eyebrow>Servicios</Eyebrow>
          <Title>
            Todo lo que tu marca necesita para <Em>vender en redes.</Em>
          </Title>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {SERVICES.map((s) => (
              <span key={s.slug} className={`rounded-full px-3 py-1 text-[0.7rem] font-bold ${s.slug === active.slug ? 'bg-brand-deep text-white' : 'bg-white text-brand-deep ring-1 ring-brand-deep/15'}`}>
                {s.name}
              </span>
            ))}
          </div>
          <div className="mt-3 rounded-3xl bg-brand-deep p-4 text-white">
            <p className="font-label text-brand-haze">Qué incluye · {active.name}</p>
            <Steps items={tx.list(`servicios.${active.slug}.includes`)} dark />
            <div className="mt-4">
              <Pill tone="white">{tx.get('servicios.cta')}</Pill>
            </div>
          </div>
          <p className="mt-2 text-[0.65rem] text-brand-night/55">Esta lista se ve en la página del servicio; en el inicio va solo el nombre y una frase.</p>
        </div>
      )
    }

    case 'proyectos':
      return (
        <div className="bg-brand-night px-5 py-7 text-white">
          <Eyebrow dark>Proyectos</Eyebrow>
          <Title dark>
            Marcas que ya <Em>confiaron en nosotros.</Em>
          </Title>
          <div className="mt-3">
            <Pill tone="white">{tx.get('proyectos.all')}</Pill>
          </div>
          <div className="mt-4 grid grid-cols-5 overflow-hidden rounded-3xl bg-brand-navy ring-1 ring-white/10">
            <div className="col-span-3 min-h-24 bg-white/10" />
            <div className="col-span-2 p-3">
              <p className="font-display text-base">Caso</p>
              <p className="mt-1 text-[0.65rem] text-brand-haze">Los casos se cargan en Proyectos.</p>
            </div>
          </div>
          <p className="mt-3 text-[0.65rem] text-brand-haze">Página de proyectos: {tx.get('proyectos.text')}</p>
        </div>
      )

    case 'proceso':
      return (
        <div className="bg-brand-night px-5 py-7 text-white">
          <Eyebrow dark>Cómo trabajamos</Eyebrow>
          <Title dark>
            Tu primer mes, en <Em dark>tres etapas.</Em>
          </Title>
          <ol className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
            {STAGES.slice(0, 3).map((s, i) => (
              <li key={s.key} className={`rounded-2xl bg-brand-night/35 p-3 ring-1 ${i === group ? 'ring-brand-haze' : 'ring-white/10'}`}>
                <p className="font-label text-[0.6rem] text-brand-haze">{s.when}</p>
                <p className="font-display text-base">{s.name}</p>
                <p className="mt-1 text-[0.7rem] text-brand-haze">{tx.get(`proceso.${s.key}.text`)}</p>
              </li>
            ))}
          </ol>
          <p className={`mt-2 rounded-2xl bg-brand-navy p-3 text-[0.7rem] text-brand-haze ring-1 ${group === 3 ? 'ring-brand-haze' : 'ring-white/10'}`}>
            <b className="text-white">Cada mes · Desde el mes 2</b> {tx.get('proceso.mensual.text')}
          </p>
          <div className="mt-4">
            <Pill>{tx.get('proceso.cta')}</Pill>
          </div>
        </div>
      )

    case 'diagnostico': {
      const q = Math.min(Math.max(group, 1), 3)
      const options = q === 3 ? ['o1', 'o2'] : ['o1', 'o2', 'o3']
      const showResult = group >= 4
      return (
        <div className="bg-brand-night px-5 py-7 text-white">
          <Eyebrow dark>Diagnóstico rápido</Eyebrow>
          <Title dark>
            ¿No sabés <Em>qué plan</Em> elegir?
          </Title>
          <p className="mt-2 text-xs text-brand-haze">{tx.get('diagnostico.text')}</p>
          <div className="mt-4 rounded-3xl bg-brand-navy p-4 ring-1 ring-white/10">
            {showResult ? (
              <>
                <p className="font-label text-[0.6rem] text-brand-haze">Te recomendamos el plan</p>
                <p className="font-display text-3xl">Plus</p>
                <p className="mt-1 text-[0.7rem] text-brand-haze">{tx.get('diagnostico.resultText')}</p>
                <div className="mt-3">
                  <Pill>{tx.get('diagnostico.resultCta')}</Pill>
                </div>
                <Bubble text={`${tx.get('diagnostico.message')} Plus`} />
              </>
            ) : (
              <>
                <p className="font-label text-[0.6rem] text-brand-haze">Pregunta {q} de 3</p>
                <p className="mt-1 text-sm font-bold">{tx.get(`diagnostico.q${q}`)}</p>
                <div className="mt-3 flex flex-col gap-1.5">
                  {options.map((o) => (
                    <span key={o} className="rounded-xl bg-white/10 px-3 py-2 text-[0.7rem] font-semibold ring-1 ring-white/10">
                      {tx.get(`diagnostico.q${q}.${o}`)}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )
    }

    case 'planes':
      return prices ? <PlansPreview prices={prices} texts={tx} highlight={(['inicial', 'plus', 'premium'] as const)[group] ?? null} /> : null

    case 'asesoria': {
      const extras = [
        { key: 'web', name: 'Sitio web / e-commerce' },
        { key: 'sesion', name: 'Sesión de fotos y videos' },
        { key: 'medida', name: 'Soluciones a medida' },
      ]
      const focusExtra = group >= 1 && group <= 3 ? extras[group - 1] : null
      return (
        <div className="flex flex-col gap-3 bg-brand-paper px-5 py-7">
          <div className="rounded-3xl bg-white p-4 ring-1 ring-brand-deep/10">
            <Eyebrow>Asesoría 1:1</Eyebrow>
            <p className="font-display text-xl text-brand-deep">
              Una asesoría 1:1, <Em>100% personalizada.</Em>
            </p>
            <p className="mt-2 text-[0.7rem] text-brand-night/75">{tx.get('asesoria.text')}</p>
            <div className="mt-3">
              <Pill>{tx.get('asesoria.cta')}</Pill>
            </div>
            {group === 0 && <Bubble text={tx.get('asesoria.message')} />}
          </div>
          <div className="rounded-3xl bg-white p-4 ring-1 ring-brand-deep/10">
            <Eyebrow>También hacemos</Eyebrow>
            <ul className="mt-3 flex flex-col gap-2">
              {extras.map((e) => (
                <li key={e.key} className={`flex items-center justify-between rounded-2xl bg-brand-paper p-3 ring-1 ${focusExtra?.key === e.key ? 'ring-brand-deep' : 'ring-transparent'}`}>
                  <p className="text-xs font-bold text-brand-night">{e.name}</p>
                  <p className="text-[0.7rem] font-bold text-brand-deep">{tx.get('extras.cta')} ↗</p>
                </li>
              ))}
            </ul>
            {focusExtra && <Bubble text={tx.get(`extras.${focusExtra.key}.message`)} />}
          </div>
        </div>
      )
    }

    case 'preguntas':
      return (
        <div className="bg-brand-night px-5 py-7 text-white">
          <Eyebrow dark>Preguntas frecuentes</Eyebrow>
          <Title dark>
            Lo que siempre <Em dark>nos preguntan.</Em>
          </Title>
          <div className="mt-3">
            <Pill tone="white">{tx.get('faq.cta')}</Pill>
          </div>
          <p className="mt-4 rounded-2xl bg-brand-navy p-3 text-[0.7rem] text-brand-haze ring-1 ring-white/10">Las preguntas y respuestas se editan en la sección Preguntas del panel.</p>
        </div>
      )

    case 'nosotros':
      return (
        <div className="bg-brand-night px-5 py-7 text-white">
          <Eyebrow dark>Nosotros</Eyebrow>
          <Title dark>
            Construimos marcas que <Em>venden más.</Em>
          </Title>
          <blockquote className="mt-4 rounded-2xl bg-brand-navy p-3 text-xs font-semibold">“{tx.get('nosotros.quote')}”</blockquote>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <Pill>{tx.get('nosotros.cta')}</Pill>
            <span className="text-[0.7rem] font-bold underline">{tx.get('nosotros.instagram')}</span>
          </div>
        </div>
      )

    case 'contacto':
      return (
        <div className="flex flex-col">
          <div className="bg-brand-deep px-5 py-7 text-white">
            <p className="font-label text-brand-haze">{tx.get('contacto.eyebrow')}</p>
            <p className="mt-2 font-display text-4xl">¿Hablamos?</p>
            <p className="mt-2 text-xs text-brand-haze">{tx.get('contacto.text')}</p>
            <div className="mt-3">
              <Pill tone="white">{tx.get('contacto.button')}</Pill>
            </div>
          </div>
          <div className="bg-brand-night px-5 py-4">
            <p className="text-2xl font-bold tracking-tight text-white">clic<span className="font-normal text-brand-haze">studio</span></p>
            <p className="mt-2 border-t border-white/10 pt-2 text-[0.7rem] font-bold text-white">{tx.get('footer.line')}</p>
          </div>
          <div className="grid grid-cols-1 gap-2 bg-brand-paper p-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-brand-deep p-3 text-white">
              <p className="text-xs font-bold">¿Querés aplicarlo a tu marca?</p>
              <p className="mt-1 text-[0.65rem] text-brand-haze">{tx.get('blog.cta.text')}</p>
              <p className="mt-1.5 text-[0.6rem] font-bold text-brand-haze">Cierre de las notas</p>
            </div>
            <div className="rounded-2xl bg-brand-deep p-3 text-white">
              <p className="text-xs font-bold">¿Querés algo así para tu marca?</p>
              <p className="mt-1 text-[0.65rem] text-brand-haze">{tx.get('proyectos.detail.cta.text')}</p>
              <p className="mt-1.5 text-[0.6rem] font-bold text-brand-haze">Cierre de los proyectos</p>
            </div>
          </div>
        </div>
      )

    default:
      return null
  }
}
