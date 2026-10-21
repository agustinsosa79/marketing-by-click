import { Contacto } from '../components/sections/contacto/Contacto'
import { Faq } from '../components/sections/faq/Faq'
import { Footer } from '../components/sections/footer/Footer'
import { Nosotros } from '../components/sections/nosotros/Nosotros'
import { Planes } from '../components/sections/planes/Planes'
import { Proceso } from '../components/sections/proceso/Proceso'
import { Proyectos } from '../components/sections/proyectos/Proyectos'
import { Servicios } from '../components/sections/servicios/Servicios'

/**
 * Todo lo que está debajo del hero, en un chunk aparte (React.lazy): el primer render es solo
 * hero + navbar, así el preloader arranca antes. Mientras corre el preloader nadie puede scrollear,
 * así que estas secciones llegan a tiempo sin que se note.
 * Orden y fondos: cada sección se distingue de la siguiente (región común, Gestalt), alternando
 * blanco · azul Clic · azul noche: inicio (blanco) → servicios (azul Clic) → proyectos (noche)
 * → cómo trabajamos (azul Clic) → planes con asesoría y extras (blanco) → nosotros (noche)
 * → preguntas (blanco) → contacto (azul Clic con burbujas).
 */
export function BelowFoldSections() {
  return (
    <>
      <Servicios />
      <Proyectos />
      <Proceso />
      <Planes />
      <Nosotros />
      <Faq />
      <Contacto />
    </>
  )
}

export function BelowFoldFooter() {
  return <Footer />
}
