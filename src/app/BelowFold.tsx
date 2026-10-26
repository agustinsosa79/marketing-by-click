import { ServiciosSection } from '../components/sections/asesoria/Asesoria'
import { DiagnosticoSection } from '../components/sections/diagnostico/Diagnostico'
import { Contacto } from '../components/sections/contacto/Contacto'
import { Faq } from '../components/sections/faq/Faq'
import { Footer } from '../components/sections/footer/Footer'
import { Nosotros } from '../components/sections/nosotros/Nosotros'
import { Planes } from '../components/sections/planes/Planes'
import { Proceso } from '../components/sections/proceso/Proceso'
import { Proyectos } from '../components/sections/proyectos/Proyectos'
import { Servicios } from '../components/sections/servicios/Servicios'
import { Testimonios } from '../components/sections/testimonios/Testimonios'

/**
 * Todo lo que está debajo del hero, en un chunk aparte (React.lazy): el primer render es solo
 * hero + navbar, así el preloader arranca antes. Mientras corre el preloader nadie puede scrollear,
 * así que estas secciones llegan a tiempo sin que se note.
 * Orden (cambios del cliente) y fondos, que alternan para que cada sección se lea como un bloque propio:
 * método (blanco) → proyectos (noche) → testimonios (azul Clic) → planes (blanco) → diagnóstico (azul Clic)
 * → servicios (blanco) → nosotros (noche) → tu primer mes (azul Clic) → preguntas (blanco) → contacto (azul Clic).
 * Recorrido: qué hacemos → prueba (casos y testimonios) → precios y cómo elegir → quiénes somos → cómo empieza → dudas → contacto.
 */
export function BelowFoldSections() {
  return (
    <>
      <Servicios />
      <Proyectos />
      <Testimonios />
      <Planes />
      <DiagnosticoSection />
      <ServiciosSection />
      <Nosotros />
      <Proceso />
      <Faq />
      <Contacto />
    </>
  )
}

export function BelowFoldFooter() {
  return <Footer />
}
