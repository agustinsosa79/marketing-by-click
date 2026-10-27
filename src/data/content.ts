/**
 * Todo el copy del sitio (paso 1 aprobado: 7 secciones, ≈450 palabras).
 * Fuente: textos reales de marketingbyclic.com (reference/content.json) y la bio de Instagram de la agencia.
 * - Redacción nueva sobre datos reales marcada con `// TODO copy` para revisión del cliente.
 * - Sin cursivas: el énfasis va con color (`emphasis` en los títulos).
 * - Lo que el cliente edita desde el panel vive aparte, en content/: precios (precios.json),
 *   preguntas frecuentes (faq.json), proyectos (proyectos/*.json) y notas del blog (blog/*.md).
 */

import faqData from '../../content/faq.json'
import testimoniosData from '../../content/testimonios.json'
import preciosData from '../../content/precios.json'
import textosData from '../../content/textos.json'
import { formatDuration, resolveImage, resolveVideo } from '../../panel/shared/media'
import { resolveList, resolveText, TOKENS } from '../../panel/shared/texts'
import { priceLabel, SERVICE_PRICES, type PriceDetail } from '../../panel/shared/site'
import mediosData from '../../content/medios.json'

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
  // servicios fuera de los planes: precio opcional (vacío = no se muestra y se consulta por WhatsApp)
  services: Object.fromEntries(
    SERVICE_PRICES.map((s) => {
      const raw = (preciosData as Record<string, unknown>)[s.id] as Partial<PriceDetail> | undefined
      return [s.id, { price: String(raw?.price ?? ''), detail: String(raw?.detail ?? '') }]
    }),
  ) as Record<(typeof SERVICE_PRICES)[number]['id'], PriceDetail>,
}
const servicePrice = (id: (typeof SERVICE_PRICES)[number]['id']) => priceLabel(prices.services[id], prices.currency)
const minPlanPrice = Math.min(...Object.values(prices.plans).map(Number).filter(Number.isFinite))
/** "2 horas · 100 USD" */
const sesionPrice = servicePrice('sesion')

/**
 * Textos editables desde el panel (content/textos.json; reglas y originales en panel/shared/texts.ts).
 * Si un texto no se cambió o no es válido, queda el original.
 */
// sin precio de la sesión, "…opcional: {precio_sesion}" queda "…opcional"
const withTokens = (s: string) => (sesionPrice ? s.split(TOKENS.precioSesion).join(sesionPrice) : s.replace(new RegExp(`:?\\s*${TOKENS.precioSesion}`, 'g'), ''))
const txt = (key: string) => withTokens(resolveText(textosData.values, key))
const list = (key: string) => resolveList(textosData.values, key).map(withTokens)

/** Fotos y video editables desde el panel (content/medios.json; originales en panel/shared/media.ts). */
const heroPhoto = resolveImage(mediosData.values, 'hero.photo')
const ianVideo = resolveVideo(mediosData.values, 'nosotros.video')
const asesoriaPhoto = resolveImage(mediosData.values, 'asesoria.photo')
const authorPhoto = resolveImage(mediosData.values, 'blog.author')
/** Foto que se ve al compartir el link (la de la portada). */
export const shareImage = heroPhoto.src

export const contact = {
  whatsapp: { label: '+54 9 2944 12-6756', href: WHATSAPP },
  whatsappMessage: WHATSAPP_MESSAGE,
  instagram: { label: '@clicstd', href: 'https://www.instagram.com/clicstd/' },
  founderInstagram: { label: '@ianmarketer', href: 'https://www.instagram.com/ianmarketer' },
  founderLinkedin: { label: 'LinkedIn de Ian', href: 'https://www.linkedin.com/in/ian-mark-straitas-a240b1302/' },
} as const

export const brand = {
  name: 'Clic Studio',
  /** Wordmark como el logo: "clic" bold + "studio" regular, en minúscula. */
  wordmark: ['clic', 'studio'],
}

