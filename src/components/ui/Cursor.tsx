import { useRef, useState } from 'react'
import { gsap, useGSAP } from '../../lib/gsap'

type Mode = 'default' | 'hover' | 'label' | 'hidden'

/**
 * Cursor propio (solo puntero fino):
 *  - punto oscuro difuminado
 *  - sobre links y botones se agranda
 *  - sobre [data-cursor="Texto"] el punto se esconde y aparece una burbuja brand-sky con la etiqueta
 * El modo se recalcula siempre a partir del elemento bajo el puntero: nunca queda "pegado" en un estado.
 */
export function Cursor() {
  const dot = useRef<HTMLDivElement>(null)
  const bubble = useRef<HTMLDivElement>(null)
  const [label, setLabel] = useState('')
  useGSAP(
    () => {
      if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
      const root = document.documentElement
      root.classList.add('has-cursor')

      const dx = gsap.quickTo(dot.current, 'x', { duration: 0.06, ease: 'power3' })
      const dy = gsap.quickTo(dot.current, 'y', { duration: 0.06, ease: 'power3' })
      const bx = gsap.quickTo(bubble.current, 'x', { duration: 0.12, ease: 'power3' })
      const by = gsap.quickTo(bubble.current, 'y', { duration: 0.12, ease: 'power3' })

      let mode: Mode = 'hidden'
      let text = ''
      let pressed = false

      const apply = (next: Mode, nextText: string, force = false) => {
        if (!force && next === mode && nextText === text) return
        mode = next
        if (nextText) setLabel(nextText)
        text = nextText
        const visible = next === 'default' ? 1 : next === 'hover' ? 0.45 : 0
        const scale = next === 'hover' ? (pressed ? 1.9 : 2.2) : pressed ? 0.72 : 1
        gsap.to(dot.current, { autoAlpha: visible, scale, duration: 0.18, ease: 'power3.out', overwrite: 'auto' })
        gsap.to(bubble.current, { scale: next === 'label' ? 1 : 0, duration: 0.18, ease: next === 'label' ? 'reveal' : 'power3.out', overwrite: 'auto' })
      }

      // Modo según el elemento bajo el puntero
      const resolve = (target: EventTarget | null, force = false) => {
        const el = target instanceof Element ? target : null
        const labelled = el?.closest<HTMLElement>('[data-cursor]')
        const nextText = labelled?.dataset.cursor ?? ''
        if (nextText) return apply('label', nextText, force)
        const interactive = !!el?.closest('a, button, [role="slider"], summary, label')
        apply(interactive ? 'hover' : 'default', '', force)
      }

      let placed = false
      const onMove = (e: PointerEvent) => {
        if (e.pointerType !== 'mouse') return
        if (!placed) {
          gsap.set([dot.current, bubble.current], { x: e.clientX, y: e.clientY })
          placed = true
        }
        dx(e.clientX)
        dy(e.clientY)
        bx(e.clientX)
        by(e.clientY)
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

      window.addEventListener('pointermove', onMove, { passive: true })
      document.addEventListener('pointerover', onOver, { passive: true })
      document.documentElement.addEventListener('pointerleave', onLeaveWindow)
      window.addEventListener('pointerdown', onDown, { passive: true })
      window.addEventListener('pointerup', onUp, { passive: true })

      return () => {
        root.classList.remove('has-cursor')
        window.removeEventListener('pointermove', onMove)
        document.removeEventListener('pointerover', onOver)
        document.documentElement.removeEventListener('pointerleave', onLeaveWindow)
        window.removeEventListener('pointerdown', onDown)
        window.removeEventListener('pointerup', onUp)
      }
    },
    { dependencies: [] },
  )

  return (
    <>
      <div ref={dot} aria-hidden="true" className="pointer-events-none invisible fixed top-0 left-0 z-100 hidden will-change-transform md:block">
        <div className="size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-night/75 blur-cursor" />
      </div>
      <div ref={bubble} aria-hidden="true" className="pointer-events-none fixed top-0 left-0 z-100 hidden scale-0 will-change-transform md:block">
        <div className="grid size-22 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-brand-sky text-sm font-semibold text-brand-night">{label}</div>
      </div>
    </>
  )
}
