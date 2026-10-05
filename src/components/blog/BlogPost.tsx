import { useRef, useState } from 'react'
import { blog } from '../../data/content'
import { useLenis } from '../../hooks/useLenis'
import { usePageIntro } from '../../hooks/usePageIntro'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { postUrl, relatedPosts, type Post } from '../../lib/blog'
import { gsap, ScrollTrigger, useGSAP } from '../../lib/gsap'
import { setupReveals } from '../../lib/motion'
import { deferSetup } from '../../lib/schedule'
import { SITE_URL } from '../../lib/site'
import { Footer } from '../sections/footer/Footer'
import { Icon } from '../ui/Icon'
import { Label } from '../ui/Title'
import { BlogCta } from './BlogCta'
import { CategoryChip, PostCard, PostMetaLine } from './PostCard'

/** Compartir: WhatsApp (el canal de la marca) y copiar el link. */
function Share({ title, slug, vertical = false }: { title: string; slug: string; vertical?: boolean }) {
  const [copied, setCopied] = useState(false)
  const url = `${SITE_URL}${postUrl(slug)}`
  const copy = () => {
    navigator.clipboard?.writeText(url).then(() => {
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    })
  }
  const btn = 'grid size-11 place-items-center rounded-full bg-white text-brand-deep ring-1 ring-brand-deep/15 transition duration-300 ease-expo hover:bg-brand-deep hover:text-white active:scale-95'
  return (
    <div className={`flex items-center gap-3 ${vertical ? 'lg:flex-col lg:items-start' : ''}`}>
      <p className="font-label text-label text-brand-deep">{blog.share}</p>
      <div className={`flex gap-2 ${vertical ? 'lg:flex-col' : ''}`}>
        <a href={`https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`} target="_blank" rel="noopener noreferrer" aria-label={blog.shareWhatsapp} className={btn}>
          <Icon name="whatsapp" className="size-4" />
        </a>
        <button type="button" onClick={copy} aria-label={copied ? blog.copied : blog.copy} className={`${btn} relative`}>
          <svg viewBox="0 0 24 24" aria-hidden="true" className="size-4 fill-none stroke-current stroke-2" strokeLinecap="round" strokeLinejoin="round">
            {copied ? <path d="M5 12.5l4.5 4.5L19 7.5" /> : <path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" />}
          </svg>
          <span aria-live="polite" className={`pointer-events-none absolute left-full ml-3 rounded-full bg-brand-night px-3 py-1 text-xs font-bold whitespace-nowrap text-white transition duration-300 ${copied ? 'opacity-100' : 'opacity-0'}`}>
            {copied ? blog.copied : ''}
          </span>
        </button>
      </div>
    </div>
  )
}

/**
 * Página de una nota:
 *  - cabecera: migas, categoría, título (h1), bajada, autor y portada
 *  - cuerpo: índice fijo a la izquierda con la sección actual marcada (desktop) · texto · compartir
 *  - cierre: autor, "Seguí leyendo" y CTA a la videollamada
 */
export function BlogPost({ post }: { post: Post }) {
  const { meta, html, toc } = post
  const body = useRef<HTMLDivElement>(null)
  const article = useRef<HTMLElement>(null)
  const more = useRef<HTMLElement>(null)
  const [active, setActive] = useState(toc[0]?.id ?? '')
  const reduced = useReducedMotion()
  const { scrollTo } = useLenis()
  const related = relatedPosts(meta)

  usePageIntro()

  useGSAP(
    (_, contextSafe) =>
      deferSetup(
        contextSafe!(() => {
          const root = body.current!
          setupReveals(article.current!)
          if (more.current) setupReveals(more.current)
          // los bloques del texto aparecen al entrar en pantalla (de a tandas, liviano)
          const blocks = gsap.utils.toArray<HTMLElement>('.prose > *', root)
          if (!reduced) {
            gsap.set(blocks, { autoAlpha: 0, y: 24 })
            ScrollTrigger.batch(blocks, {
              start: 'top 90%',
              once: true,
              onEnter: (els) => gsap.to(els, { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.06, ease: 'reveal' }),
            })
          }
          // índice: la sección que cruza el 35% de la pantalla queda marcada
          toc.forEach((item, i) => {
            const el = document.getElementById(item.id)
            if (!el) return
            ScrollTrigger.create({
              trigger: el,
              start: 'top 35%',
              onEnter: () => setActive(item.id),
              onLeaveBack: () => setActive(toc[Math.max(0, i - 1)].id),
            })
          })
        }),
      ),
    { scope: body, dependencies: [reduced] },
  )

  const goTo = (id: string) => {
    const el = document.getElementById(id)
    if (el) scrollTo(el, { offset: -110, duration: 1.2 })
  }

  const tocList = (
    <ol className="flex flex-col gap-1 border-l-2 border-brand-deep/10">
      {toc.map((item) => {
        const on = item.id === active
        return (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              onClick={(e) => {
                e.preventDefault()
                goTo(item.id)
              }}
              aria-current={on ? 'location' : undefined}
              className={`-ml-0.5 block border-l-2 py-1.5 pl-4 text-sm font-semibold transition duration-300 ${
                on ? 'border-brand-signal text-brand-deep' : 'border-transparent text-brand-night/55 hover:text-brand-deep'
              }`}
            >
              {item.text}
            </a>
          </li>
        )
      })}
    </ol>
  )

  return (
    <>
      <main id="contenido" className="relative isolate z-10 bg-brand-paper">
        <article ref={article}>
          <header className="px-5 pt-32 md:px-10 md:pt-40">
            <nav aria-label={blog.breadcrumbAria} className="animate-intro text-sm font-semibold text-brand-night/60">
              <ol className="flex flex-wrap items-center gap-2">
                <li>
                  <a href="/" className="link-underline hover:text-brand-deep">
                    {blog.breadcrumbHome}
                  </a>
                </li>
                <li aria-hidden="true">/</li>
                <li>
                  <a href="/blog" className="link-underline hover:text-brand-deep">
                    {blog.eyebrow}
                  </a>
                </li>
                <li aria-hidden="true">/</li>
                <li aria-current="page" className="text-brand-deep">
                  {meta.category}
                </li>
              </ol>
            </nav>

            <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-12">
              <div className="flex flex-col gap-6 lg:col-span-9">
                <div className="intro-delay-1 flex animate-intro flex-wrap items-center gap-3">
                  <CategoryChip className="bg-brand-deep text-white">{meta.category}</CategoryChip>
                  <PostMetaLine post={meta} className="text-brand-night/60" />
                </div>
                <h1 className="intro-delay-1 animate-intro font-display text-title text-brand-deep">{meta.title}</h1>
                <p className="intro-delay-2 animate-intro text-lead font-medium text-brand-night/75 lg:w-5/6">{meta.description}</p>
                <div className="intro-delay-3 flex animate-intro items-center gap-3">
                  <img src={blog.author.photo} alt="" width={600} height={800} className="size-11 rounded-full object-cover object-top" />
                  <p className="text-sm leading-tight">
                    <span className="block font-bold text-brand-deep">{meta.author}</span>
                    <span className="block text-brand-night/60">{blog.author.role}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* sin animación de entrada: la portada es el LCP de la página */}
            <figure className="mt-10 overflow-hidden rounded-4xl bg-brand-night md:mt-14">
              <img src={meta.cover} alt={meta.coverAlt} width={900} height={506} fetchPriority="high" decoding="async" className="aspect-video w-full object-cover lg:aspect-wide" />
            </figure>
          </header>

          <div className="grid grid-cols-1 gap-10 px-5 py-14 md:px-10 md:py-20 lg:grid-cols-12">
            {/* Índice */}
            {toc.length > 1 && (
              <aside className="lg:col-span-3">
                <details className="group rounded-3xl bg-white p-5 ring-1 ring-brand-deep/10 lg:hidden">
                  <summary className="flex cursor-pointer list-none items-center justify-between font-label text-label text-brand-deep">
                    {blog.toc}
                    <span aria-hidden="true" className="text-lg transition-transform duration-300 group-open:rotate-45">+</span>
                  </summary>
                  <div className="mt-4">{tocList}</div>
                </details>
                <nav aria-label={blog.toc} className="sticky top-28 hidden lg:block">
                  <p className="mb-4 font-label text-label text-brand-deep">{blog.toc}</p>
                  {tocList}
                </nav>
              </aside>
            )}

            <div className={`flex flex-col gap-14 lg:col-span-6 ${toc.length > 1 ? '' : 'lg:col-start-4'}`}>
              <div ref={body}>
                <div className="prose" dangerouslySetInnerHTML={{ __html: html }} />
              </div>

              <div className="lg:hidden">
                <Share title={meta.title} slug={meta.slug} />
              </div>

              {/* Autor */}
              <aside data-reveal="fade" className="flex items-center gap-5 rounded-3xl bg-white p-5 ring-1 ring-brand-deep/10 md:p-6">
                <img src={blog.author.photo} alt="" width={600} height={800} loading="lazy" className="size-16 shrink-0 rounded-full object-cover object-top md:size-20" />
                <div className="flex flex-col gap-1">
                  <p className="font-display text-xl text-brand-deep">{meta.author}</p>
                  <p className="text-sm text-brand-night/70">{blog.author.role}</p>
                  <a href={blog.author.instagram.href} target="_blank" rel="noopener noreferrer" className="group mt-1 flex items-center gap-2 text-sm font-bold text-brand-signal">
                    <Icon name="instagram" className="size-4 transition-transform duration-500 ease-expo group-hover:-rotate-12" />
                    <span className="link-underline">{blog.author.instagram.label}</span>
                  </a>
                </div>
              </aside>
            </div>

            <div className="hidden lg:col-span-2 lg:col-start-11 lg:block">
              <div className="sticky top-28">
                <Share title={meta.title} slug={meta.slug} vertical />
              </div>
            </div>
          </div>
        </article>

        {related.length > 0 && (
          <section ref={more} aria-labelledby="seguir-leyendo" className="border-t border-brand-deep/10 px-5 py-16 md:px-10 md:py-24">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div className="flex flex-col gap-4">
                <Label>{blog.eyebrow}</Label>
                <h2 id="seguir-leyendo" data-reveal="lines" className="font-display text-title text-brand-deep">
                  {blog.related}
                </h2>
              </div>
              <a href="/blog" className="group flex items-center gap-2 font-bold text-brand-signal">
                <span className="link-underline">{blog.back}</span>
              </a>
            </div>
            <ul className="mt-10 grid grid-cols-1 gap-x-6 gap-y-14 md:mt-14 md:grid-cols-2 lg:grid-cols-3">
              {related.map((p) => (
                <li key={p.slug} data-reveal="fade">
                  <PostCard post={p} />
                </li>
              ))}
            </ul>
          </section>
        )}

        <BlogCta />
      </main>
      <Footer />
    </>
  )
}
