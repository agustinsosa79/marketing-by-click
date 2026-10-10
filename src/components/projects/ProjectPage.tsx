import { useRef } from 'react'
import { blog, proyectos } from '../../data/content'
import { usePageIntro } from '../../hooks/usePageIntro'
import { useGSAP } from '../../lib/gsap'
import { setupReveals } from '../../lib/motion'
import { nextProject, projectUrl, type Project } from '../../lib/projects'
import { deferSetup } from '../../lib/schedule'
import { BlogCta } from '../blog/BlogCta'
import { CategoryChip } from '../blog/PostCard'
import { Footer } from '../sections/footer/Footer'
import { Arrow } from '../ui/Icon'
import { Label } from '../ui/Title'

/** Párrafos separados por una línea en blanco (lo que se escribe en el panel). */
function Paragraphs({ text, className = '' }: { text: string; className?: string }) {
  return (
    <>
      {text
        .split(/\n\s*\n/)
        .map((p) => p.trim())
        .filter(Boolean)
        .map((p, i) => (
          <p key={i} data-reveal="rise" className={className}>
            {p}
          </p>
        ))}
    </>
  )
}

/**
 * /proyectos/<slug>: un proyecto contado de punta a punta.
 * Cabecera (marca, qué se hizo, datos y portada) → el desafío → cómo lo hicimos (pasos con imagen)
 * → el resultado → más piezas → el siguiente proyecto → videollamada.
 * Cada bloque aparece solo si el cliente lo completó en el panel.
 */
