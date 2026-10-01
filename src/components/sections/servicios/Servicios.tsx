import { useLayoutEffect, useRef, useState, type MouseEvent } from 'react'
import { sections, servicios } from '../../../data/content'
import { useReducedMotion } from '../../../hooks/useReducedMotion'
import { gsap, useGSAP } from '../../../lib/gsap'
import { DUR, setupReveals } from '../../../lib/motion'
import { deferSetup } from '../../../lib/schedule'
import { Button } from '../../ui/Button'
import { RollText } from '../../ui/RollText'
import { Section } from '../../ui/Section'
import { Label, SectionTitle } from '../../ui/SectionTitle'

const items = servicios.items

/** Íconos de línea para los tres principios (análisis → soluciones → ejecución). */
const PRINCIPLE_ICONS = [
  <path key="a" d="M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM21 21l-5-5" />,
  <path key="b" d="M4 7h10M18 7h2M4 17h4M12 17h8M14 4v6M8 14v6" />,
  <path key="c" d="M5 19 19 5M9 5h10v10" />,
]

// Relleno de la fila: entra con clip-path desde el borde por donde llega el mouse (esquinas redondeadas)
const CLIP = {
  full: 'inset(0% 0% 0% 0% round 1.5rem)',
  top: 'inset(0% 0% 100% 0% round 1.5rem)',
  bottom: 'inset(100% 0% 0% 0% round 1.5rem)',
}

/**
 * Servicios como índice:
 *  - hover (desktop): la fila se llena de celeste desde el borde por donde entra el mouse, el nombre hace roll
 *    y una imagen sigue al cursor con retraso e inclinación según la velocidad
 *  - click: la fila se abre (FLIP: las filas de abajo se deslizan) y la imagen del cursor aterriza en el panel
 *  - cerrar: el panel se desvanece primero y después las filas suben suave (nada desaparece de golpe)
 *  - mobile: acordeón
 */