/** Title y description de index.html (se mantienen iguales a mano: el HTML se sirve antes que el JS). */
export const seo = {
  title: 'Estudio de marketing digital y redes sociales | Clic Studio',
  description: 'Estudio de marketing digital: estrategia, contenido para redes sociales y anuncios en Instagram y Facebook. Tu agencia de redes, de cerca y a medida. Escribinos por WhatsApp.',
}

export const preloader = {
  // Aparece dentro del círculo azul que abre el clic (texto real de la marca)
  caption: { text: 'Estrategias online que generan resultados.', emphasis: 'resultados.' } satisfies Headline,
}

export const sections = {
  hero: 'inicio',
  nosotros: 'nosotros',
  servicios: 'servicios',
  soluciones: 'soluciones',
  proceso: 'proceso',
  planes: 'planes',
  asesoria: 'asesoria',
  proyectos: 'proyectos',
  testimonios: 'testimonios',
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
  homeLabel: 'Clic Studio, volver al inicio',
  items: [
    { label: 'Servicios', id: sections.servicios },
    { label: 'Proyectos', id: sections.proyectos },
    { label: 'Planes', id: sections.planes },
    { label: 'Soluciones', id: sections.soluciones },
    { label: 'Nosotros', id: sections.nosotros },
    { label: 'Tu primer mes', id: sections.proceso },
    { label: 'Preguntas', id: sections.faq },
    { label: 'Contacto', id: sections.contacto },
    { label: 'Blog', id: 'blog', href: '/blog' },
  ] as { label: string; id: string; href?: string }[],
  // Links de la barra fija (el botón principal es "Hablemos" por WhatsApp)
  plansLabel: 'Planes',
  solutionsLabel: 'Soluciones',
  ctaLabel: 'Hablemos',
  ctaCursor: 'Escribinos',
  contactTitle: 'Escribinos', // TODO copy
  socials: [
    { label: 'Instagram', href: contact.instagram.href },
    { label: contact.founderInstagram.label, href: contact.founderInstagram.href },
  ] satisfies Link[],
}

export const hero = {
  // H1: el cliente es un estudio. "Agencia" (lo más buscado) queda en el title y la descripción de la página.
  title: { text: 'Estudio de marketing digital y redes sociales.', emphasis: 'redes sociales.' } satisfies Headline,
  // La promesa real de la marca ("convertir tus redes en un sistema de ventas") pasa a la bajada, con las palabras que usa la gente
  subtitle: 'Convertimos tus redes en un sistema de ventas con estrategia, contenido y anuncios en redes.', // TODO copy
  cta: { label: 'Hablemos por WhatsApp', href: WHATSAPP },
  // salida secundaria: quien todavía no quiere escribir, va a ver precios
  secondary: { label: 'Ver planes', id: sections.planes },
  ianTeaser: { label: 'Conocé a Ian', hint: `Video con sonido · ${formatDuration(ianVideo.duration)}` },
  // Foto real de Ian en un lago de la Patagonia (nítida, sin overlay)
  image: {
    src: heroPhoto.src,
    srcSet: heroPhoto.srcSm ? `${heroPhoto.srcSm} 600w, ${heroPhoto.src} ${heroPhoto.width}w` : undefined,
    alt: heroPhoto.alt,
    width: heroPhoto.width,
    height: heroPhoto.height,
  },
  founderTag: 'Ian · Fundador', // TODO copy
}

export const nosotros = {
  eyebrow: 'Nosotros',
  cta: { label: txt('nosotros.cta'), href: WHATSAPP },
  title: { text: 'Tu marca tiene algo que la hace única.', emphasis: 'única.' } satisfies Headline,
  missionLead: txt('nosotros.missionLead'),
  missionText: txt('nosotros.missionText'),
  studioInstagram: { ...contact.instagram, text: 'El Instagram de Clic Studio' },
  founder: {
    name: 'Ian',
    role: 'Founder de Clic Studio',
    photo: authorPhoto.src,
    title: txt('nosotros.founderTitle'),
    text: [txt('nosotros.founderText'), txt('nosotros.founderText2')].filter(Boolean),
    links: [
      { label: contact.founderInstagram.label, href: contact.founderInstagram.href, icon: 'instagram' as const },
      { label: 'LinkedIn', href: contact.founderLinkedin.href, icon: 'linkedin' as const },
    ],
  },
  video: { src: ianVideo.src, fallback: ianVideo.fallback, poster: ianVideo.poster, duration: ianVideo.duration, label: 'Ian presenta Clic Studio' },
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
  /** Frase corta del círculo del método (inicio). */
  short: string
  image: ImageAsset
  /** Categoría del blog con notas relacionadas. */
  blogCategory: string
  /** Lo que incluye, armado con los planes, el cronograma y el caso reales. */
  includes: string[]
  seo: { title: string; description: string }
}

