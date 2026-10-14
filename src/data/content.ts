/**
 * Todo el copy del sitio (paso 1 aprobado: 7 secciones, ≈450 palabras).
 * Fuente: textos reales de marketingbyclic.com (reference/content.json) y la bio de Instagram de la agencia.
 * - Redacción nueva sobre datos reales marcada con `// TODO copy` para revisión del cliente.
 * - Sin cursivas: el énfasis va con color (`emphasis` en los títulos).
 * - Lo que el cliente edita desde el panel vive aparte, en content/: precios (precios.json),
 *   preguntas frecuentes (faq.json), proyectos (proyectos/*.json) y notas del blog (blog/*.md).
 */

import faqData from '../../content/faq.json'
import preciosData from '../../content/precios.json'
import textosData from '../../content/textos.json'
import { resolveList, resolveText, TOKENS } from '../../panel/shared/texts'

export interface Link {
  label: string
  href: string
}

export interface ImageAsset {
  src: string
  alt: string
  width: number
  height: number
}

/** Título con una parte destacada en azul señal. */
export interface Headline {
  text: string
  emphasis: string
}

const WHATSAPP = 'https://wa.me/5492944126756'
const WHATSAPP_MESSAGE = 'https://wa.me/message/2SGQE2CNFXEDF1'
/** WhatsApp con un mensaje ya escrito. */
const whatsappWith = (text: string) => `${WHATSAPP}?text=${encodeURIComponent(text)}`

/** Precios editables desde el panel (content/precios.json). Si falta alguno, queda el valor original. */
const prices = {
  currency: preciosData.currency || 'USD',
  plans: { inicial: preciosData.plans?.inicial || '115', plus: preciosData.plans?.plus || '135', premium: preciosData.plans?.premium || '155' },
  asesoria: { price: preciosData.asesoria?.price ?? '', detail: preciosData.asesoria?.detail ?? '' },
  sesion: { price: preciosData.sesion?.price || '100', detail: preciosData.sesion?.detail ?? '' },
}
const minPlanPrice = Math.min(...Object.values(prices.plans).map(Number).filter(Number.isFinite))
/** "2 horas · 100 USD" */
const sesionPrice = [prices.sesion.detail, `${prices.sesion.price} ${prices.currency}`].filter(Boolean).join(' · ')

/**
 * Textos editables desde el panel (content/textos.json; reglas y originales en panel/shared/texts.ts).
 * Si un texto no se cambió o no es válido, queda el original.
 */
const withTokens = (s: string) => s.split(TOKENS.precioSesion).join(sesionPrice)
const txt = (key: string) => withTokens(resolveText(textosData.values, key))
const list = (key: string) => resolveList(textosData.values, key).map(withTokens)

export const contact = {
  whatsapp: { label: '+54 9 2944 12-6756', href: WHATSAPP },
  whatsappMessage: WHATSAPP_MESSAGE,
  instagram: { label: '@marketingbyclic', href: 'https://www.instagram.com/marketingbyclic/' },
  founderInstagram: { label: '@ianmarketer', href: 'https://www.instagram.com/ianmarketer' },
} as const

export const brand = {
  name: 'Marketing by Clic',
  wordmark: ['MARKETING', 'BY CLIC'],
}

/** Title y description de index.html (se mantienen iguales a mano: el HTML se sirve antes que el JS). */
export const seo = {
  title: 'Agencia de marketing digital y redes sociales | Marketing by Clic',
  description: 'Agencia de marketing digital: estrategia, contenido para redes sociales y anuncios en Instagram y Facebook para que tu marca venda más. Escribinos por WhatsApp.',
}

export const preloader = {
  // Aparece dentro del círculo azul que abre el clic (texto real de la marca)
  caption: { text: 'Estrategias online que generan resultados.', emphasis: 'resultados.' } satisfies Headline,
}

export const sections = {
  hero: 'inicio',
  nosotros: 'nosotros',
  servicios: 'servicios',
  proceso: 'proceso',
  planes: 'planes',
  asesoria: 'asesoria',
  proyectos: 'proyectos',
  diagnostico: 'diagnostico',
  faq: 'preguntas',
  contacto: 'contacto',
} as const

