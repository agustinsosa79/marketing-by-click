import { Casos } from '../components/sections/casos/Casos'
import { CtaFinal } from '../components/sections/cta/CtaFinal'
import { Footer } from '../components/sections/footer/Footer'
import { Founder } from '../components/sections/founder/Founder'
import { Historia } from '../components/sections/historia/Historia'
import { Manifiesto } from '../components/sections/manifiesto/Manifiesto'
import { Planes } from '../components/sections/planes/Planes'
import { Proceso } from '../components/sections/proceso/Proceso'
import { Servicios } from '../components/sections/servicios/Servicios'
import { usePageColors } from '../hooks/usePageColors'

/**
 * Todo lo que está debajo del hero, en un chunk aparte (React.lazy): el primer render es solo
 * hero + navbar, así el preloader arranca antes. Mientras corre el preloader nadie puede scrollear,
 * así que estas secciones llegan a tiempo sin que se note.
 */
export function BelowFoldSections() {
  usePageColors()

  return (
    <>
      <Manifiesto />
      <Founder />
      <Historia />
      <Servicios />
      <Proceso />
      <Planes />
      <Casos />
      <CtaFinal />
    </>
  )
}

export function BelowFoldFooter() {
  return <Footer />
}
