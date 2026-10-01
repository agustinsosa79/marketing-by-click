import { Fragment, useRef } from 'react'
import { manifiesto, sections, type StatementPart } from '../../../data/content'
import { useReducedMotion } from '../../../hooks/useReducedMotion'
import { gsap, useGSAP } from '../../../lib/gsap'
import { setupReveals } from '../../../lib/motion'
import { Section } from '../../ui/Section'
import { Label } from '../../ui/SectionTitle'
import { deferSetup } from '../../../lib/schedule'

/** Palabras sueltas como spans: el scrub las va encendiendo de a una. */
function Words({ text }: { text: string }) {
  return (
    <>
      {text.split(' ').map((word, i) => (
        <Fragment key={i}>
          <span data-word>{word}</span>{' '}
        </Fragment>
      ))}
    </>
  )
}

function Part({ part }: { part: StatementPart }) {
  if (typeof part === 'string') return <Words text={part} />
  if ('accent' in part)
    return (
      <>
        <em data-word className="font-accent text-brand-sky">
          {part.accent}
        </em>{' '}
      </>
    )
  // Decorativa: la frase se lee igual sin la imagen
  return (
    <>
      <span data-pill aria-hidden="true" className="group/pill mx-1 inline-block h-pill w-pill-wide overflow-hidden rounded-full align-middle shadow-soft">
        <img
          src={part.pill.src}
          alt=""
          width={part.pill.width}
          height={part.pill.height}
          loading="lazy"
          decoding="async"
          className="size-full scale-125 object-cover transition-transform duration-700 ease-expo group-hover/pill:scale-150"
        />
      </span>{' '}
    </>
  )
}

/**
 * Manifiesto: la frase se enciende palabra por palabra con el scroll (scrub),
 * con píldoras de fotos reales que se abren dentro del texto.
 */
export function Manifiesto() {
  const ref = useRef<HTMLElement>(null)
  const statement = useRef<HTMLParagraphElement>(null)
  const reduced = useReducedMotion()

  useGSAP(
    (_, contextSafe) =>
      // armado diferido: no compite con el preloader (lib/schedule.ts)
      deferSetup(
        contextSafe!(() => {
          setupReveals(ref.current!)
          const words = gsap.utils.toArray<HTMLElement>('[data-word]', statement.current)
          const pills = gsap.utils.toArray<HTMLElement>('[data-pill]', statement.current)

          if (reduced) {
            gsap.fromTo(statement.current, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.6, scrollTrigger: { trigger: statement.current, start: 'top 85%', once: true } })
            return
          }

          gsap.fromTo(
            words,
            { opacity: 0.16 },
            { opacity: 1, ease: 'none', stagger: 0.08, scrollTrigger: { trigger: statement.current, start: 'top 82%', end: 'bottom 48%', scrub: 0.35 } },
          )
          pills.forEach((pill) => {
            gsap.fromTo(
              pill,
              { clipPath: 'inset(0% 50% 0% 50% round 10em)' },
              { clipPath: 'inset(0% 0% 0% 0% round 10em)', ease: 'none', scrollTrigger: { trigger: pill, start: 'top 85%', end: 'top 55%', scrub: true } },
            )
          })
        }),
      ),
    { scope: ref, dependencies: [reduced] },
  )

  return (
    <Section id={sections.nosotros} ref={ref} bg="night" className="px-5 pt-28 pb-24 md:px-10 md:pt-44 md:pb-32">
      <Label tone="dark">{manifiesto.eyebrow}</Label>

      {/* Texto accesible completo; la capa visual (palabras que se encienden con el scroll) va oculta para lectores */}
      <p className="sr-only">{manifiesto.statement.map((part) => (typeof part === 'string' ? part : 'accent' in part ? part.accent : '')).join(' ')}</p>
      <p ref={statement} aria-hidden="true" className="mt-12 text-statement font-bold tracking-tight md:mt-20 md:w-11/12 lg:w-10/12">
        {manifiesto.statement.map((part, i) => (
          <Part key={i} part={part} />
        ))}
      </p>
    </Section>
  )
}
