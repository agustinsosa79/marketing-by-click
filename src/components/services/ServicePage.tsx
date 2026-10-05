import { useRef } from 'react'
import { blog, proceso, sections, servicePage, servicios, type Service } from '../../data/content'
import { usePageIntro } from '../../hooks/usePageIntro'
import { posts } from '../../lib/blog'
import { useGSAP } from '../../lib/gsap'
import { setupReveals } from '../../lib/motion'
import { deferSetup } from '../../lib/schedule'
import { BlogCta } from '../blog/BlogCta'
import { PostCard } from '../blog/PostCard'
import { Footer } from '../sections/footer/Footer'
import { ServiceDemo } from '../sections/servicios/ServiceDemo'
import { Button } from '../ui/Button'
import { Arrow, Check, ServiceIcon } from '../ui/Icon'
import { Label } from '../ui/Title'

/**
 * /servicios/<slug>: una página por servicio para posicionar en Google y enlazar con el blog.
 * Cabecera con la mini animación del servicio, qué incluye, cómo trabajamos, notas relacionadas y otros servicios.
 */
export function ServicePage({ service }: { service: Service }) {
  const ref = useRef<HTMLDivElement>(null)
  const related = posts.filter((p) => p.category === service.blogCategory).slice(0, 3)
  const others = servicios.items.filter((s) => s.slug !== service.slug)

  usePageIntro()
  useGSAP((_, contextSafe) => deferSetup(contextSafe!(() => setupReveals(ref.current!))), { scope: ref })

  return (
    <>
      <main id="contenido" className="relative isolate z-10 bg-brand-paper">
        <header className="px-5 pt-32 pb-14 md:px-10 md:pt-40 md:pb-20">
          <nav aria-label={blog.breadcrumbAria} className="animate-intro text-sm font-semibold text-brand-night/60">
            <ol className="flex flex-wrap items-center gap-2">
              <li>
                <a href="/" className="link-underline hover:text-brand-deep">
                  {blog.breadcrumbHome}
                </a>
              </li>
              <li aria-hidden="true">/</li>
              <li>
                <a href={`/#${sections.servicios}`} className="link-underline hover:text-brand-deep">
                  {servicePage.breadcrumb}
                </a>
              </li>
              <li aria-hidden="true">/</li>
              <li aria-current="page" className="text-brand-deep">
                {service.name}
              </li>
            </ol>
          </nav>

          <div className="mt-8 grid grid-cols-1 items-center gap-10 lg:grid-cols-12">
            <div className="flex flex-col items-start gap-6 lg:col-span-6">
              <p className="intro-delay-1 flex animate-intro items-center gap-3 font-label text-label text-brand-deep">
                <span className="grid size-9 place-items-center rounded-xl bg-brand-signal text-white">
                  <ServiceIcon name={service.icon} className="size-5" />
                </span>
                {servicePage.eyebrow}
              </p>
              <h1 className="intro-delay-1 animate-intro font-display text-hero text-brand-deep">{service.name}</h1>
              <p className="intro-delay-2 animate-intro text-lead font-medium text-brand-night/75">{service.text}</p>
              <div className="intro-delay-3 flex animate-intro flex-wrap items-center gap-x-6 gap-y-3">
                <Button href={servicios.ctaHref} label={servicios.cta} variant="signal" icon="whatsapp" size="lg" cursor={servicios.cursor} />
                <a href={`/#${sections.planes}`} className="group flex items-center gap-2 font-bold text-brand-deep">
                  <span className="link-underline">{servicePage.plans}</span>
                  <Arrow className="size-4 transition-transform duration-500 ease-expo group-hover:rotate-45" />
                </a>
              </div>
            </div>
            <div className="intro-delay-2 h-80 animate-intro overflow-hidden rounded-4xl bg-brand-deep text-white md:h-96 lg:col-span-6 lg:h-panel">
              <ServiceDemo name={service.icon} active />
            </div>
          </div>
        </header>

        <div ref={ref}>
        {/* Qué incluye */}
        <section aria-labelledby="incluye" className="px-5 pb-16 md:px-10 md:pb-24">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            <div className="flex flex-col gap-4 lg:col-span-4">
              <Label>{service.name}</Label>
              <h2 id="incluye" data-reveal="lines" className="font-display text-title text-brand-deep">
                {servicios.includesLabel}
              </h2>
            </div>
            <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:col-span-8">
              {service.includes.map((inc, i) => (
                <li key={inc} data-reveal="rise" data-reveal-delay={i * 0.05} className="flex items-start gap-4 rounded-3xl bg-white p-5 font-semibold text-brand-deep shadow-soft ring-1 ring-brand-deep/10 md:p-6 md:text-lg">
                  <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-brand-signal text-white">
                    <Check className="size-3.5" />
                  </span>
                  {inc}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Cómo trabajamos (resumen) */}
        <section aria-labelledby="como" className="bg-brand-deep px-5 py-16 text-white md:px-10 md:py-24">
          <Label tone="deep">{servicePage.processTitle}</Label>
          <h2 id="como" data-reveal="lines" className="mt-4 font-display text-title">
            {proceso.title.text}
          </h2>
          <ol className="mt-10 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
            {proceso.stages.map((stage, i) => (
              <li key={stage.name} data-reveal="rise" data-reveal-delay={i * 0.06} className="flex flex-col gap-3 rounded-3xl bg-brand-night/35 p-6 ring-1 ring-white/10">
                <p className="font-label text-label text-brand-haze">{stage.when}</p>
                <p className="font-display text-2xl">{stage.name}</p>
                <p className="text-sm text-brand-haze">{stage.text}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* Notas del blog + otros servicios: enlaces internos */}
        <section className="px-5 py-16 md:px-10 md:py-24">
          {related.length > 0 && (
            <>
              <div className="flex flex-col gap-4">
                <Label>{blog.eyebrow}</Label>
                <h2 data-reveal="lines" className="font-display text-title text-brand-deep">
                  {servicePage.related} {service.name}
                </h2>
              </div>
              <ul className="mt-10 grid grid-cols-1 gap-x-6 gap-y-14 md:grid-cols-2 lg:grid-cols-3">
                {related.map((p) => (
                  <li key={p.slug} data-reveal="fade">
                    <PostCard post={p} />
                  </li>
                ))}
              </ul>
            </>
          )}

          <div className={related.length > 0 ? 'mt-20' : ''}>
            <p className="font-label text-label text-brand-deep">{servicePage.others}</p>
            <ul className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-3">
              {others.map((s) => (
                <li key={s.slug} data-reveal="rise">
                  <a href={`/servicios/${s.slug}`} className="group flex items-center gap-4 rounded-3xl bg-white p-4 ring-1 ring-brand-deep/10 transition duration-500 ease-expo hover:-translate-y-1 hover:shadow-lift md:p-5">
                    <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-brand-signal text-white">
                      <ServiceIcon name={s.icon} className="size-6" />
                    </span>
                    <span className="flex-1">
                      <span className="block font-display text-xl text-brand-deep">{s.name}</span>
                      <span className="line-clamp-1 text-sm text-brand-night/65">{s.text}</span>
                    </span>
                    <Arrow className="size-5 text-brand-signal transition-transform duration-500 ease-expo group-hover:rotate-45" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </section>
        </div>

        <BlogCta />
      </main>
      <Footer />
    </>
  )
}
