import { useRef } from 'react'
import { brand, contact, footer, servicios } from '../../../data/content'
import { fitText, useFitText } from '../../../hooks/useFitText'
import { useLenis } from '../../../hooks/useLenis'
import { useReducedMotion } from '../../../hooks/useReducedMotion'
import { fontsReady } from '../../../lib/fonts'
import { gsap, SplitText, useGSAP } from '../../../lib/gsap'
import { deferSetup } from '../../../lib/schedule'
import { Icon } from '../../ui/Icon'

/**
 * Footer mínimo con revelado tipo telón: queda sticky debajo de <main> (desktop) y aparece cuando
 * la última sección sube. El wordmark "MARKETING BY CLIC" entra letra por letra.
 */
export function Footer() {
  const ref = useRef<HTMLElement>(null)
  const inner = useRef<HTMLDivElement>(null)
  const wordmark = useRef<HTMLParagraphElement>(null)
  const { scrollTo } = useLenis()
  const reduced = useReducedMotion()

  useFitText(wordmark, 1)

  useGSAP(
    (_, contextSafe) =>
      deferSetup(
        contextSafe!(() => {
          const el = ref.current!
          // Un elemento sticky se mide mal como trigger: todo se dispara con el final de <main>
          const main = el.previousElementSibling as HTMLElement
          const once = { trigger: main, start: 'bottom 80%', once: true }
          const row = el.querySelector('[data-footer-row]')

          if (reduced) {
            gsap.fromTo([row, wordmark.current], { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.6, scrollTrigger: once })
            return
          }

          const mm = gsap.matchMedia()
          mm.add('(min-width: 768px)', () => {
            gsap.fromTo(
              inner.current,
              { yPercent: -35 },
              { yPercent: 0, ease: 'none', scrollTrigger: { trigger: main, start: 'bottom bottom', end: () => `+=${el.offsetHeight}`, scrub: true, invalidateOnRefresh: true } },
            )
          })
          gsap.fromTo(row, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 1, ease: 'reveal', scrollTrigger: once })

          let alive = true
          const animate = contextSafe!(() => {
            if (!alive || !wordmark.current) return
            const { chars } = SplitText.create(wordmark.current, { type: 'lines,chars', mask: 'lines', linesClass: 'split-line', aria: 'none' })
            fitText(wordmark.current, 1)
            gsap.fromTo(chars, { yPercent: 110 }, { yPercent: 0, duration: 1.3, stagger: 0.035, ease: 'reveal', delay: 0.2, scrollTrigger: { ...once, start: 'bottom 70%' } })
          })
          fontsReady().then(animate)
          return () => {
            alive = false
            mm.revert()
          }
        }),
      ),
    { scope: ref, dependencies: [reduced] },
  )

  const links = [
    { ...contact.whatsapp, icon: 'whatsapp' as const },
    { ...contact.instagram, icon: 'instagram' as const },
    { ...contact.founderInstagram, icon: 'instagram' as const },
  ]

  return (
    <footer ref={ref} className="relative z-0 overflow-hidden bg-brand-night text-white md:sticky md:bottom-0">
      <div ref={inner} className="px-5 pt-14 pb-6 md:px-10 md:pt-20">
        <p className="sr-only">{brand.name}</p>
        <p ref={wordmark} aria-hidden="true" className="font-wordmark leading-none whitespace-nowrap">
          <span data-fit-line className="inline-block">
            {brand.wordmark.join(' ')}
          </span>
        </p>

        <div data-footer-row className="mt-8 flex flex-col gap-6 border-t border-white/10 pt-6 text-sm md:mt-12">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <nav aria-label={footer.navAria} className="flex flex-wrap items-center gap-x-6 gap-y-2 font-semibold text-brand-haze">
              {servicios.items.map((s) => (
                <a key={s.slug} href={`/servicios/${s.slug}`} className="link-underline transition-colors duration-300 hover:text-white">
                  {s.name}
                </a>
              ))}
              <a href={footer.proyectos.href} className="link-underline transition-colors duration-300 hover:text-white">
                {footer.proyectos.label}
              </a>
              <a href={footer.blog.href} className="link-underline transition-colors duration-300 hover:text-white">
                {footer.blog.label}
              </a>
            </nav>
            <ul className="flex flex-wrap items-center gap-x-6 gap-y-2 font-semibold text-brand-haze">
              {links.map((l) => (
                <li key={l.href}>
                  <a href={l.href} target="_blank" rel="noopener noreferrer" className="group flex items-center gap-2 transition-colors duration-300 hover:text-white">
                    <Icon name={l.icon} className="size-4 transition-transform duration-500 ease-expo group-hover:-rotate-12" />
                    <span className="link-underline">{l.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col gap-4 border-t border-white/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="font-bold">{footer.line}</p>
            <div className="flex items-center justify-between gap-6 text-brand-haze">
              <span>{footer.copyright}</span>
              <button type="button" onClick={() => scrollTo(0, { duration: 2.2 })} className="group flex items-center gap-2 font-semibold whitespace-nowrap transition-colors duration-300 hover:text-white">
                <span className="link-underline">{footer.backToTop}</span>
                <span className="grid size-8 place-items-center rounded-full bg-white/10 transition duration-500 ease-expo group-hover:-translate-y-1 group-hover:bg-brand-signal">
                  <svg viewBox="0 0 24 24" aria-hidden="true" className="size-4 fill-none stroke-current stroke-2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 19V5M6 11l6-6 6 6" />
                  </svg>
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
