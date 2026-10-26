import { useRef } from 'react'
import { nosotros, sections } from '../../../data/content'
import { useGSAP } from '../../../lib/gsap'
import { setupReveals } from '../../../lib/motion'
import { deferSetup } from '../../../lib/schedule'
import { Button } from '../../ui/Button'
import { Icon, SocialIcon } from '../../ui/Icon'
import { Section } from '../../ui/Section'
import { Label, Title } from '../../ui/Title'
import { VideoPlayer } from '../../ui/VideoPlayer'

const F = nosotros.founder

/** Enlace a una red (pastilla): ícono blanco sobre azul y el usuario. */
function SocialLink({ href, label, text, icon }: { href: string; label: string; text?: string; icon: 'instagram' | 'linkedin' }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center gap-3 rounded-full bg-white/5 p-1.5 pr-5 ring-1 ring-white/15 transition duration-500 ease-expo hover:bg-white/10"
    >
      <span className="grid size-10 place-items-center rounded-full bg-brand-deep text-white transition-transform duration-500 ease-expo group-hover:-rotate-12">
        {icon === 'instagram' ? <Icon name="instagram" className="size-5" /> : <SocialIcon name="linkedin" className="size-5" />}
      </span>
      <span className="text-sm leading-tight">
        <span className="block font-bold">{label}</span>
        {text && <span className="block text-brand-haze">{text}</span>}
      </span>
    </a>
  )
}

/**
 * Nosotros, sobre azul noche (pedido del cliente: primero el estudio y después Ian):
 *  - arriba: la misión de Clic Studio, su Instagram y el video de Ian
 *  - abajo: Ian como Founder, con su frase, su historia y sus redes (Instagram y LinkedIn)
 */
export function Nosotros() {
  const ref = useRef<HTMLElement>(null)
  useGSAP((_, contextSafe) => deferSetup(contextSafe!(() => setupReveals(ref.current!))), { scope: ref })

  return (
    <Section id={sections.nosotros} ref={ref} bg="night" className="overflow-hidden px-5 pt-24 pb-20 md:px-10 md:pt-32 md:pb-28">
      <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-12">
        <div className="flex flex-col gap-6 lg:col-span-6">
          <div className="flex flex-col gap-4">
            <Label tone="night">{nosotros.eyebrow}</Label>
            <Title title={nosotros.title} tone="night" />
          </div>
          <p data-reveal className="text-lead font-bold text-white">
            {nosotros.missionLead}
          </p>
          <p data-reveal className="text-lg leading-relaxed text-brand-haze">
            {nosotros.missionText}
          </p>
          <div data-reveal className="flex flex-wrap items-center gap-3">
            <Button href={nosotros.cta.href} label={nosotros.cta.label} variant="signal" icon="whatsapp" cursor="Escribinos" />
            <SocialLink href={nosotros.studioInstagram.href} label={nosotros.studioInstagram.label} text={nosotros.studioInstagram.text} icon="instagram" />
          </div>
        </div>

        <figure data-reveal className="lg:col-span-6">
          <VideoPlayer src={nosotros.video.src} fallback={nosotros.video.fallback} poster={nosotros.video.poster} duration={nosotros.video.duration} label={nosotros.video.label} labels={nosotros.player} listenGlobalPlay />
        </figure>
      </div>

      {/* Ian · Founder */}
      <article data-reveal className="mt-12 grid grid-cols-1 gap-6 rounded-4xl bg-brand-navy p-6 ring-1 ring-white/10 md:mt-16 md:p-10 lg:grid-cols-12 lg:gap-10">
        <header className="flex items-center gap-4 lg:col-span-4 lg:flex-col lg:items-start">
          <img src={F.photo} alt={`${F.name}, ${F.role}`} width={160} height={160} loading="lazy" decoding="async" className="size-20 shrink-0 rounded-full object-cover ring-4 ring-white/10 md:size-28" />
          <p className="flex flex-col">
            <span className="font-display text-3xl text-white">{F.name}</span>
            <span className="font-label text-label text-brand-haze">{F.role}</span>
          </p>
        </header>
        <div className="flex flex-col gap-4 lg:col-span-8">
          <p className="font-display text-big text-white">{F.title}</p>
          {F.text.map((t) => (
            <p key={t} className="text-lg leading-relaxed text-brand-haze">
              {t}
            </p>
          ))}
          <div className="mt-2 flex flex-wrap gap-3">
            {F.links.map((l) => (
              <SocialLink key={l.href} href={l.href} label={l.label} icon={l.icon} />
            ))}
          </div>
        </div>
      </article>
    </Section>
  )
}
