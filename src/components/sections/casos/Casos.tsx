import { useRef } from 'react'
import { casos, results, sections } from '../../../data/content'
import { useReducedMotion } from '../../../hooks/useReducedMotion'
import { gsap, useGSAP } from '../../../lib/gsap'
import { setupReveals } from '../../../lib/motion'
import { deferSetup } from '../../../lib/schedule'
import { Button } from '../../ui/Button'
import { Odometer } from '../../ui/Odometer'
import { Section } from '../../ui/Section'
import { Label, SectionTitle } from '../../ui/SectionTitle'

/**
 * Casos: confianza + números reales (solo datos publicados por la marca) + el caso Branding Studio.
 * Imágenes redondeadas con reveal, parallax suave y zoom al hover.
 */
export function Casos() {
  const ref = useRef<HTMLElement>(null)
  const reduced = useReducedMotion()
  const { branding } = casos

  useGSAP(
    (_, contextSafe) =>
      // armado diferido: no compite con el preloader (lib/schedule.ts)
      deferSetup(
        contextSafe!(() => {
          setupReveals(ref.current!)
          if (reduced) return
          const mm = gsap.matchMedia()
          mm.add('(min-width: 768px)', () => {
            gsap.utils.toArray<HTMLElement>('[data-parallax]', ref.current).forEach((img) => {
              gsap.fromTo(img, { yPercent: -5 }, { yPercent: 5, ease: 'none', scrollTrigger: { trigger: img.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } })
            })
          })
          return () => mm.revert()
        }),
      ),
    { scope: ref, dependencies: [reduced] },
  )

  return (
    <Section id={sections.casos} ref={ref} bg="primary" className="overflow-hidden px-5 py-28 md:px-10 md:py-40">
      <div className="relative">
        <Label tone="dark">{casos.eyebrow}</Label>
        <SectionTitle text={casos.title} className="mt-6 font-display text-giant" />
      </div>

      <div className="relative mt-12 grid gap-10 md:mt-16 lg:grid-cols-12 lg:items-center lg:gap-14">
        <div data-reveal="clip" className="group aspect-4/5 overflow-hidden rounded-4xl shadow-lift lg:col-span-5">
          <img
            data-parallax
            src={casos.image.src}
            alt={casos.image.alt}
            width={casos.image.width}
            height={casos.image.height}
            loading="lazy"
            decoding="async"
            className="size-full scale-115 object-cover transition-transform duration-1000 ease-expo md:group-hover:scale-125"
          />
        </div>

        <div className="flex flex-col gap-6 lg:col-span-7">
          {casos.paragraphs.map((p, i) => (
            <p key={p} data-reveal={i === 0 ? 'fade' : 'rise'} data-reveal-delay={i * 0.08} className={i === 0 ? 'text-lead font-bold tracking-tight' : 'text-base leading-relaxed text-white/85 md:text-lg'}>
              {p}
            </p>
          ))}
          <blockquote data-reveal="fade" data-reveal-delay="0.12" className="border-l-2 border-brand-sky py-2 pl-6 font-accent text-3xl leading-tight md:pl-8 md:text-4xl">
            {casos.trayectoria}
          </blockquote>
          <p data-reveal="fade" className="text-label font-semibold text-white/80">
            {casos.invite}
          </p>
        </div>
      </div>

      {/* Números reales */}
      <div className="relative mt-20 md:mt-28">
        <Label tone="dark">{results.eyebrow}</Label>
        <ul className="mt-6 grid gap-4 md:grid-cols-3 md:gap-6">
          {results.items.map((r, i) => (
            <li
              key={r.label}
              data-reveal="fade"
              data-reveal-delay={i * 0.08}
              className="flex flex-col gap-3 border-t border-white/25 py-6 transition-transform duration-500 ease-expo md:py-8 md:hover:-translate-y-1"
            >
              <span className="text-label font-semibold text-brand-sky">{r.label}</span>
              <span className="font-display text-huge tabular-nums">
                <Odometer value={`${r.prefix}${r.value}${r.suffix}`} />
              </span>
              <span className="text-sm leading-relaxed text-white/85 md:text-base">{r.text}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Caso de éxito: Branding Studio */}
      <div className="relative mt-28 md:mt-40">
        <Label tone="dark">{branding.caseLabel}</Label>
        <SectionTitle as="h3" text={branding.title} className="mt-6 font-display text-giant" />

        <ul className="mt-12 grid gap-4 md:mt-16 md:grid-cols-3 md:gap-6">
          {branding.images.map((img, i) => (
            <li key={img.src}>
              <figure className="group">
                <div data-reveal="clip" data-reveal-delay={i * 0.12} className="aspect-square overflow-hidden rounded-4xl shadow-soft">
                  <img
                    src={img.src}
                    alt={img.alt}
                    width={img.width}
                    height={img.height}
                    loading="lazy"
                    decoding="async"
                    className="size-full object-cover transition-transform duration-1000 ease-expo md:group-hover:scale-110"
                  />
                </div>
                <figcaption className="mt-4 flex items-center justify-between px-2 text-label font-semibold">
                  {img.caption}
                  <span aria-hidden="true" className="grid size-8 place-items-center border-l border-current transition-transform duration-500 ease-expo group-hover:-rotate-45">
                    →
                  </span>
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>

        <div className="mt-16 grid gap-8 md:mt-24 lg:grid-cols-12 lg:items-end">
          <SectionTitle as="p" text={branding.headline} className="font-display text-big lg:col-span-7" />
          <div className="flex flex-col items-start gap-6 lg:col-span-4 lg:col-start-9">
            {branding.text.map((t) => (
              <p key={t} data-reveal="fade" className="text-base leading-relaxed text-white/85">
                {t}
              </p>
            ))}
            <div data-reveal="cta">
              <Button href={branding.cta.href} label={branding.cta.label} variant="paper" icon="whatsapp" cursor="Escribinos" />
            </div>
          </div>
        </div>
      </div>
    </Section>
  )
}