/**
 * Servicios (sección del inicio, "ecosistema"): las cuatro partes del trabajo, con el mismo nombre que sus páginas. Cada una lleva a su página
 * (/servicios/<slug>). El cliente cuenta su método más que vender cada servicio por separado.
 */
export const servicios = {
  eyebrow: 'Servicios',
  title: { text: 'Todo lo que tu marca necesita para vender en redes.', emphasis: 'vender en redes.' } satisfies Headline,
  planCta: { label: txt('servicios.planCta'), id: sections.planes },
  cursor: 'Consultar',
  ctaHref: WHATSAPP_MESSAGE,
  items: [
    {
      slug: 'estrategia',
      name: 'Estrategia',
      text: 'Entendemos tu negocio y armamos un plan de acción 100% a medida.',
      icon: 'strategy',
      short: txt('servicios.estrategia.short'),
      blogCategory: 'Estrategia',
      includes: list('servicios.estrategia.includes'),
      seo: {
        title: 'Estrategia de marketing digital para tu marca | Clic Studio',
        description: 'Entendemos tu negocio y armamos un plan de acción 100% a medida para tus redes. Diagnóstico, propuesta y planificación. Escribinos por WhatsApp.',
      },
      image: { src: '/media/servicio-estrategia-duo.webp', alt: 'Escritorio con gráficos y una laptop', width: 720, height: 404 },
    },
    {
      slug: 'contenido',
      name: 'Contenido',
      text: 'Contenido que conecta con tu audiencia y mejora tu visibilidad.',
      icon: 'content',
      short: txt('servicios.contenido.short'),
      blogCategory: 'Contenido',
      includes: list('servicios.contenido.includes'),
      seo: {
        title: 'Contenido para redes sociales | Clic Studio',
        description: `Posteos, historias y reels que conectan con tu audiencia y mejoran tu visibilidad. Planes mensuales desde ${minPlanPrice} ${prices.currency}. Escribinos por WhatsApp.`,
      },
      image: { src: '/media/servicio-contenido-duo.webp', alt: 'Manos escribiendo en un celular', width: 720, height: 404 },
    },
    {
      slug: 'meta-ads',
      name: 'Meta Ads',
      text: 'Anuncios estratégicos en Instagram y Facebook para que vendas de verdad.',
      icon: 'ads',
      short: txt('servicios.meta-ads.short'),
      blogCategory: 'Meta Ads',
      includes: list('servicios.meta-ads.includes'),
      seo: {
        title: 'Meta Ads: anuncios en Instagram y Facebook | Clic Studio',
        description: 'Campañas de Meta Ads en Instagram y Facebook para que tus redes vendan de verdad. Incluidas en los planes Plus y Premium. Escribinos por WhatsApp.',
      },
      image: { src: '/media/servicio-meta-ads-duo.webp', alt: 'Celular y laptop con métricas en pantalla', width: 720, height: 404 },
    },
    {
      // "Diseño" (pedido del cliente): es transversal al branding y a la gestión de redes
      slug: 'diseno',
      name: 'Diseño',
      text: 'Tu marca necesita más que un logo: necesita una identidad.',
      icon: 'branding',
      short: txt('servicios.branding.short'),
      blogCategory: 'Diseño',
      includes: list('servicios.branding.includes'),
      seo: {
        title: 'Diseño e identidad de marca (branding) | Clic Studio',
        description: 'Tu marca necesita más que un logo: necesita una identidad. Logo, versión reducida, aplicaciones y manual de marca. Escribinos por WhatsApp.',
      },
      image: { src: '/media/duende-mockup-duo.webp', alt: 'Remeras con la identidad del Hostel El Duende Errante', width: 720, height: 720 },
    },
  ] satisfies Service[],
  includesLabel: 'Qué incluye',
  // etiquetas dentro de las mini animaciones de cada servicio
  demo: { reels: 'Reels', ads: 'Meta Ads' },
  more: 'Conocé nuestra propuesta',
  cta: txt('servicios.cta'),
  listAria: 'Elegí una solución',
}