export const nav = {
  openAria: 'Abrir menú',
  closeAria: 'Cerrar menú',
  closeLabel: 'Cerrar',
  menuAria: 'Menú principal',
  skipLink: 'Saltar al contenido',
  homeLabel: 'Marketing by Clic, volver al inicio',
  items: [
    { label: 'Servicios', id: sections.servicios },
    { label: 'Proyectos', id: sections.proyectos },
    { label: 'Cómo trabajamos', id: sections.proceso },
    { label: 'Planes', id: sections.planes },
    { label: 'Asesoría 1:1', id: sections.asesoria },
    { label: 'Preguntas', id: sections.faq },
    { label: 'Nosotros', id: sections.nosotros },
    { label: 'Contacto', id: sections.contacto },
    { label: 'Blog', id: 'blog', href: '/blog' },
  ] as { label: string; id: string; href?: string }[],
  // Links de la barra fija (el botón principal es "Hablemos" por WhatsApp). En el celular la asesoría va corta.
  plansLabel: 'Planes',
  asesoriaLabel: 'Asesoría 1:1',
  asesoriaShort: 'Asesoría',
  ctaLabel: 'Hablemos',
  ctaCursor: 'Escribinos',
  contactTitle: 'Escribinos', // TODO copy
  socials: [
    { label: 'Instagram', href: contact.instagram.href },
    { label: contact.founderInstagram.label, href: contact.founderInstagram.href },
  ] satisfies Link[],
}

export const hero = {
  // A quién le habla (texto real del sitio anterior: "acompañamos a marcas, profesionales y emprendimientos").
  // Sin ubicación: trabajan con marcas de distintos lugares.
  kicker: 'Marketing para marcas, profesionales y emprendimientos', // TODO copy
  // H1: lo que se busca en Google ("agencia de marketing digital", "agencia de redes sociales").
  title: { text: 'Agencia de marketing digital y redes sociales.', emphasis: 'redes sociales.' } satisfies Headline,
  // La promesa real de la marca ("convertir tus redes en un sistema de ventas") pasa a la bajada, con las palabras que usa la gente
  subtitle: 'Convertimos tus redes en un sistema de ventas con estrategia, contenido y anuncios en Instagram y Facebook.', // TODO copy
  cta: { label: 'Hablemos por WhatsApp', href: WHATSAPP },
  ianTeaser: { label: 'Conocé a Ian', hint: 'Video con sonido · 0:25' },
  // Foto real de Ian en un lago de la Patagonia (nítida, sin overlay)
  image: {
    src: '/media/founder-ian.webp',
    srcSet: '/media/founder-ian-sm.webp 600w, /media/founder-ian.webp 1200w',
    alt: 'Ian, fundador de Marketing by Clic, frente a un lago de la Patagonia',
    width: 1200,
    height: 1600,
  },
  founderTag: 'Ian · Fundador', // TODO copy
}

export const nosotros = {
  eyebrow: 'Nosotros',
  cta: { label: txt('nosotros.cta'), href: WHATSAPP },
  // Bio de Instagram: "Construimos marcas que venden más."
  title: { text: 'Construimos marcas que venden más.', emphasis: 'venden más.' } satisfies Headline,
  points: list('nosotros.points'),
  quote: txt('nosotros.quote'),
  instagram: { ...contact.founderInstagram, text: txt('nosotros.instagram') },
  video: { src: '/media/video-hero-ian.mp4', poster: '/media/ian-video-poster.webp', label: 'Ian presenta Marketing by Clic' },
  player: {
    play: 'Mirá el video',
    resume: 'Seguir viendo',
    hint: 'Con sonido',
    replay: 'Volver a ver',
    cursorPlay: 'Play',
    cursorPause: 'Pausa',
    pauseAria: 'Pausar video',
    playAria: 'Reproducir video con sonido',
    muteAria: 'Silenciar',
    unmuteAria: 'Activar sonido',
    seekAria: 'Posición del video',
  },
}

export interface Service {
  slug: string
  name: string
  text: string
  icon: 'strategy' | 'content' | 'ads' | 'branding'
  image: ImageAsset
  /** Categoría del blog con notas relacionadas. */
  blogCategory: string
  /** Lo que incluye, armado con los planes, el cronograma y el caso reales. */
  includes: string[]
  seo: { title: string; description: string }
}

