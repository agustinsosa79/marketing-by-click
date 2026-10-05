import { blog } from '../../data/content'
import { useGSAP } from '../../lib/gsap'
import { setupReveals } from '../../lib/motion'
import { deferSetup } from '../../lib/schedule'
import { useRef } from 'react'
import { Button } from '../ui/Button'
import { Section } from '../ui/Section'
import { Title } from '../ui/Title'

/** Cierre de las páginas del blog: de la lectura a la videollamada gratuita. */
export function BlogCta() {
  const ref = useRef<HTMLElement>(null)
  useGSAP((_, contextSafe) => deferSetup(contextSafe!(() => setupReveals(ref.current!))), { scope: ref })

  return (
    <Section ref={ref} bg="deep" className="px-5 py-20 md:px-10 md:py-28">
      <div className="grid grid-cols-1 items-end gap-8 lg:grid-cols-12">
        <Title title={blog.cta.title} tone="deep" className="lg:col-span-7" />
        <div className="flex flex-col items-start gap-6 lg:col-span-5">
          <p data-reveal="rise" className="text-lead font-medium text-brand-haze">
            {blog.cta.text}
          </p>
          <div data-reveal="cta" className="w-full sm:w-auto">
            <Button href={blog.cta.button.href} label={blog.cta.button.label} variant="white" icon="whatsapp" size="lg" cursor="Escribinos" className="w-full sm:w-auto" />
          </div>
        </div>
      </div>
    </Section>
  )
}
