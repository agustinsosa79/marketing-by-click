import { useRef } from 'react'
import { founder, sections } from '../../../data/content'
import { useGSAP } from '../../../lib/gsap'
import { setupReveals } from '../../../lib/motion'
import { deferSetup } from '../../../lib/schedule'
import { Icon } from '../../ui/Icon'
import { Section } from '../../ui/Section'
import { SectionTitle } from '../../ui/SectionTitle'
import { VideoPlayer } from '../../ui/VideoPlayer'

/**
 * Founder: el video de Ian es el protagonista (grande, con sonido, controles propios),
 * ubicado temprano en el recorrido (después del manifiesto). Al lado, su texto y su Instagram.
 */
export function Founder() {
  const ref = useRef<HTMLElement>(null)

  useGSAP((_, contextSafe) => deferSetup(contextSafe!(() => setupReveals(ref.current!))), { scope: ref })

  return (
    <Section id={sections.founder} ref={ref} bg="paper" className="overflow-hidden px-5 py-28 md:px-10 md:py-40">
      <div className="relative">
        <SectionTitle text={founder.title} className="font-display text-giant" emphasisClassName="font-accent text-brand-electric" />
      </div>

      <div className="relative mt-12 grid gap-10 md:mt-16 lg:grid-cols-12 lg:items-center lg:gap-14">
        <div data-reveal="clip" className="lg:col-span-7">
          <VideoPlayer src={founder.video.src} poster={founder.video.poster} label={founder.video.label} labels={founder.player} listenGlobalPlay />
        </div>

        <div className="flex flex-col gap-5 lg:col-span-5">
          <p data-reveal="fade" className="text-2xl leading-tight font-bold tracking-tight md:text-3xl">
            {founder.intro}
          </p>
          {founder.paragraphs.map((p, i) => (
            <p key={p} data-reveal="rise" data-reveal-delay={0.06 * (i + 1)} className="text-base leading-relaxed text-brand-deep/85">
              {p}
            </p>
          ))}

          <a
            data-reveal="fade"
            data-reveal-delay="0.22"
            href={founder.instagram.href}
            target="_blank"
            rel="noopener noreferrer"
            className="group mt-3 flex items-center gap-4 border-t border-brand-deep/20 py-3 transition-transform duration-500 ease-expo md:hover:translate-x-1"
          >
            <span className="size-14 shrink-0 overflow-hidden rounded-full">
              <img
                src={founder.photo.srcSmall}
                alt={founder.photo.alt}
                width={600}
                height={800}
                loading="lazy"
                decoding="async"
                className="size-full object-cover transition-transform duration-700 ease-expo group-hover:scale-115"
              />
            </span>
            <span className="flex-1">
              <span className="flex items-center gap-2 text-lg font-bold">
                <Icon name="instagram" className="size-4 shrink-0 transition-transform duration-500 ease-expo group-hover:-rotate-12" />
                <span className="link-underline">{founder.instagram.label}</span>
              </span>
              <span className="block text-sm text-brand-deep/75">{founder.instagram.text}</span>
            </span>
            <span aria-hidden="true" className="grid size-11 shrink-0 place-items-center rounded-full bg-brand-deep text-brand-paper transition-transform duration-500 ease-expo group-hover:rotate-45">
              <svg viewBox="0 0 24 24" className="size-4 fill-none stroke-current stroke-2">
                <path d="M7 17 17 7M9 7h8v8" />
              </svg>
            </span>
          </a>
        </div>
      </div>
    </Section>
  )
}