export const proceso = {
  eyebrow: 'Cómo trabajamos',
  cta: { label: txt('proceso.cta'), href: WHATSAPP_MESSAGE },
  title: { text: 'Tu primer mes, en tres etapas.', emphasis: 'tres etapas.' } satisfies Headline, // TODO copy
  // Las tres etapas del primer mes, una línea cada una; lo que se repite después va aparte
  stages: [
    { name: 'Diagnóstico', when: 'Semanas 1 y 2', text: txt('proceso.diagnostico.text') },
    { name: 'Estrategia', when: 'Semanas 1 y 2', text: txt('proceso.estrategia.text') },
    { name: 'Ejecución', when: 'A partir de la semana 3', text: txt('proceso.ejecucion.text') },
  ],
  monthly: { name: 'Cada mes', when: 'Desde el mes 2', text: txt('proceso.mensual.text') },
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
  // en las tarjetas van los primeros puntos; la comparación completa, en una ventana
  cardFeatures: 3,
  compare: {
    open: 'Comparar planes',
    title: 'Compará los tres planes',
    label: 'Planes',
    price: 'Precio',
    // filas de la comparación: el n-ésimo ítem de cada plan habla de lo mismo (así están cargados en el panel)
    rows: ['Análisis', 'Contenido y anuncios', 'Canales', 'Producción por mes', 'Más'],
    none: '—',
  },
}

/**
 * Asesoría 1:1: la alternativa para quien todavía no quiere un plan mensual. Va después de Planes
 * y con menos peso visual (no compite con la oferta principal). Textos del sitio anterior:
 * "Recibí una asesoría 1:1 100% personalizada" · "te ayudamos a ordenar ideas, detectar oportunidades
 * y definir un camino claro para crecer con intención".
 */
export const asesoria = {
  eyebrow: 'Asesoría 1:1',
  title: { text: 'Una asesoría 1:1, 100% personalizada.', emphasis: '100% personalizada.' } satisfies Headline,
  text: txt('asesoria.text'),
  price: servicePrice('asesoria'),
  cta: { label: txt('asesoria.cta'), href: whatsappWith(txt('asesoria.message')) },
  // Foto real del sitio anterior: Ian en una videollamada
  image: { src: asesoriaPhoto.src, alt: asesoriaPhoto.alt, width: asesoriaPhoto.width, height: asesoriaPhoto.height } satisfies ImageAsset,
}

/**
 * Servicios (sección propia, después del diagnóstico): la asesoría 1:1 y lo que se hace por proyecto.
 * A la izquierda la lista; a la derecha el detalle del elegido, con su foto, su texto y su WhatsApp ya escrito.
 * Los textos y los mensajes se editan en el panel (Textos → Servicios); los precios, en Precios.
 */
export interface ServiceOffer {
  key: 'asesoria' | 'web' | 'sesion' | 'branding' | 'medida'
  icon: 'person' | 'web' | 'camera' | 'branding' | 'custom'
  name: string
  title: Headline
  text: string
  price: string
  image: ImageAsset
  cta: { label: string; href: string }
}

