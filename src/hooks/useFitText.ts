import { useEffect, type RefObject } from 'react'
import { fontsReady } from '../lib/fonts'

/** Ancho de contenido del padre (clientWidth incluye el padding). */
function contentWidth(el: HTMLElement) {
  const parent = el.parentElement
  if (!parent) return window.innerWidth
  const s = getComputedStyle(parent)
  return parent.clientWidth - parseFloat(s.paddingLeft) - parseFloat(s.paddingRight)
}

/**
 * Ajusta el font-size de `el` para que su línea más ancha ocupe `ratio` del ancho disponible.
 * Las líneas se marcan con [data-fit-line]; si no hay, se mide el elemento entero.
 */
export function fitText(el: HTMLElement, ratio: number, available = contentWidth(el)) {
  el.style.fontSize = '100px'
  const lines = el.querySelectorAll<HTMLElement>('[data-fit-line]')
  const targets = lines.length ? [...lines] : [el]
  const widest = Math.max(...targets.map((t) => t.scrollWidth))
  if (widest > 0) el.style.fontSize = `${(100 * available * ratio) / widest}px`
}

export function useFitText(ref: RefObject<HTMLElement | null>, ratio = 1) {
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const run = () => fitText(el, ratio)
    run()
    fontsReady().then(run)
    const ro = new ResizeObserver(run)
    if (el.parentElement) ro.observe(el.parentElement)
    return () => ro.disconnect()
  }, [ref, ratio])
}
