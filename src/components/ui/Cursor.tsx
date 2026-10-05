import { useRef, useState } from 'react'
import { gsap, useGSAP } from '../../lib/gsap'

type Mode = 'default' | 'hover' | 'label' | 'hidden'

/**
 * Cursor propio (solo puntero fino):
 *  - punto azul señal con borde blanco: se ve sobre papel, sobre azul noche, sobre azul Clic y sobre video
 *  - sobre links y botones se convierte en un anillo
 *  - sobre [data-cursor="Texto"] aparece una burbuja azul señal con la etiqueta
 * El modo se recalcula siempre a partir del elemento bajo el puntero (también al scrollear sin mover el mouse):
 * nunca queda "pegado" en un estado.
 */
export function Cursor() {
  const dot = useRef<HTMLDivElement>(null)
  const ring = useRef<HTMLDivElement>(null)
  const bubble = useRef<HTMLDivElement>(null)
  const [label, setLabel] = useState('')

  useGSAP(
    () => {
      if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
      const root = document.documentElement
      root.classList.add('has-cursor')

      const follow = (el: HTMLElement | null, duration: number) => ({
        x: gsap.quickTo(el, 'x', { duration, ease: 'power3' }),
        y: gsap.quickTo(el, 'y', { duration, ease: 'power3' }),
      })
      const d = follow(dot.current, 0.05)
      const r = follow(ring.current, 0.32)
      const b = follow(bubble.current, 0.18)

      let mode: Mode = 'hidden'
      let text = ''
      let pressed = false
      let px = -1
      let py = -1

      const apply = (next: Mode, nextText: string, force = false) => {
        if (!force && next === mode && nextText === text) return
        mode = next
        if (nextText) setLabel(nextText)
        text = nextText
        const press = pressed ? 0.8 : 1
        gsap.to(dot.current, { autoAlpha: next === 'default' || next === 'hover' ? 1 : 0, scale: (next === 'hover' ? 0.6 : 1) * press, duration: 0.25, ease: 'power3.out', overwrite: 'auto' })
        gsap.to(ring.current, { autoAlpha: next === 'hover' ? 1 : 0, scale: next === 'hover' ? press : 0.4, duration: 0.35, ease: 'power3.out', overwrite: 'auto' })
        gsap.to(bubble.current, { scale: next === 'label' ? press : 0, duration: next === 'label' ? 0.5 : 0.25, ease: next === 'label' ? 'back.out(1.8)' : 'power3.out', overwrite: 'auto' })
      }

      // Modo según el elemento bajo el puntero
      const resolve = (target: EventTarget | null, force = false) => {
        const el = target instanceof Element ? target : null
        const nextText = el?.closest<HTMLElement>('[data-cursor]')?.dataset.cursor ?? ''
        if (nextText) return apply('label', nextText, force)
        const interactive = !!el?.closest('a, button, [role="slider"], summary, label, [data-cursor-hover]')
        apply(interactive ? 'hover' : 'default', '', force)
      }

      let placed = false
      const onMove = (e: PointerEvent) => {
        if (e.pointerType !== 'mouse') return
        px = e.clientX
        py = e.clientY
        if (!placed) {
          gsap.set([dot.current, ring.current, bubble.current], { x: px, y: py })
          placed = true
        }
        d.x(px)
        d.y(py)
        r.x(px)
        r.y(py)
        b.x(px)
        b.y(py)
        if (mode === 'hidden') resolve(e.target)
      }
      const onOver = (e: PointerEvent) => e.pointerType === 'mouse' && resolve(e.target)
      const onLeaveWindow = () => apply('hidden', '')
      const onDown = (e: PointerEvent) => {
        pressed = true
        resolve(e.target, true)
      }
      const onUp = (e: PointerEvent) => {
        pressed = false
        resolve(e.target, true)
      }
      // El contenido se mueve bajo el puntero quieto (scroll, menú): se recalcula una vez por frame
      let queued = false
      const onScroll = () => {
        if (queued || px < 0 || mode === 'hidden') return
        queued = true
        requestAnimationFrame(() => {
          queued = false
          resolve(document.elementFromPoint(px, py))
        })
      }

      window.addEventListener('pointermove', onMove, { passive: true })
      document.addEventListener('pointerover', onOver, { passive: true })
      root.addEventListener('pointerleave', onLeaveWindow)
      window.addEventListener('pointerdown', onDown, { passive: true })
      window.addEventListener('pointerup', onUp, { passive: true })
      window.addEventListener('scroll', onScroll, { passive: true })

      return () => {
        root.classList.remove('has-cursor')
        window.removeEventListener('pointermove', onMove)
        document.removeEventListener('pointerover', onOver)
        root.removeEventListener('pointerleave', onLeaveWindow)
        window.removeEventListener('pointerdown', onDown)
        window.removeEventListener('pointerup', onUp)
        window.removeEventListener('scroll', onScroll)
      }
    },
    { dependencies: [] },
  )

  return (
    <>
      <div ref={ring} aria-hidden="true" className="pointer-events-none invisible fixed top-0 left-0 z-100 hidden will-change-transform md:block">
        <div className="size-11 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-brand-signal bg-brand-signal/15 ring-1 ring-white/70" />
      </div>
      <div ref={dot} aria-hidden="true" className="pointer-events-none invisible fixed top-0 left-0 z-100 hidden will-change-transform md:block">
        <div className="size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-signal ring-2 ring-white" />
      </div>
      <div ref={bubble} aria-hidden="true" className="pointer-events-none fixed top-0 left-0 z-100 hidden scale-0 will-change-transform md:block">
        <div className="grid size-22 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-brand-signal text-sm font-bold text-white ring-2 ring-white">
          {label}
        </div>
      </div>
    </>
  )
}
