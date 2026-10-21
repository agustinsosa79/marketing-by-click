import { useEffect, useState } from 'react'
import { mobileCta, sections } from '../../data/content'
import { Icon } from './Icon'

/**
 * Barra fija de WhatsApp en el celular y la tablet (en desktop la navbar ya tiene "Hablemos" siempre a mano).
 * Aparece después de la primera pantalla y se va cuando ya hay otra forma de escribir a la vista
 * (la sección Contacto o el footer), con el menú abierto o con una ventana abierta. Solo transform/opacity.
 */
export function MobileCta({ hidden }: { hidden: boolean }) {
  const [past, setPast] = useState(false)
  const [end, setEnd] = useState(false)
  const [modal, setModal] = useState(false)

  useEffect(() => {
    // solo avisa a React cuando cruza el umbral (no en cada evento de scroll)
    let was: boolean | null = null
    const onScroll = () => {
      const now = window.scrollY > window.innerHeight * 0.75
      if (now !== was) setPast((was = now))
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })

    // Contacto y el footer montan tarde (chunk aparte): se observan cuando aparecen
    const visible = new Set<Element>()
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) visible.add(e.target)
        else visible.delete(e.target)
      }
      setEnd(visible.size > 0)
    })
    const watched = new Set<Element>()
    const watch = () => {
      for (const el of [document.getElementById(sections.contacto), document.querySelector('footer')]) {
        if (el && !watched.has(el)) {
          watched.add(el)
          io.observe(el)
        }
      }
    }
    watch()
    // también se va mientras haya una ventana abierta (comparar planes, diagnóstico)
    const mo = new MutationObserver(() => {
      watch()
      setModal(!!document.querySelector('dialog[open]'))
    })
    mo.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['open'] })

    return () => {
      window.removeEventListener('scroll', onScroll)
      io.disconnect()
      mo.disconnect()
    }
  }, [])

  const show = past && !end && !hidden && !modal

  return (
    <div
      inert={!show}
      className={`fixed inset-x-0 bottom-0 z-40 px-3 pt-3 transition duration-500 ease-expo lg:hidden ${show ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-full opacity-0'}`}
      style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
    >
      <a
        href={mobileCta.href}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-between gap-3 rounded-full bg-brand-signal py-2 pr-2 pl-5 text-brand-ink shadow-lift ring-1 ring-brand-ink/10 active:scale-98"
      >
        <span className="flex flex-col leading-tight">
          <span className="font-bold">{mobileCta.label}</span>
          <span className="text-sm">{mobileCta.hint}</span>
        </span>
        <span className="grid size-11 shrink-0 place-items-center rounded-full bg-brand-ink text-white">
          <Icon name="whatsapp" className="size-5" />
        </span>
      </a>
    </div>
  )
}
