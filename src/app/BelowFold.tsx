import { Contacto } from '../components/sections/contacto/Contacto'
import { Footer } from '../components/sections/footer/Footer'
import { Nosotros } from '../components/sections/nosotros/Nosotros'
import { Planes } from '../components/sections/planes/Planes'
import { Proceso } from '../components/sections/proceso/Proceso'
import { Proyectos } from '../components/sections/proyectos/Proyectos'
import { Servicios } from '../components/sections/servicios/Servicios'
import { useSectionTransitions } from '../hooks/useSectionTransitions'

/**
 * Todo lo que está debajo del hero, en un chunk aparte (React.lazy): el primer render es solo
 * hero + navbar, así el preloader arranca antes. Mientras corre el preloader nadie puede scrollear,
 * así que estas secciones llegan a tiempo sin que se note.
 * Orden (7 bloques, fondos en tramos largos): inicio y servicios en claro → proyectos y cómo trabajamos en oscuro
 * → planes (con asesoría, extras, comparación y diagnóstico) en claro → nosotros y preguntas en oscuro
 * → contacto, el único momento de color.
 */
export function BelowFoldSections() {
  useSectionTransitions()

  return (
    <>
      <Servicios />
      <Proyectos />
      <Proceso />
      <Planes />
      <Nosotros />
      <Contacto />
    </>
  )
}

export function BelowFoldFooter() {
  return <Footer />
}