export const servicios = {
  eyebrow: 'Servicios',
  title: { text: 'Todo lo que tu marca necesita para vender en redes.', emphasis: 'vender en redes.' } satisfies Headline, // TODO copy
  cursor: 'Consultar',
  ctaHref: WHATSAPP_MESSAGE,
  items: [
    {
      slug: 'estrategia',
      name: 'Estrategia',
      text: 'Entendemos tu negocio y armamos un plan de acción 100% a medida.',
      icon: 'strategy',
      blogCategory: 'Estrategia',
      includes: list('servicios.estrategia.includes'),
      seo: {
        title: 'Estrategia de marketing digital para tu marca | Marketing by Clic',
        description: 'Entendemos tu negocio y armamos un plan de acción 100% a medida para tus redes. Diagnóstico, propuesta y planificación. Escribinos por WhatsApp.',
      },
      image: { src: '/media/servicio-estrategia-duo.webp', alt: 'Escritorio con gráficos y una laptop', width: 720, height: 404 },
    },
    {
      slug: 'contenido',
      name: 'Contenido',
      text: 'Contenido que conecta con tu audiencia y mejora tu visibilidad.',
      icon: 'content',
      blogCategory: 'Contenido',
      includes: list('servicios.contenido.includes'),
      seo: {
        title: 'Contenido para redes sociales | Marketing by Clic',
        description: `Posteos, historias y reels que conectan con tu audiencia y mejoran tu visibilidad. Planes mensuales desde ${minPlanPrice} ${prices.currency}. Escribinos por WhatsApp.`,
      },
      image: { src: '/media/servicio-contenido-duo.webp', alt: 'Manos escribiendo en un celular', width: 720, height: 404 },
    },
    {
      slug: 'meta-ads',
      name: 'Meta Ads',
      text: 'Anuncios estratégicos en Instagram y Facebook para que vendas de verdad.',
      icon: 'ads',
      blogCategory: 'Meta Ads',
      includes: list('servicios.meta-ads.includes'),
      seo: {
        title: 'Meta Ads: anuncios en Instagram y Facebook | Marketing by Clic',
        description: 'Campañas de Meta Ads en Instagram y Facebook para que tus redes vendan de verdad. Incluidas en los planes Plus y Premium. Escribinos por WhatsApp.',
      },
      image: { src: '/media/servicio-meta-ads-duo.webp', alt: 'Celular y laptop con métricas en pantalla', width: 720, height: 404 },
    },
    {
      slug: 'branding',
      name: 'Branding',
      text: 'Tu marca necesita más que un logo: necesita una identidad.',
      icon: 'branding',
      blogCategory: 'Branding',
      includes: list('servicios.branding.includes'),
      seo: {
        title: 'Branding e identidad de marca | Marketing by Clic',
        description: 'Tu marca necesita más que un logo: necesita una identidad. Logo, versión reducida, aplicaciones y manual de marca. Escribinos por WhatsApp.',
      },
      image: { src: '/media/duende-mockup-duo.webp', alt: 'Remeras con la identidad del Hostel El Duende Errante', width: 720, height: 720 },
    },
  ] satisfies Service[],
  includesLabel: 'Qué incluye',
  // etiquetas dentro de las mini animaciones de cada servicio
  demo: { reels: 'Reels', ads: 'Meta Ads' },
  more: 'Ver el servicio',
  cta: txt('servicios.cta'),
  listAria: 'Elegí un servicio',
  extrasLabel: 'También',
  // todos llevan a la sección de la asesoría, donde están los servicios fuera de los planes
  extras: [
    { name: 'Asesoría 1:1', text: 'Ordenamos ideas y definimos tu próximo paso.', id: sections.asesoria },
    { name: 'Sitio web', text: 'Tu web o tu tienda online.', id: sections.asesoria },
    { name: 'Sesión de fotos y videos', text: `Contenido para tus redes · ${sesionPrice}`, id: sections.asesoria },
  ] as { name: string; text: string; id?: string }[],
}

