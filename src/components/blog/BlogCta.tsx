import { blog, type Headline } from '../../data/content'
import { useGSAP } from '../../lib/gsap'
import { setupReveals } from '../../lib/motion'
import { deferSetup } from '../../lib/schedule'
import { useRef } from 'react'
import { Button } from '../ui/Button'
import { Section } from '../ui/Section'
import { Title } from '../ui/Title'

interface Cta {
  title: Headline
  text: string
  button: { label: string; href: string }
}

/** Cierre de las páginas internas (blog, proyectos): de la lectura a la videollamada gratuita. */
export function BlogCta({ cta = blog.cta }: { cta?: Cta }) {
  const ref = useRef<HTMLElement>(null)
  useGSAP((_, contextSafe) => deferSetup(contextSafe!(() => setupReveals(ref.current!))), { scope: ref })

  return (
    <Section ref={ref} bg="deep" className="px-5 py-20 md:px-10 md:py-28">
      <div className="grid grid-cols-1 items-end gap-8 lg:grid-cols-12">
        <Title title={cta.title} tone="deep" className="lg:col-span-7" />
        <div className="flex flex-col items-start gap-6 lg:col-span-5">
          <p data-reveal="rise" className="text-lead font-medium text-brand-haze">
            {cta.text}
          </p>
          <div data-reveal="cta" className="w-full sm:w-auto">
            <Button href={cta.button.href} label={cta.button.label} variant="white" icon="whatsapp" size="lg" cursor="Escribinos" className="w-full sm:w-auto" />
          </div>
        </div>
      </div>
    </Section>
  )
}
