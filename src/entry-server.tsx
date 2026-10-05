import { StrictMode } from 'react'
import { renderToString } from 'react-dom/server'
import { App } from './app/App'
import { normalizePath, resolveRoute } from './app/routes'
import { blog, brand, contact, faq, seo, servicePage, servicios } from './data/content'
import { findPost, posts, postUrl, type Post } from './lib/blog'
import { SITE_URL } from './lib/site'

/**
 * Prerender en el build (scripts/prerender.mjs): cada ruta sale como HTML estático con su <head> propio
 * (title, description, canonical, Open Graph y datos estructurados). Inicio: preloader + navbar + hero
 * (las secciones de abajo son lazy). Blog y notas: la página completa.
 */

// En el servidor las notas se leen completas (en el cliente, cada una es un chunk aparte)
const fullPosts = import.meta.glob<Post>('/content/blog/[!_]*.md', { eager: true })
const getPost = (slug: string) => Object.entries(fullPosts).find(([path]) => path.endsWith(`/${slug}.md`))?.[1] ?? null

/** Rutas a generar: inicio, blog, cada nota publicada y la 404. */
export function routes() {
  return ['/', ...servicios.items.map((s) => serviceUrl(s.slug)), '/blog', ...posts.map((p) => postUrl(p.slug)), '/404']
}

export function render(url: string) {
  const path = normalizePath(url)
  const route = resolveRoute(path)
  const post = route.name === 'post' && findPost(route.slug) ? getPost(route.slug) : null
  return renderToString(
    <StrictMode>
      <App route={route} post={post} />
    </StrictMode>,
  )
}

interface Head {
  title: string
  description: string
  canonical: string
  image: string
  type: 'website' | 'article'
  jsonLd: object[]
  noindex?: boolean
}

const serviceUrl = (slug: string) => `/servicios/${slug}`

const abs = (path: string) => (path.startsWith('http') ? path : `${SITE_URL}${path}`)

const breadcrumbs = (items: { name: string; url: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, i) => ({ '@type': 'ListItem', position: i + 1, name: item.name, item: abs(item.url) })),
})

const publisher = { '@type': 'Organization', name: brand.name, logo: { '@type': 'ImageObject', url: abs('/media/logo.webp') } }

export function head(url: string): Head {
  const path = normalizePath(url)
  const route = resolveRoute(path)

  if (route.name === 'blog') {
    return {
      title: blog.seo.title,
      description: blog.seo.description,
      canonical: abs('/blog'),
      image: abs(posts[0]?.cover ?? '/media/founder-ian.webp'),
      type: 'website',
      jsonLd: [
        {
          '@context': 'https://schema.org',
          '@type': 'Blog',
          name: blog.seo.title,
          description: blog.seo.description,
          url: abs('/blog'),
          publisher,
          blogPost: posts.map((p) => ({ '@type': 'BlogPosting', headline: p.title, url: abs(postUrl(p.slug)), datePublished: p.date })),
        },
        breadcrumbs([
          { name: blog.breadcrumbHome, url: '/' },
          { name: blog.eyebrow, url: '/blog' },
        ]),
      ],
    }
  }

  if (route.name === 'post') {
    const meta = findPost(route.slug)
    if (meta) {
      const url = abs(postUrl(meta.slug))
      return {
        title: `${meta.title} | Blog de ${brand.name}`,
        description: meta.description,
        canonical: url,
        image: abs(meta.cover),
        type: 'article',
        jsonLd: [
          {
            '@context': 'https://schema.org',
            '@type': 'BlogPosting',
            headline: meta.title,
            description: meta.description,
            image: abs(meta.cover),
            datePublished: meta.date,
            dateModified: meta.updated ?? meta.date,
            articleSection: meta.category,
            wordCount: meta.readingMinutes * 200,
            author: { '@type': 'Person', name: meta.author, url: blog.author.instagram.href },
            publisher,
            mainEntityOfPage: { '@type': 'WebPage', '@id': url },
          },
          breadcrumbs([
            { name: blog.breadcrumbHome, url: '/' },
            { name: blog.eyebrow, url: '/blog' },
            { name: meta.title, url: postUrl(meta.slug) },
          ]),
        ],
      }
    }
  }

  if (route.name === 'service') {
    const service = servicios.items.find((s) => s.slug === route.slug)
    if (service) {
      const url = abs(serviceUrl(service.slug))
      return {
        title: service.seo.title,
        description: service.seo.description,
        canonical: url,
        image: abs('/media/founder-ian.webp'),
        type: 'website',
        jsonLd: [
          {
            '@context': 'https://schema.org',
            '@type': 'Service',
            name: service.name,
            serviceType: service.name,
            description: service.text,
            url,
            provider: { '@type': 'ProfessionalService', name: brand.name, url: abs('/'), telephone: contact.whatsapp.href.replace('https://wa.me/', '+') },
            areaServed: { '@type': 'Place', name: 'Patagonia, Argentina' },
          },
          breadcrumbs([
            { name: blog.breadcrumbHome, url: '/' },
            { name: servicePage.breadcrumb, url: '/#servicios' },
            { name: service.name, url: serviceUrl(service.slug) },
          ]),
        ],
      }
    }
  }

  if (route.name === 'home') {
    return {
      title: seo.title,
      description: seo.description,
      canonical: abs('/'),
      image: abs('/media/founder-ian.webp'),
      type: 'website',
      jsonLd: [
        {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: faq.items.map((item) => ({ '@type': 'Question', name: item.q, acceptedAnswer: { '@type': 'Answer', text: item.a } })),
        },
      ],
    }
  }

  return {
    title: `${blog.notFound.title.text} | ${brand.name}`,
    description: blog.notFound.text,
    canonical: abs('/404'),
    image: abs('/media/founder-ian.webp'),
    type: 'website',
    jsonLd: [],
    noindex: true,
  }
}

/** sitemap.xml y feed RSS (los genera el prerender con las notas publicadas). */
export function feeds() {
  const urls = [
    { loc: abs('/'), lastmod: posts[0]?.date },
    ...servicios.items.map((s) => ({ loc: abs(serviceUrl(s.slug)), lastmod: undefined })),
    { loc: abs('/blog'), lastmod: posts[0]?.date },
    ...posts.map((p) => ({ loc: abs(postUrl(p.slug)), lastmod: p.updated ?? p.date })),
  ]
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${u.loc}</loc>${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}</url>`).join('\n')}
</urlset>
`
  const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${esc(blog.seo.title)}</title>
    <link>${abs('/blog')}</link>
    <description>${esc(blog.seo.description)}</description>
    <language>es-AR</language>
    <atom:link href="${abs('/blog/rss.xml')}" rel="self" type="application/rss+xml" />
${posts
  .map(
    (p) => `    <item>
      <title>${esc(p.title)}</title>
      <link>${abs(postUrl(p.slug))}</link>
      <guid>${abs(postUrl(p.slug))}</guid>
      <pubDate>${new Date(`${p.date}T12:00:00Z`).toUTCString()}</pubDate>
      <category>${esc(p.category)}</category>
      <description>${esc(p.description)}</description>
    </item>`,
  )
  .join('\n')}
  </channel>
</rss>
`
  return { sitemap, rss }
}
