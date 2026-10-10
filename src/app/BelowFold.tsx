import { Asesoria } from '../components/sections/asesoria/Asesoria'
import { Contacto } from '../components/sections/contacto/Contacto'
import { Diagnostico } from '../components/sections/diagnostico/Diagnostico'
import { Faq } from '../components/sections/faq/Faq'
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
 * Orden: primero qué hacemos y la prueba, después cómo, cuánto y quiénes.
 * La asesoría 1:1 va justo después de los planes: es la alternativa para quien no quiere un plan mensual.
 */
export function BelowFoldSections() {
  useSectionTransitions()

  return (
    <>
      <Servicios />
      <Proyectos />
      <Proceso />
      <Diagnostico />
      <Planes />
      <Asesoria />
      <Faq />
      <Nosotros />
      <Contacto />
    </>
  )
}

export function BelowFoldFooter() {
  return <Footer />
}