export function ProjectPage({ project }: { project: Project }) {
  const ref = useRef<HTMLDivElement>(null)
  const next = nextProject(project.slug)
  const d = proyectos.detail
  const facts = [
    { label: d.sector, value: project.sector },
    { label: d.location, value: project.location },
    { label: d.year, value: project.year },
  ].filter((f) => f.value)

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
                <a href="/proyectos" className="link-underline hover:text-brand-deep">
                  {d.breadcrumb}
                </a>
              </li>
              <li aria-hidden="true">/</li>
              <li aria-current="page" className="text-brand-deep">
                {project.brand}
              </li>
            </ol>
          </nav>

          <div className="mt-8 grid grid-cols-1 items-center gap-10 lg:grid-cols-12">
            <div className="flex flex-col items-start gap-6 lg:col-span-5">
              {project.services.length > 0 && (
                <ul aria-label={d.services} className="intro-delay-1 flex animate-intro flex-wrap gap-2">
                  {project.services.map((s) => (
                    <li key={s}>
                      <CategoryChip className="bg-brand-signal text-white">{s}</CategoryChip>
                    </li>
                  ))}
                </ul>
              )}
              <h1 className="intro-delay-1 animate-intro font-display text-hero text-brand-deep">{project.brand}</h1>
              {project.title && <p className="intro-delay-2 animate-intro text-lead font-semibold text-brand-deep">{project.title}</p>}
              <p className="intro-delay-2 animate-intro text-base font-medium text-brand-night/75 md:text-lg">{project.summary}</p>
              {facts.length > 0 && (
                <dl className="intro-delay-3 grid w-full animate-intro grid-cols-2 gap-x-6 gap-y-4 border-t border-brand-deep/15 pt-6 sm:grid-cols-3">
                  {facts.map((f) => (
                    <div key={f.label}>
                      <dt className="font-label text-label text-brand-night/55">{f.label}</dt>
                      <dd className="mt-1 font-bold text-brand-deep">{f.value}</dd>
                    </div>
                  ))}
                </dl>
              )}
            </div>
            <figure className="intro-delay-2 animate-intro overflow-hidden rounded-4xl bg-white shadow-soft ring-1 ring-brand-deep/10 lg:col-span-7">
              <img src={project.cover.src} alt={project.cover.alt} width={project.cover.width} height={project.cover.height} decoding="async" className="aspect-4/3 w-full object-cover" />
            </figure>
          </div>
        </header>

        <div ref={ref}>
          {/* El desafío */}
          {project.challenge && (
            <section aria-labelledby="desafio" className="px-5 pb-16 md:px-10 md:pb-24">
              <div className="grid grid-cols-1 gap-6 border-t border-brand-deep/15 pt-10 md:pt-14 lg:grid-cols-12 lg:gap-10">
                <div className="lg:col-span-4">
                  <Label>{project.brand}</Label>
                  <h2 id="desafio" data-reveal="lines" className="mt-4 font-display text-title text-brand-deep">
                    {d.challenge}
                  </h2>
                </div>
                <div className="flex flex-col gap-5 lg:col-span-8">
                  <Paragraphs text={project.challenge} className="text-xl leading-snug font-semibold text-brand-deep md:text-2xl" />
                </div>
              </div>
            </section>
          )}

          {/* Cómo lo hicimos */}
          {project.process.length > 0 && (
            <section aria-labelledby="proceso" className="bg-brand-deep px-5 py-16 text-white md:px-10 md:py-24">
              <Label tone="deep">{project.brand}</Label>
              <h2 id="proceso" data-reveal="lines" className="mt-4 font-display text-title">
                {d.process}
              </h2>
              <ol className="mt-10 flex flex-col gap-4 md:mt-14 md:gap-6">
                {project.process.map((step, i) => {
                  const flip = i % 2 === 1
                  return (
                    <li key={`${step.title}-${i}`} data-reveal="fade" className="grid grid-cols-1 items-center gap-6 rounded-4xl bg-brand-night/35 p-3 ring-1 ring-white/10 md:p-4 lg:grid-cols-12 lg:gap-10">
                      {step.image && (
                        <div className={`overflow-hidden rounded-3xl bg-brand-night lg:col-span-7 ${flip ? 'lg:order-2' : ''}`}>
                          <img src={step.image.src} alt={step.image.alt} width={step.image.width} height={step.image.height} loading="lazy" decoding="async" className="h-auto w-full" />
                        </div>
                      )}
                      <div className={`flex flex-col gap-3 px-3 pb-4 lg:px-6 lg:pb-0 ${step.image ? 'lg:col-span-5' : 'lg:col-span-12 lg:py-6'}`}>
                        <span className="font-label text-label text-brand-haze">{String(i + 1).padStart(2, '0')}</span>
                        {step.title && <h3 className="font-display text-big">{step.title}</h3>}
                        {step.text && <Paragraphs text={step.text} className="text-base text-brand-haze md:text-lg" />}
                      </div>
                    </li>
                  )
                })}
              </ol>
            </section>
          )}

          {/* El resultado */}
          {project.result && (
            <section aria-labelledby="resultado" className="px-5 py-16 md:px-10 md:py-24">
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-10">
                <div className="lg:col-span-4">
                  <Label>{project.brand}</Label>
                  <h2 id="resultado" data-reveal="lines" className="mt-4 font-display text-title text-brand-deep">
                    {d.result}
                  </h2>
                </div>
                <div className="flex flex-col gap-5 border-l-4 border-brand-signal pl-6 lg:col-span-8 lg:pl-10">
                  <Paragraphs text={project.result} className="text-xl leading-snug font-semibold text-brand-deep md:text-2xl" />
                </div>
              </div>
            </section>
          )}

          {/* Más piezas: columnas tipo mosaico, cada imagen con su proporción real */}
          {project.gallery.length > 0 && (
            <section aria-labelledby="galeria" className="px-5 pb-16 md:px-10 md:pb-24">
              <h2 id="galeria" className="font-label text-label text-brand-deep">
                {d.gallery}
              </h2>
              <ul className="mt-6 columns-1 gap-4 sm:columns-2 lg:columns-3">
                {project.gallery.map((img) => (
                  <li key={img.src} data-reveal="fade" className="mb-4 break-inside-avoid overflow-hidden rounded-3xl bg-white ring-1 ring-brand-deep/10">
                    <img src={img.src} alt={img.alt} width={img.width} height={img.height} loading="lazy" decoding="async" className="w-full" />
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Siguiente proyecto */}
          <nav aria-label={d.breadcrumb} className="px-5 pb-16 md:px-10 md:pb-24">
            <div className="flex flex-col gap-3 border-t border-brand-deep/15 pt-10 md:flex-row md:items-end md:justify-between">
              {next ? (
                <a href={projectUrl(next.slug)} data-cursor={proyectos.cursor} className="group flex flex-col gap-2">
                  <span className="font-label text-label text-brand-night/60">{d.next}</span>
                  <span className="flex items-center gap-4 font-display text-title text-brand-deep transition-colors duration-500 group-hover:text-brand-signal">
                    {next.brand}
                    <Arrow className="size-8 shrink-0 transition-transform duration-500 ease-expo group-hover:rotate-45 md:size-12" />
                  </span>
                </a>
              ) : (
                <span />
              )}
              <a href="/proyectos" className="group flex items-center gap-2 font-bold text-brand-deep">
                <span className="link-underline">{d.back}</span>
                <Arrow className="size-4 transition-transform duration-500 ease-expo group-hover:rotate-45" />
              </a>
            </div>
          </nav>
        </div>

        <BlogCta cta={d.cta} />
      </main>
      <Footer />
    </>
  )
}