export const extras = {
  eyebrow: 'Soluciones',
  title: { text: 'Más allá de los planes.', emphasis: 'los planes.' } satisfies Headline,
  listAria: 'Elegí una solución',
  items: [
    {
      key: 'asesoria',
      icon: 'person',
      name: 'Asesoría 1:1',
      title: asesoria.title,
      text: asesoria.text,
      price: asesoria.price,
      image: asesoria.image,
      cta: asesoria.cta,
    },
    {
      key: 'web',
      icon: 'web',
      name: 'Sitio web / e-commerce',
      title: { text: 'Tu sitio web o tienda online.', emphasis: 'tienda online.' },
      text: txt('extras.web.text'),
      price: servicePrice('web'),
      image: { src: '/media/servicio-meta-ads-foto.webp', alt: 'Laptop y celular sobre un escritorio de madera', width: 1200, height: 675 },
      cta: { label: txt('extras.cta'), href: whatsappWith(txt('extras.web.message')) },
    },
    {
      key: 'sesion',
      icon: 'camera',
      name: 'Sesión de fotos y videos',
      title: { text: 'Sesión de fotos y videos.', emphasis: 'fotos y videos.' },
      text: txt('extras.sesion.text'),
      price: sesionPrice,
      image: { src: '/media/servicio-contenido-foto.webp', alt: 'Manos sosteniendo un celular', width: 1200, height: 675 },
      cta: { label: txt('extras.cta'), href: whatsappWith(txt('extras.sesion.message')) },
    },
    {
      key: 'branding',
      icon: 'branding',
      name: 'Branding',
      title: { text: 'Branding: la identidad de tu marca.', emphasis: 'la identidad de tu marca.' },
      text: txt('extras.branding.text'),
      price: servicePrice('branding'),
      image: { src: '/media/duende-mockup.webp', alt: 'Remeras con la identidad del Hostel El Duende Errante', width: 1200, height: 1200 },
      cta: { label: txt('extras.cta'), href: whatsappWith(txt('extras.branding.message')) },
    },
    {
      key: 'medida',
      icon: 'custom',
      name: 'Soluciones a medida',
      title: { text: 'Soluciones a medida.', emphasis: 'a medida.' },
      text: txt('extras.medida.text'),
      price: servicePrice('medida'),
      image: { src: '/media/servicio-estrategia-foto.webp', alt: 'Persona trabajando en una mesa con papeles y una laptop', width: 1200, height: 675 },
      cta: { label: txt('extras.cta'), href: whatsappWith(txt('extras.medida.message')) },
    },
  ] satisfies ServiceOffer[],
}

/**
 * Testimonios (debajo de los proyectos): los carga el cliente desde el panel (content/testimonios.json).
 * El texto va entre comillas automáticamente; si no hay foto, se muestran las iniciales.
 */
export interface Testimonial {
  name: string
  role: string
  text: string
  photo: { src: string; alt: string } | null
}
export const testimonios = {
  eyebrow: 'Testimonios',
  title: { text: 'Lo que dicen quienes trabajaron con nosotros.', emphasis: 'trabajaron con nosotros.' } satisfies Headline,
  items: ((testimoniosData.items ?? []) as Testimonial[]).filter((t) => t.name?.trim() && t.text?.trim()),
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
  page: {
    seo: {
      title: 'Proyectos y casos de éxito | Clic Studio',
      description: 'Marcas, profesionales y emprendimientos que acompañamos: identidad de marca, contenido, estrategia y Meta Ads. Conocé cada proyecto y cómo lo hicimos.',
    },
    title: { text: 'Proyectos que hablan por nosotros.', emphasis: 'hablan por nosotros.' } satisfies Headline, // TODO copy
    all: 'Todos',
    filterAria: 'Filtrar proyectos por servicio',
    empty: 'Todavía no hay proyectos de este servicio.',
  },
  detail: {
    channels: 'Sus redes',
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

/** Barra fija de WhatsApp en el celular (aparece después del inicio y se va al llegar a Contacto). */
export const mobileCta = { label: 'Escribinos por WhatsApp', hint: txt('contacto.eyebrow'), href: WHATSAPP }

export const footer = {
  line: txt('footer.line'),
  copyright: `© ${new Date().getFullYear()} Clic Studio`,
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
    title: 'Blog de marketing digital | Clic Studio',
    description: 'Notas sobre estrategia, contenido, Meta Ads y branding para que tus redes vendan más. Por Clic Studio, estudio nacido en la Patagonia.',
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
  author: { name: 'Ian', role: 'Fundador de Clic Studio', photo: authorPhoto.src, instagram: contact.founderInstagram },
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
  // botón en Planes que abre el diagnóstico en una ventana
  open: '¿No sabés cuál elegir?',
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
