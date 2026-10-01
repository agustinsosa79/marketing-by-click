import { useRef } from 'react'
import { brand, contact, footer, nav } from '../../../data/content'
import { fitText, useFitText } from '../../../hooks/useFitText'
import { useLenis } from '../../../hooks/useLenis'
import { useReducedMotion } from '../../../hooks/useReducedMotion'
import { fontsReady } from '../../../lib/fonts'
import { gsap, SplitText, useGSAP } from '../../../lib/gsap'
import { deferSetup } from '../../../lib/schedule'
import { Icon } from '../../ui/Icon'

/**
 * Footer con revelado tipo telón: queda sticky debajo de <main> (z-0) y aparece cuando la última sección
 * sube; su contenido acompaña con parallax. El wordmark "MARKETING BY CLIC" entra letra por letra.
 * En mobile va en el flujo normal (puede ser más alto que la pantalla).
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
      const lines = el.querySelectorAll('[data-footer-line]')
      const cols = el.querySelectorAll('[data-footer-col]')
      const once = { trigger: main, start: 'bottom 75%', once: true }

      if (reduced) {
        gsap.fromTo([...lines, ...cols, wordmark.current], { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.6, scrollTrigger: once })
        return
      }

      // Parallax del contenido mientras el telón se abre (solo desktop, donde el footer es sticky)
      const mm = gsap.matchMedia()
      mm.add('(min-width: 768px)', () => {
        gsap.fromTo(inner.current, { yPercent: -30 }, { yPercent: 0, ease: 'none', scrollTrigger: { trigger: main, start: 'bottom bottom', end: () => `+=${el.offsetHeight}`, scrub: true, invalidateOnRefresh: true } })
      })

      gsap.fromTo(lines, { yPercent: 110 }, { yPercent: 0, duration: 1.2, stagger: 0.08, ease: 'reveal', scrollTrigger: once })
      gsap.fromTo(cols, { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 1, stagger: 0.1, ease: 'reveal', delay: 0.2, scrollTrigger: once })

      let alive = true
      const animate = contextSafe!(() => {
        if (!alive || !wordmark.current) return
        const { chars } = SplitText.create(wordmark.current, { type: 'lines,chars', mask: 'lines', aria: 'none' })
        fitText(wordmark.current, 1)
        gsap.fromTo(chars, { yPercent: 110 }, { yPercent: 0, duration: 1.3, stagger: 0.035, ease: 'reveal', delay: 0.3, scrollTrigger: { ...once, start: 'bottom 60%' } })
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

  return (
    <footer ref={ref} className="relative z-0 overflow-hidden bg-brand-night text-brand-paper md:sticky md:bottom-0">
      <div ref={inner} className="px-5 pt-20 pb-6 md:px-10 md:pt-28">
        <div className="grid gap-12 md:grid-cols-12 md:gap-6">
          <div className="md:col-span-5">
            {footer.lines.map((line) => (
              <p key={line} className="overflow-hidden pb-descender font-accent text-4xl md:text-6xl">
                <span data-footer-line className="block">
                  {line}
                </span>
              </p>
            ))}
          </div>

          <nav data-footer-col aria-label={footer.navTitle} className="md:col-span-3 md:col-start-7">
            <h2 className="text-label font-semibold text-brand-sky">{footer.navTitle}</h2>
            <ul className="mt-5 grid grid-cols-2 gap-x-6 gap-y-2 md:grid-cols-1">
              {nav.items.map((item) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    onClick={(e) => {
                      e.preventDefault()
                      const target = document.getElementById(item.id)
                      if (target) scrollTo(target, { duration: 1.6 })
                    }}
                    className="link-underline text-lg font-bold"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div data-footer-col className="md:col-span-3">
            <h2 className="text-label font-semibold text-brand-sky">{footer.contactTitle}</h2>
            <ul className="mt-5 flex flex-col gap-3">
              {[
                { href: contact.whatsapp.href, label: contact.whatsapp.label, icon: 'whatsapp' as const },
                { href: contact.instagram.href, label: contact.instagram.label, icon: 'instagram' as const },
                { href: contact.founderInstagram.href, label: contact.founderInstagram.label, icon: 'instagram' as const },
              ].map((l) => (
                <li key={l.href}>
                  <a href={l.href} target="_blank" rel="noopener noreferrer" className="group flex items-center gap-3 text-lg font-bold">
                    <Icon name={l.icon} className="size-5 transition-transform duration-500 ease-expo group-hover:-rotate-12 group-hover:scale-115" />
                    <span className="link-underline">{l.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p className="sr-only">{brand.name}</p>
        <p ref={wordmark} aria-hidden="true" className="mt-16 font-display leading-none whitespace-nowrap md:mt-24">
          <span data-fit-line className="inline-block">
            {brand.wordmark.join(' ')}
          </span>
        </p>

        <div className="mt-6 flex flex-col gap-4 border-t border-brand-paper/15 pt-5 text-label font-semibold md:flex-row md:items-center md:justify-between">
          <p className="opacity-80">{footer.copyright}</p>
          <button
            type="button"
            onClick={() => scrollTo(0, { duration: 2.2 })}
            className="group flex min-h-11 items-center gap-3 self-start border-t border-brand-paper/25 py-2 transition-transform duration-300 ease-expo active:scale-97"
          >
            <span className="link-underline">{footer.backToTop}</span>
            <span aria-hidden="true" className="grid size-8 place-items-center bg-brand-sky text-brand-night transition-transform duration-500 ease-expo group-hover:-translate-y-1">
              ↑
            </span>
          </button>
        </div>
      </div>
    </footer>
  )
}