export const proceso = {
  eyebrow: 'Cómo trabajamos',
  cta: { label: txt('proceso.cta'), href: WHATSAPP_MESSAGE },
  title: { text: 'Tu primer mes, en tres etapas.', emphasis: 'tres etapas.' } satisfies Headline, // TODO copy
  // Agrupa los 7 pasos reales del cronograma; la cuarta etapa es lo que se repite cada mes
  stages: [
    {
      name: 'Diagnóstico',
      when: 'Semanas 1 y 2',
      text: txt('proceso.diagnostico.text'),
      steps: list('proceso.diagnostico.steps'),
    },
    {
      name: 'Estrategia',
      when: 'Semanas 1 y 2',
      text: txt('proceso.estrategia.text'),
      steps: list('proceso.estrategia.steps'),
    },
    {
      name: 'Ejecución',
      when: 'Semanas 3 y 4',
      text: txt('proceso.ejecucion.text'),
      steps: list('proceso.ejecucion.steps'),
    },
    {
      name: 'Cada mes',
      when: 'Desde el mes 2',
      text: txt('proceso.mensual.text'),
      steps: list('proceso.mensual.steps'),
      loop: true,
    },
  ],
}

/** Color de cada tarjeta: los tres planes se distinguen de un vistazo, el destacado es el más vivo. */
export type PlanTone = 'light' | 'signal' | 'night'

export interface Plan {
  id: keyof typeof prices.plans
  name: string
  tone: PlanTone
  featured?: boolean
  price: string
  for: string
  /** Lo que diferencia al plan del resto: va destacado arriba de la lista */
  highlight?: { title: string; text: string }
  features: string[]
}

export const planes = {
  eyebrow: 'Planes',
  title: { text: 'Hagamos crecer tus redes.', emphasis: 'crecer' } satisfies Headline,
  currency: prices.currency,
  period: 'por mes',
  badge: txt('planes.badge'),
  cta: txt('planes.cta'),
  ctaHref: WHATSAPP_MESSAGE,
  plans: [
    {
      id: 'inicial',
      name: 'Inicial',
      tone: 'light',
      price: prices.plans.inicial,
      for: txt('planes.inicial.for'),
      features: list('planes.inicial.features'),
    },
    {
      id: 'plus',
      name: 'Plus',
      tone: 'signal',
      featured: true,
      price: prices.plans.plus,
      for: txt('planes.plus.for'),
      features: list('planes.plus.features'),
    },
    {
      id: 'premium',
      name: 'Premium',
      tone: 'night',
      price: prices.plans.premium,
      for: txt('planes.premium.for'),
      // La llamada 1:1 es la gran diferencia del Premium (texto real del sitio anterior: "Llamadas 1:1 semanales")
      highlight: { title: txt('planes.premium.highlight'), text: txt('planes.premium.highlightNote') },
      features: list('planes.premium.features'),
    },
  ] satisfies Plan[],
  note: txt('planes.note'),
  // lleva a la sección de abajo (asesoría + servicios fuera de los planes)
  extra: { text: txt('planes.extra.text'), link: txt('planes.extra.link'), id: sections.asesoria },
}

/**
 * Asesoría 1:1: la alternativa para quien todavía no quiere un plan mensual. Va después de Planes
 * y con menos peso visual (no compite con la oferta principal). Textos del sitio anterior:
 * "Recibí una asesoría 1:1 100% personalizada" · "te ayudamos a ordenar ideas, detectar oportunidades
 * y definir un camino claro para crecer con intención".
 */
export const asesoria = {
  eyebrow: 'Asesoría 1:1',
  kicker: txt('asesoria.kicker'),
  title: { text: 'Una asesoría 1:1, 100% personalizada.', emphasis: '100% personalizada.' } satisfies Headline,
  text: txt('asesoria.text'),
  points: list('asesoria.points'),
  price: prices.asesoria.price ? { value: prices.asesoria.price, currency: prices.currency, detail: prices.asesoria.detail } : null,
  cta: { label: txt('asesoria.cta'), href: whatsappWith(txt('asesoria.message')) },
  // Foto real del sitio anterior: Ian en una videollamada
  image: { src: '/media/videollamada.webp', alt: 'Ian en una videollamada, en la pantalla de una laptop', width: 900, height: 1600 } satisfies ImageAsset,
}

/**
 * Además de los planes: lo que se hace por proyecto, no por mes. Va junto a la asesoría, después de Planes.
 * Servicios reales del sitio anterior: "Sitio web / e-commerce", "Sesión de fotos & videos" y
 * "Soluciones a medida: Planificamos estrategias creativas y prácticas para conectar con tus clientes."
 */
