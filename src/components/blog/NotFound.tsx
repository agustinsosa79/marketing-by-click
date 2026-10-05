import { blog } from '../../data/content'
import { usePageIntro } from '../../hooks/usePageIntro'
import { splitHeadline } from '../../lib/headline'
import { Footer } from '../sections/footer/Footer'
import { Button } from '../ui/Button'

/** 404: mismo lenguaje que el resto, con salida al inicio o al blog. */
export function NotFound() {
  usePageIntro()
  const [before, em, after] = splitHeadline(blog.notFound.title)

  return (
    <>
      <main id="contenido" className="relative isolate z-10 flex min-h-svh flex-col justify-center bg-brand-paper px-5 pt-32 pb-20 md:px-10">
        <p className="animate-intro font-wordmark text-wordmark text-brand-deep/10 md:text-wordmark-wide">404</p>
        <h1 className="intro-delay-1 mt-4 animate-intro font-display text-title text-brand-deep lg:w-2/3">
          {before}
          <span className="text-brand-signal">{em}</span>
          {after}
        </h1>
        <p className="intro-delay-2 mt-5 animate-intro text-lead font-medium text-brand-night/75">{blog.notFound.text}</p>
        <div className="intro-delay-3 mt-8 flex animate-intro flex-wrap gap-3">
          <Button href="/" label={blog.notFound.home} variant="signal" />
          <Button href="/blog" label={blog.notFound.blog} variant="white" />
        </div>
      </main>
      <Footer />
    </>
  )
}
