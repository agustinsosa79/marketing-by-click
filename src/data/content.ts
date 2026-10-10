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
  title: 'Marketing by Clic | Agencia de marketing digital en la Patagonia',
  description: 'Estrategia, contenido y Meta Ads para convertir tus redes en un sistema de ventas. Agencia nacida en la Patagonia. Escribinos por WhatsApp.',
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
  // Bio de Instagram: "Estudio de Marketing Estratégico"
  kicker: 'Estudio de marketing estratégico en la Patagonia', // TODO copy
  // Texto real: "convertir tus redes en un sistema de ventas"
  title: { text: 'Tus redes, convertidas en un sistema de ventas.', emphasis: 'sistema de ventas.' } satisfies Headline,
  subtitle: 'Estrategia, contenido y Meta Ads para marcas que quieren crecer.', // TODO copy
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
  cta: { label: 'Hablemos con Ian', href: WHATSAPP }, // TODO copy
  // Bio de Instagram: "Construimos marcas que venden más."
  title: { text: 'Construimos marcas que venden más.', emphasis: 'venden más.' } satisfies Headline,
  points: [
    'Un estudio de marketing digital nacido en la Patagonia.',
    'Desde 1987, de la gráfica al mundo digital.',
    'Acompañamos cada marca de cerca y hacemos lo que realmente necesita.',
  ],
  quote: 'Hola, soy Ian. Creé Marketing by Clic para ayudar a marcas con un gran producto que necesitan más claridad y estrategia.',
  instagram: { ...contact.founderInstagram, text: 'El Instagram de Ian' }, // TODO copy
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
      includes: [
        'Reunión inicial para conocer tu negocio y tus objetivos',
        'Investigación de tu marca, tu público y tu competencia',
        'Propuesta y planificación para tus redes',
        'Análisis básico en el plan Inicial y avanzado en Plus y Premium',
        'Llamadas 1:1 semanales en el plan Premium',
      ],
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
      includes: [
        'Posteos, historias y reels cada mes, según tu plan',
        'De 2 canales en el plan Inicial a todas las redes que necesites en Premium',
        'Contenido adaptado a cada canal en los planes Plus y Premium',
        'Aprobación de las primeras piezas antes de publicar',
        `Sesión de fotos y videos opcional: ${sesionPrice}`,
      ],
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
      includes: [
        'Anuncios estratégicos en Instagram y Facebook',
        '2 campañas en el plan Plus',
        'Hasta 5 campañas simultáneas en el plan Premium',
        'Reporte de resultados cada mes',
        'La inversión en publicidad se cotiza aparte',
      ],
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
      includes: [
        'Logo completo',
        'Versión reducida para espacios chicos',
        'Aplicaciones en productos reales',
        'Manual de marca para una comunicación coherente y reconocible',
        'Más de 10 años de experiencia en identidad visual',
      ],
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
  cta: 'Consultar por WhatsApp',
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
  cta: { label: 'Empezar mi primer mes', href: WHATSAPP_MESSAGE }, // TODO copy
  title: { text: 'Tu primer mes, en tres etapas.', emphasis: 'tres etapas.' } satisfies Headline, // TODO copy
  // Agrupa los 7 pasos reales del cronograma; la cuarta etapa es lo que se repite cada mes
  stages: [
    {
      name: 'Diagnóstico',
      when: 'Semanas 1 y 2',
      text: 'Conocemos tu marca, tu público y tu competencia antes de proponer nada.', // TODO copy
      steps: ['Reunión inicial', 'Investigación'],
    },
    {
      name: 'Estrategia',
      when: 'Semanas 1 y 2',
      text: 'Armamos el plan para tus redes y lo ajustamos con vos.', // TODO copy
      steps: ['Propuesta', 'Planificación y desarrollo'],
    },
    {
      name: 'Ejecución',
      when: 'Semanas 3 y 4',
      text: 'Producimos el contenido, lo aprobás y lo publicamos.', // TODO copy
      steps: ['Producción de contenidos', 'Aprobación de las primeras piezas', 'Publicación'],
    },
    {
      name: 'Cada mes',
      when: 'Desde el mes 2',
      text: 'El ciclo se repite: medimos, ajustamos y seguimos creciendo.', // TODO copy
      steps: ['Contenido renovado', 'Campañas en Meta Ads según tu plan', 'Reporte de resultados'],
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
  features: string[]
}

export const planes = {
  eyebrow: 'Planes',
  title: { text: 'Hagamos crecer tus redes.', emphasis: 'crecer' } satisfies Headline,
  currency: prices.currency,
  period: 'por mes',
  badge: 'Más elegido',
  cta: 'Quiero este plan',
  ctaHref: WHATSAPP_MESSAGE,
  plans: [
    {
      id: 'inicial',
      name: 'Inicial',
      tone: 'light',
      price: prices.plans.inicial,
      for: 'Para empezar con contenido constante.', // TODO copy
      features: ['Análisis básico', 'Contenido orgánico, sin anuncios', 'Hasta 2 canales', '6 posteos, 8 historias y 2 reels al mes'],
    },
    {
      id: 'plus',
      name: 'Plus',
      tone: 'signal',
      featured: true,
      price: prices.plans.plus,
      for: 'Para sumar anuncios y vender más.', // TODO copy
      features: ['Análisis avanzado', 'Contenido + 2 campañas de Meta Ads*', 'Hasta 3 canales con contenido adaptado', '8 posteos, 12 historias y 4 reels al mes'],
    },
    {
      id: 'premium',
      name: 'Premium',
      tone: 'night',
      price: prices.plans.premium,
      for: 'Para estar en todas las redes que necesites.', // TODO copy
      features: ['Análisis avanzado y llamadas 1:1 semanales', 'Hasta 5 campañas de Meta Ads simultáneas*', 'Todas las redes necesarias', '8 posteos, 12 historias y 8 reels al mes'],
    },
  ] satisfies Plan[],
  note: '*La inversión en publicidad se cotiza aparte.',
  // lleva a la sección de abajo (asesoría + servicios fuera de los planes)
  extra: { text: '¿Necesitás algo a medida, una web o una sesión de fotos?', link: 'Mirá las otras opciones', id: sections.asesoria }, // TODO copy
}

/**
 * Asesoría 1:1: la alternativa para quien todavía no quiere un plan mensual. Va después de Planes
 * y con menos peso visual (no compite con la oferta principal). Textos del sitio anterior:
 * "Recibí una asesoría 1:1 100% personalizada" · "te ayudamos a ordenar ideas, detectar oportunidades
 * y definir un camino claro para crecer con intención".
 */
export const asesoria = {
  eyebrow: 'Asesoría 1:1',
  kicker: '¿Todavía no buscás un plan mensual?', // TODO copy
  title: { text: 'Una asesoría 1:1, 100% personalizada.', emphasis: '100% personalizada.' } satisfies Headline,
  text: '¿Tu negocio tiene potencial para crecer, pero no tenés claro cuál es el siguiente paso? Lo vemos juntos, a la medida de tu marca.', // TODO copy
  points: ['Ordenamos tus ideas', 'Detectamos oportunidades', 'Definimos un camino claro para crecer'],
  price: prices.asesoria.price ? { value: prices.asesoria.price, currency: prices.currency, detail: prices.asesoria.detail } : null,
  cta: { label: 'Quiero una asesoría', href: whatsappWith('Hola! Quiero una asesoría 1:1.') }, // TODO copy
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
  cta: 'Consultar',
  items: [
    {
      icon: 'web',
      name: 'Sitio web / e-commerce',
      text: 'Tu web o tu tienda online, pensada para que te encuentren y te escriban.', // TODO copy
      price: '',
      href: whatsappWith('Hola! Quiero consultar por un sitio web.'),
    },
    {
      icon: 'camera',
      name: 'Sesión de fotos y videos',
      text: 'Contenido propio para tus redes, hecho en una sola jornada.', // TODO copy
      price: sesionPrice,
      href: whatsappWith('Hola! Quiero consultar por una sesión de fotos y videos.'),
    },
    {
      icon: 'custom',
      name: 'Soluciones a medida',
      text: 'Planificamos estrategias creativas y prácticas para conectar con tus clientes.',
      price: '',
      href: whatsappWith('Hola! Necesito algo a medida para mi marca.'),
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
  text: 'Acompañamos a marcas, profesionales y emprendimientos de distintos rubros a construir, comunicar y hacer crecer sus proyectos.',
  view: 'Ver el proyecto',
  cursor: 'Ver',
  all: 'Ver todos los proyectos',
  // tarjeta que completa la grilla del inicio mientras haya menos de 3 proyectos
  next: {
    title: 'Tu marca puede ser la próxima.', // TODO copy
    text: 'Contanos qué necesitás y armamos el proyecto juntos.', // TODO copy
    cta: { label: 'Empezar mi proyecto', href: whatsappWith('Hola! Quiero empezar un proyecto con ustedes.') },
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
      text: 'Contanos tu proyecto en una videollamada gratuita y vemos juntos por dónde empezar.', // TODO copy
      button: { label: 'Agendá una videollamada', href: WHATSAPP_MESSAGE },
    },
  },
}

export const contacto = {
  eyebrow: 'Videollamada gratuita',
  title: '¿Hablamos?',
  text: '¿Tu negocio tiene potencial para crecer pero no sabés cuál es el próximo paso? Contanos tu proyecto y lo vemos juntos.',
  button: { label: 'Agendá una videollamada', href: WHATSAPP_MESSAGE },
  cursor: 'Escribinos',
}

export const footer = {
  line: 'Más visibilidad, más clientes, más ventas.',
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
    text: '¿Tu negocio tiene potencial para crecer pero no sabés cuál es el próximo paso? Contanos tu proyecto y lo vemos juntos.',
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
  text: 'Respondé tres preguntas y te decimos cuál te conviene. Toma menos de un minuto.', // TODO copy
  step: 'Pregunta',
  of: 'de',
  back: 'Atrás',
  restart: 'Volver a empezar',
  questions: [
    {
      text: '¿Querés sumar anuncios en Instagram y Facebook?',
      options: [
        { label: 'Por ahora no, solo contenido', level: 0 },
        { label: 'Sí, algunas campañas', level: 1 },
        { label: 'Sí, varias al mismo tiempo', level: 2 },
      ],
    },
    {
      text: '¿En cuántas redes querés estar?',
      options: [
        { label: '1 o 2', level: 0 },
        { label: '3', level: 1 },
        { label: 'Todas las que necesite', level: 2 },
      ],
    },
    {
      text: '¿Te sirven llamadas 1:1 todas las semanas?',
      options: [
        { label: 'No hace falta', level: 0 },
        { label: 'Sí, me gustaría', level: 2 },
      ],
    },
  ],
  result: 'Te recomendamos el plan',
  resultText: 'Escribinos por WhatsApp con tu resultado y lo vemos juntos en una videollamada gratuita.', // TODO copy
  resultCta: 'Enviar por WhatsApp',
  seePlans: 'Ver los planes',
  // Mensaje que se abre en WhatsApp (el nombre del plan se agrega al final)
  message: 'Hola! Hice el diagnóstico en la web y me recomendó el plan',
  whatsapp: WHATSAPP,
}

/** Preguntas frecuentes: las preguntas y respuestas las edita el cliente desde el panel (content/faq.json). */
export const faq = {
  eyebrow: 'Preguntas frecuentes',
  title: { text: 'Lo que siempre nos preguntan.', emphasis: 'nos preguntan.' } satisfies Headline, // TODO copy
  text: '¿Tenés otra duda? Escribinos y te respondemos.', // TODO copy
  cta: { label: 'Hacer una pregunta', href: WHATSAPP_MESSAGE },
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