export const extras = {
  eyebrow: 'También hacemos',
  title: 'Proyectos fuera de los planes', // TODO copy
  cta: txt('extras.cta'),
  items: [
    {
      icon: 'web',
      name: 'Sitio web / e-commerce',
      text: txt('extras.web.text'),
      price: '',
      href: whatsappWith(txt('extras.web.message')),
    },
    {
      icon: 'camera',
      name: 'Sesión de fotos y videos',
      text: txt('extras.sesion.text'),
      price: sesionPrice,
      href: whatsappWith(txt('extras.sesion.message')),
    },
    {
      icon: 'custom',
      name: 'Soluciones a medida',
      text: txt('extras.medida.text'),
      price: '',
      href: whatsappWith(txt('extras.medida.message')),
    },
  ] as { icon: 'web' | 'camera' | 'custom'; name: string; text: string; price: string; href: string }[],
}

/**
 * Proyectos: sección del inicio (los primeros del portfolio), /proyectos y /proyectos/<slug>.
 * Los proyectos en sí los carga el cliente desde el panel (content/proyectos/*.json).
 * Texto real del sitio anterior: "A lo largo de nuestra trayectoria, acompañamos a marcas, profesionales
 * y emprendimientos de distintos rubros a construir, comunicar y hacer crecer sus proyectos."
 */
export const proyectos = {
  eyebrow: 'Proyectos',
  title: { text: 'Marcas que ya confiaron en nosotros.', emphasis: 'confiaron en nosotros.' } satisfies Headline, // TODO copy
  text: txt('proyectos.text'),
  view: 'Ver el proyecto',
  cursor: 'Ver',
  all: txt('proyectos.all'),
  // tarjeta que completa la grilla del inicio mientras haya menos de 3 proyectos
  next: {
    title: 'Tu marca puede ser la próxima.', // TODO copy
    text: txt('proyectos.next.text'),
    cta: { label: txt('proyectos.next.cta'), href: whatsappWith(txt('proyectos.next.message')) },
  },
  page: {
    seo: {
      title: 'Proyectos y casos de éxito | Marketing by Clic',
      description: 'Marcas, profesionales y emprendimientos que acompañamos: identidad de marca, contenido, estrategia y Meta Ads. Conocé cada proyecto y cómo lo hicimos.',
    },
    title: { text: 'Proyectos que hablan por nosotros.', emphasis: 'hablan por nosotros.' } satisfies Headline, // TODO copy
    all: 'Todos',
    filterAria: 'Filtrar proyectos por servicio',
    empty: 'Todavía no hay proyectos de este servicio.',
  },
  detail: {
    breadcrumb: 'Proyectos',
    services: 'Servicios',
    sector: 'Rubro',
    location: 'Ubicación',
    year: 'Año',
    challenge: 'El desafío',
    process: 'Cómo lo hicimos',
    result: 'El resultado',
    gallery: 'Más piezas',
    next: 'Siguiente proyecto',
    back: 'Ver todos los proyectos',
    cta: {
      title: { text: '¿Querés algo así para tu marca?', emphasis: 'tu marca?' } satisfies Headline, // TODO copy
      text: txt('proyectos.detail.cta.text'),
      button: { label: 'Agendá una videollamada', href: WHATSAPP_MESSAGE },
    },
  },
}

export const contacto = {
  eyebrow: txt('contacto.eyebrow'),
  title: '¿Hablamos?',
  text: txt('contacto.text'),
  button: { label: txt('contacto.button'), href: WHATSAPP_MESSAGE },
  cursor: 'Escribinos',
}

export const footer = {
  line: txt('footer.line'),
  copyright: `© ${new Date().getFullYear()} Marketing by Clic`,
  backToTop: 'Volver arriba',
  blog: { label: 'Blog', href: '/blog' },
  proyectos: { label: 'Proyectos', href: '/proyectos' },
  navAria: 'Servicios, proyectos y blog',
}

