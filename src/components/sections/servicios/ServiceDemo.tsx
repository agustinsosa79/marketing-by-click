import { useRef } from 'react'
import { proceso, servicios, type Service } from '../../../data/content'
import { useReducedMotion } from '../../../hooks/useReducedMotion'
import { gsap, useGSAP } from '../../../lib/gsap'
import { Arrow, Isotipo } from '../../ui/Icon'

/**
 * Mini animación de cada servicio (ilustración, sin datos inventados). Se reproduce cada vez que el servicio se activa.
 *  strategy → diana: la flecha da en el centro y aparecen las etapas del proceso
 *  content  → celular: el feed se llena de piezas
 *  ads      → gráfico: las barras crecen, la tendencia se dibuja y la campaña queda activa
 *  branding → construcción del isotipo: guías, marca y paleta
 */
export function ServiceDemo({ name, active }: { name: Service['icon']; active: boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()

  useGSAP(
    () => {
      if (!active) return
      const q = gsap.utils.selector(ref)
      if (reduced) {
        gsap.fromTo(ref.current, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4 })
        return
      }
      const tl = gsap.timeline({ defaults: { ease: 'reveal' } })
      if (name === 'strategy') {
        tl.fromTo(q('[data-ring]'), { scale: 0 }, { scale: 1, duration: 0.9, stagger: 0.08, ease: 'back.out(1.6)' })
          .fromTo(q('[data-dart]'), { x: -160, y: 120, autoAlpha: 0 }, { x: 0, y: 0, autoAlpha: 1, duration: 0.7, ease: 'power3.in' }, 0.35)
          .fromTo(q('[data-hit]'), { scale: 0.4, autoAlpha: 1 }, { scale: 2.4, autoAlpha: 0, duration: 0.8, ease: 'power2.out' }, 1.05)
          .fromTo(q('[data-pill]'), { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.12 }, 1)
      }
      if (name === 'content') {
        tl.fromTo(q('[data-phone]'), { y: 40, autoAlpha: 0, rotate: -4 }, { y: 0, autoAlpha: 1, rotate: 0, duration: 0.9 })
          .fromTo(q('[data-tile]'), { scale: 0 }, { scale: 1, duration: 0.6, stagger: { each: 0.06, from: 'start' }, ease: 'back.out(1.8)' }, 0.35)
          .fromTo(q('[data-heart]'), { scale: 0, rotate: -20 }, { scale: 1, rotate: 0, duration: 0.6, ease: 'back.out(2.4)' }, 1.1)
          .fromTo(q('[data-badge]'), { autoAlpha: 0, x: 20 }, { autoAlpha: 1, x: 0, duration: 0.7 }, 1.2)
      }
      if (name === 'ads') {
        tl.fromTo(q('[data-card]'), { y: 30, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.8 })
          .fromTo(q('[data-bar]'), { scaleY: 0 }, { scaleY: 1, duration: 0.9, stagger: 0.07, ease: 'expo.out' }, 0.25)
          .fromTo(q('[data-trend]'), { clipPath: 'inset(0% 100% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.1, ease: 'power2.inOut' }, 0.55)
          .fromTo(q('[data-live]'), { autoAlpha: 0, y: -12 }, { autoAlpha: 1, y: 0, duration: 0.6 }, 1.1)
      }
      if (name === 'branding') {
        tl.fromTo(q('[data-guide]'), { scale: 0, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.9, stagger: 0.1 })
          .fromTo(q('[data-axis-x]'), { scaleX: 0 }, { scaleX: 1, duration: 0.8, ease: 'expo.inOut' }, 0.1)
          .fromTo(q('[data-axis-y]'), { scaleY: 0 }, { scaleY: 1, duration: 0.8, ease: 'expo.inOut' }, 0.2)
          .fromTo(q('[data-mark]'), { scale: 0.6, autoAlpha: 0, rotate: -10 }, { scale: 1, autoAlpha: 1, rotate: 0, duration: 0.9, ease: 'back.out(1.6)' }, 0.65)
          .fromTo(q('[data-swatch]'), { y: 24, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.6, stagger: 0.07 }, 1)
      }
      return () => tl.kill()
    },
    { scope: ref, dependencies: [active, name, reduced], revertOnUpdate: true },
  )

  return (
    <div ref={ref} aria-hidden="true" className="relative grid size-full place-items-center overflow-hidden">
      {/* en mobile el panel es más bajo: la ilustración se achica entera */}
      <div className="scale-60 md:scale-100">
        {name === 'strategy' && (
          <div className="flex flex-col items-center gap-6">
            <div className="relative grid size-40 place-items-center md:size-48">
              <span data-ring className="absolute inset-0 rounded-full border-2 border-white/20" />
              <span data-ring className="absolute inset-6 rounded-full border-2 border-white/40" />
              <span data-ring className="absolute inset-12 rounded-full bg-white/15" />
              <span data-ring className="absolute inset-16 rounded-full bg-brand-signal md:inset-18" />
              <span data-hit className="absolute size-10 rounded-full border-2 border-white opacity-0" />
              <span data-dart className="absolute grid size-12 place-items-center rounded-full bg-white text-brand-deep shadow-lift">
                <Arrow className="size-6 rotate-180" />
              </span>
            </div>
            <div className="hidden flex-wrap justify-center gap-2 md:flex">
              {proceso.stages.slice(0, 3).map((s) => (
                <span key={s.name} data-pill className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold ring-1 ring-white/20">
                  {s.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {name === 'content' && (
          <div className="relative">
            <div data-phone className="w-40 rounded-3xl bg-brand-night p-2.5 ring-1 ring-white/20 md:w-48">
              <div className="flex items-center gap-2 px-1 pb-2.5">
                <span className="size-6 rounded-full bg-brand-signal" />
                <span className="h-1.5 w-16 rounded-full bg-white/30" />
              </div>
              <div className="grid grid-cols-3 gap-1">
                {['bg-brand-signal', 'bg-white', 'bg-brand-haze', 'bg-brand-haze', 'bg-brand-signal', 'bg-white', 'bg-white', 'bg-brand-haze', 'bg-brand-signal'].map((c, i) => (
                  <span key={i} data-tile className={`aspect-square rounded-md ${c}`} />
                ))}
              </div>
            </div>
            <span data-heart className="absolute -top-4 -right-5 grid size-11 place-items-center rounded-full bg-white text-brand-signal shadow-lift">
              <svg viewBox="0 0 24 24" className="size-5 fill-current">
                <path d="M12 21s-7.5-4.6-9.6-9.2C.9 8.4 3 4.5 6.7 4.5c2 0 3.6 1.1 5.3 3 1.7-1.9 3.3-3 5.3-3 3.7 0 5.8 3.9 4.3 7.3C19.5 16.4 12 21 12 21z" />
              </svg>
            </span>
            <span data-badge className="absolute -bottom-3 -left-12 flex items-center gap-2 rounded-full bg-white py-1.5 pr-3 pl-1.5 text-xs font-bold text-brand-deep shadow-lift">
              <span className="grid size-6 place-items-center rounded-full bg-brand-signal text-white">
                <svg viewBox="0 0 24 24" className="size-3 translate-x-px fill-current">
                  <path d="M7 4v16l13-8z" />
                </svg>
              </span>
              {servicios.demo.reels}
            </span>
          </div>
        )}

        {name === 'ads' && (
          <div data-card className="relative w-64 rounded-3xl bg-white p-5 text-brand-deep shadow-lift md:w-72">
            <div className="flex items-center justify-between">
              <span className="h-2 w-20 rounded-full bg-brand-deep/20" />
              <span data-live className="flex items-center gap-1.5 rounded-full bg-brand-signal/10 px-2.5 py-1 text-xs font-bold text-brand-deep">
                <span className="size-1.5 animate-pulse rounded-full bg-brand-signal" />
                {servicios.demo.ads}
              </span>
            </div>
            <div className="relative mt-5 flex h-32 items-end gap-2">
              {['h-1/4', 'h-2/5', 'h-1/3', 'h-3/5', 'h-1/2', 'h-4/5', 'h-full'].map((hh, i) => (
                <span key={i} data-bar className={`flex-1 origin-bottom rounded-t-md ${hh} ${i > 4 ? 'bg-brand-signal' : 'bg-brand-haze'}`} />
              ))}
              <svg data-trend viewBox="0 0 100 40" preserveAspectRatio="none" className="absolute inset-0 size-full overflow-visible">
                <polyline points="2,34 18,28 34,30 50,18 66,22 82,10 98,3" className="fill-none stroke-brand-deep" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
              </svg>
            </div>
          </div>
        )}

        {name === 'branding' && (
          <div className="flex flex-col items-center gap-6">
            <div className="relative grid size-40 place-items-center md:size-48">
              <span data-guide className="absolute inset-0 rounded-full border border-dashed border-white/40" />
              <span data-guide className="absolute inset-8 rounded-full border border-white/25" />
              <span data-axis-x className="absolute inset-x-0 top-1/2 h-px bg-white/30" />
              <span data-axis-y className="absolute inset-y-0 left-1/2 w-px bg-white/30" />
              <Isotipo data-mark className="relative w-20 text-white md:w-24" />
            </div>
            <div className="hidden gap-2 md:flex">
              {['bg-brand-night', 'bg-brand-deep ring-1 ring-white/40', 'bg-brand-signal', 'bg-brand-haze', 'bg-brand-paper'].map((c) => (
                <span key={c} data-swatch className={`size-8 rounded-full ${c}`} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