export function Servicios() {
  const ref = useRef<HTMLElement>(null)
  const list = useRef<HTMLUListElement>(null)
  const cursor = useRef<HTMLDivElement>(null)
  const [hovered, setHovered] = useState<number | null>(null)
  const [open, setOpen] = useState<number | null>(null)
  const reduced = useReducedMotion()
  const follow = useRef<{ x: gsap.QuickToFunc; y: gsap.QuickToFunc; r: gsap.QuickToFunc } | null>(null)
  const last = useRef({ x: 0, t: 0 })
  const canHover = useRef(false)
  const busy = useRef(false)
  // FLIP: posición de cada fila antes de cambiar el layout + de dónde sale la imagen
  const flip = useRef<{ tops: number[]; from: DOMRect | null } | null>(null)

  useGSAP(
    (_, contextSafe) =>
      // armado diferido: no compite con el preloader (lib/schedule.ts)
      deferSetup(
        contextSafe!(() => {
          setupReveals(ref.current!)
          canHover.current = window.matchMedia('(hover: hover) and (pointer: fine)').matches
          follow.current = {
            x: gsap.quickTo(cursor.current, 'x', { duration: 0.6, ease: 'power3' }),
            y: gsap.quickTo(cursor.current, 'y', { duration: 0.6, ease: 'power3' }),
            r: gsap.quickTo(cursor.current, 'rotate', { duration: 0.8, ease: 'power3' }),
          }
        }),
      ),
    { scope: ref },
  )

  // Imagen del cursor: visible al pasar por una fila cerrada; cambia de imagen con clip-path
  useGSAP(
    () => {
      if (!canHover.current) return
      const visible = hovered !== null && hovered !== open
      gsap.to(cursor.current, { autoAlpha: visible ? 1 : 0, scale: visible ? 1 : 0.7, duration: reduced ? 0 : 0.5, ease: 'reveal', overwrite: 'auto' })
      gsap.utils.toArray<HTMLElement>('[data-cursor-img]', cursor.current).forEach((img, i) => {
        gsap.to(img, {
          clipPath: i === hovered ? 'inset(0% 0% 0% 0%)' : 'inset(100% 0% 0% 0%)',
          scale: i === hovered ? 1 : 1.3,
          duration: reduced ? 0 : 0.7,
          ease: 'expo.out',
          overwrite: 'auto',
        })
      })
    },
    { scope: ref, dependencies: [hovered, open, reduced] },
  )

  // Después del cambio de layout: las filas se deslizan desde donde estaban y el panel nuevo entra
  useLayoutEffect(() => {
    const state = flip.current
    if (!state || !list.current) return
    flip.current = null
    if (reduced) return
    const rows = [...list.current.querySelectorAll<HTMLElement>('[data-service-item]')]
    rows.forEach((row, i) => {
      const delta = state.tops[i] - row.getBoundingClientRect().top
      if (Math.abs(delta) > 1) gsap.fromTo(row, { y: delta }, { y: 0, duration: 0.85, ease: 'expo.inOut', clearProps: 'transform' })
    })

    if (open === null) return
    const panel = list.current.querySelector<HTMLElement>(`[data-service-panel="${open}"]`)
    const card = panel?.querySelector<HTMLElement>('[data-panel-card]')
    if (!panel || !card) return
    gsap.fromTo(card, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.8, ease: 'reveal', delay: 0.1 })
    gsap.fromTo(panel.querySelectorAll('[data-panel-text]'), { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: DUR.slow, stagger: 0.07, ease: 'reveal', delay: 0.2 })

    const img = panel.querySelector<HTMLElement>('[data-panel-img]')
    if (!img) return
    const to = img.getBoundingClientRect()
    if (state.from) {
      // la imagen del cursor "aterriza" en su lugar del panel (mismo formato 4:3, escala uniforme)
      gsap.fromTo(
        img,
        { x: state.from.left - to.left, y: state.from.top - to.top, scale: state.from.width / to.width, transformOrigin: '0% 0%' },
        { x: 0, y: 0, scale: 1, duration: 1, ease: 'expo.inOut', clearProps: 'transform' },
      )
    } else {
      gsap.fromTo(img, { clipPath: 'inset(100% 0% 0% 0% round 1.5rem)' }, { clipPath: CLIP.full, duration: DUR.slow, ease: 'expo.inOut' })
    }
  }, [open, reduced])

  const commit = (next: number | null) => {
    const rows = [...(list.current?.querySelectorAll<HTMLElement>('[data-service-item]') ?? [])]
    const fromCursor = next !== null && hovered === next && canHover.current
    flip.current = {
      tops: rows.map((r) => r.getBoundingClientRect().top),
      from: fromCursor ? cursor.current!.querySelector('[data-cursor-frame]')!.getBoundingClientRect() : null,
    }
    if (fromCursor) gsap.set(cursor.current, { autoAlpha: 0 })
    setOpen(next)
  }

  const toggle = (i: number) => {
    if (busy.current) return
    const next = open === i ? null : i
    const card = open === null ? null : list.current?.querySelector<HTMLElement>(`[data-service-panel="${open}"] [data-panel-card]`)
    if (!card || reduced) return commit(next)
    // primero se va el contenido abierto, después se acomodan las filas
    busy.current = true
    gsap.to(card, {
      autoAlpha: 0,
      y: -16,
      duration: 0.38,
      ease: 'power2.in',
      onComplete: () => {
        busy.current = false
        commit(next)
      },
    })
  }

  const onMove = (e: MouseEvent) => {
    if (!follow.current || !canHover.current) return
    follow.current.x(e.clientX)
    follow.current.y(e.clientY)
    // inclinación según la velocidad horizontal del mouse
    const now = performance.now()
    const dt = Math.max(16, now - last.current.t)
    const vx = (e.clientX - last.current.x) / dt
    last.current = { x: e.clientX, t: now }
    follow.current.r(gsap.utils.clamp(-12, 12, vx * 8))
  }

  // Relleno celeste que entra por el borde por donde llega el mouse (y sale por donde se va)
  const fill = (e: MouseEvent<HTMLElement>, enter: boolean) => {
    const row = e.currentTarget
    const r = row.getBoundingClientRect()
    const fromTop = e.clientY < r.top + r.height / 2
    const edge = fromTop ? CLIP.top : CLIP.bottom
    const el = row.querySelector('[data-fill]')
    if (enter) gsap.fromTo(el, { clipPath: edge }, { clipPath: CLIP.full, duration: reduced ? 0 : 0.5, ease: 'expo.out', overwrite: 'auto' })
    else gsap.to(el, { clipPath: edge, duration: reduced ? 0 : 0.45, ease: 'expo.out', overwrite: 'auto' })
  }

  return (
    <Section id={sections.servicios} ref={ref} bg="paper" className="px-5 py-28 md:px-10 md:py-40">
      <Label>{servicios.eyebrow}</Label>

      <div className="mt-6 grid gap-8 lg:grid-cols-12 lg:items-end lg:gap-6">
        <SectionTitle text={servicios.title} className="font-display text-giant lg:col-span-8" />
        <p data-reveal="fade" className="text-lg leading-snug font-semibold text-brand-deep/85 lg:col-span-4 lg:pb-3">
          {servicios.intro}
        </p>
      </div>

      {/* Principios: tres tarjetas suaves */}
      <ul className="mt-14 grid gap-4 md:mt-20 md:grid-cols-3 md:gap-6">
        {servicios.principles.map((p, i) => (
          <li
            key={p.title}
            data-reveal="fade"
            data-reveal-delay={i * 0.08}
            className="group flex flex-col gap-4 border-t border-brand-deep/20 py-6 transition-transform duration-500 ease-expo md:py-8 md:hover:translate-x-1"
          >
            <span className="grid size-12 place-items-center rounded-2xl bg-brand-deep text-brand-sky transition-transform duration-500 ease-expo group-hover:-rotate-6 group-hover:scale-110">
              <svg viewBox="0 0 24 24" aria-hidden="true" className="size-5 fill-none stroke-current stroke-2" strokeLinecap="round" strokeLinejoin="round">
                {PRINCIPLE_ICONS[i]}
              </svg>
            </span>
            <h3 className="font-accent text-4xl md:text-5xl">{p.title}</h3>
            <p className="text-sm leading-relaxed text-brand-deep/80 md:text-base">{p.text}</p>
          </li>
        ))}
      </ul>

      {/* Índice de servicios */}
      <ul ref={list} className="mt-20 md:mt-28" onMouseMove={onMove}>
        {items.map((item, i) => {
          const isOpen = open === i
          const dimmed = hovered !== null && hovered !== i
          return (
            <li key={item.name} data-service-item data-reveal="fade" data-reveal-delay={i * 0.05} className="relative border-t border-brand-deep/15 last:border-b">
              <button
                type="button"
                data-cursor={isOpen ? undefined : servicios.cursor}
                aria-expanded={isOpen}
                aria-controls={`servicio-${i}`}
                onClick={() => toggle(i)}
                onMouseEnter={(e) => {
                  setHovered(i)
                  fill(e, true)
                }}
                onMouseLeave={(e) => {
                  setHovered(null)
                  fill(e, false)
                }}
                className={`relative grid w-full grid-cols-12 items-center gap-x-4 px-2 py-4 text-left transition-opacity duration-500 md:gap-x-6 md:px-6 md:py-6 ${dimmed ? 'md:opacity-40' : ''}`}
              >
                <span data-fill aria-hidden="true" className="absolute inset-x-0 inset-y-1 rounded-3xl bg-brand-sky" style={{ clipPath: CLIP.bottom }} />
                <span className="relative col-span-10 font-display text-index md:col-span-8">
                  <RollText text={item.name} active={hovered === i} />
                </span>
                <span className="relative col-span-3 hidden text-label font-semibold md:block">{item.tag}</span>
                <span className="relative col-span-2 justify-self-end md:col-span-1">
                  <span
                    aria-hidden="true"
                    className={`grid size-11 place-items-center rounded-full transition-transform duration-500 ease-expo md:size-14 ${isOpen ? 'rotate-45 bg-brand-deep text-brand-paper' : 'bg-brand-mist'}`}
                  >
                    <svg viewBox="0 0 24 24" className="size-4 fill-none stroke-current stroke-2" strokeLinecap="round">
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                  </span>
                </span>
              </button>

              <div id={`servicio-${i}`} data-service-panel={i} hidden={!isOpen} className="pt-2 pb-8 md:pb-10">
                <div data-panel-card className="grid items-center gap-6 bg-brand-mist p-3 md:grid-cols-12 md:gap-10 md:p-4">
                  <div data-panel-img className="aspect-4/3 overflow-hidden rounded-3xl md:col-span-5">
                    <img src={item.image.src} alt={item.image.alt} width={item.image.width} height={item.image.height} loading="lazy" decoding="async" className="size-full object-cover transition-transform duration-1000 ease-expo md:hover:scale-105" />
                  </div>
                  <div className="flex flex-col items-start gap-5 px-3 pb-4 md:col-span-7 md:px-2 md:pb-0">
                    <p data-panel-text className="text-label font-semibold uppercase text-brand-deep/70">
                      {item.tag}
                    </p>
                    <p data-panel-text className="text-lead font-bold tracking-tight">
                      {item.text}
                    </p>
                    {'price' in item && (
                      <p data-panel-text className="border-t border-brand-deep/20 pt-3 text-label font-semibold text-brand-deep">
                        {item.price}
                      </p>
                    )}
                    <div data-panel-text className="mt-1">
                      <Button href={servicios.ctaHref} label={servicios.cta} variant="night" icon="whatsapp" cursor="Escribinos" />
                    </div>
                  </div>
                </div>
              </div>
            </li>
          )
        })}
      </ul>

      {/* Imagen que sigue al cursor (solo puntero fino) */}
      <div ref={cursor} aria-hidden="true" className="pointer-events-none invisible fixed top-0 left-0 z-30 hidden will-change-transform md:block">
        <div data-cursor-frame className="relative aspect-4/3 w-64 -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-3xl shadow-lift lg:w-80">
          {items.map((item) => (
            <img
              key={item.name}
              data-cursor-img
              src={item.image.src}
              alt=""
              width={item.image.width}
              height={item.image.height}
              loading="lazy"
              decoding="async"
              className="absolute inset-0 size-full object-cover"
              style={{ clipPath: 'inset(100% 0% 0% 0%)' }}
            />
          ))}
        </div>
      </div>
    </Section>
  )
}