export const blog = {
  eyebrow: 'Blog',
  title: { text: 'Ideas para que tus redes vendan más.', emphasis: 'vendan más.' } satisfies Headline, // TODO copy
  intro: 'Estrategia, contenido, Meta Ads y branding, explicados simple para que los apliques en tu marca.', // TODO copy
  seo: {
    title: 'Blog de marketing digital | Marketing by Clic',
    description: 'Notas sobre estrategia, contenido, Meta Ads y branding para que tus redes vendan más. Por Marketing by Clic, agencia nacida en la Patagonia.',
  },
  all: 'Todas',
  filterAria: 'Filtrar notas por categoría',
  featured: 'Última nota',
  read: 'Leer nota',
  minutes: 'min de lectura',
  empty: 'Todavía no hay notas en esta categoría.',
  breadcrumbHome: 'Inicio',
  breadcrumbAria: 'Ruta de navegación',
  toc: 'En esta nota',
  share: 'Compartir',
  shareWhatsapp: 'Compartir por WhatsApp',
  copy: 'Copiar link',
  copied: 'Link copiado',
  author: { name: 'Ian', role: 'Fundador de Marketing by Clic', photo: '/media/founder-ian-sm.webp', instagram: contact.founderInstagram },
  related: 'Seguí leyendo',
  back: 'Volver al blog',
  cta: {
    title: { text: '¿Querés aplicarlo a tu marca?', emphasis: 'tu marca?' } satisfies Headline, // TODO copy
    text: txt('blog.cta.text'),
    button: { label: 'Agendá una videollamada', href: WHATSAPP_MESSAGE },
  },
  notFound: {
    title: { text: 'Esta página no existe.', emphasis: 'no existe.' } satisfies Headline, // TODO copy
    text: 'Puede que el link esté mal o que la nota ya no esté publicada.', // TODO copy
    home: 'Ir al inicio',
    blog: 'Ver el blog',
  },
}

/** Diagnóstico rápido: 3 preguntas → plan recomendado → WhatsApp con el mensaje armado. Reglas según lo que incluye cada plan. */
export const diagnostico = {
  eyebrow: 'Diagnóstico rápido',
  title: { text: '¿No sabés qué plan elegir?', emphasis: 'qué plan' } satisfies Headline, // TODO copy
  text: txt('diagnostico.text'),
  step: 'Pregunta',
  of: 'de',
  back: 'Atrás',
  restart: 'Volver a empezar',
  // los textos se editan en el panel; el nivel de cada respuesta (qué plan recomienda) queda fijo
  questions: [
    {
      text: txt('diagnostico.q1'),
      options: [
        { label: txt('diagnostico.q1.o1'), level: 0 },
        { label: txt('diagnostico.q1.o2'), level: 1 },
        { label: txt('diagnostico.q1.o3'), level: 2 },
      ],
    },
    {
      text: txt('diagnostico.q2'),
      options: [
        { label: txt('diagnostico.q2.o1'), level: 0 },
        { label: txt('diagnostico.q2.o2'), level: 1 },
        { label: txt('diagnostico.q2.o3'), level: 2 },
      ],
    },
    {
      text: txt('diagnostico.q3'),
      options: [
        { label: txt('diagnostico.q3.o1'), level: 0 },
        { label: txt('diagnostico.q3.o2'), level: 2 },
      ],
    },
  ],
  result: 'Te recomendamos el plan',
  resultText: txt('diagnostico.resultText'),
  resultCta: txt('diagnostico.resultCta'),
  seePlans: 'Ver los planes',
  // Mensaje que se abre en WhatsApp (el nombre del plan se agrega al final)
  message: txt('diagnostico.message'),
  whatsapp: WHATSAPP,
}

/** Preguntas frecuentes: las preguntas y respuestas las edita el cliente desde el panel (content/faq.json). */
export const faq = {
  eyebrow: 'Preguntas frecuentes',
  title: { text: 'Lo que siempre nos preguntan.', emphasis: 'nos preguntan.' } satisfies Headline, // TODO copy
  text: txt('faq.text'),
  cta: { label: txt('faq.cta'), href: WHATSAPP_MESSAGE },
  items: (faqData.items ?? []).filter((item) => item.q?.trim() && item.a?.trim()),
}

/** Páginas de servicio (/servicios/<slug>). */
export const servicePage = {
  eyebrow: 'Servicio',
  breadcrumb: 'Servicios',
  plans: 'Ver planes',
  processTitle: 'Cómo trabajamos', // TODO copy
  related: 'Notas sobre',
  others: 'Otros servicios',
}
