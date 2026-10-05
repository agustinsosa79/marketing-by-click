/**
 * Todo el copy del sitio (paso 1 aprobado: 7 secciones, ≈450 palabras).
 * Fuente: textos reales de marketingbyclic.com (reference/content.json) y la bio de Instagram de la agencia.
 * - Redacción nueva sobre datos reales marcada con `// TODO copy` para revisión del cliente.
 * - Sin cursivas: el énfasis va con color (`emphasis` en los títulos).
 */

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
  caso: 'caso',
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
    { label: 'Caso de éxito', id: sections.caso },
    { label: 'Cómo trabajamos', id: sections.proceso },
    { label: 'Planes', id: sections.planes },
    { label: 'Preguntas', id: sections.faq },
    { label: 'Nosotros', id: sections.nosotros },
    { label: 'Contacto', id: sections.contacto },
    { label: 'Blog', id: 'blog', href: '/blog' },
  ] as { label: string; id: string; href?: string }[],
  // Botón secundario de la barra (el principal es "Hablemos" por WhatsApp)
  plansLabel: 'Planes',
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
        'Sesión de fotos y videos opcional: 2 horas, 100 USD',
      ],
      seo: {
        title: 'Contenido para redes sociales | Marketing by Clic',
        description: 'Posteos, historias y reels que conectan con tu audiencia y mejoran tu visibilidad. Planes mensuales desde 115 USD. Escribinos por WhatsApp.',
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
  extras: [
    { name: 'Asesoría 1:1', text: 'Ordenamos ideas y definimos tu próximo paso.' },
    { name: 'Sesión de fotos y videos', text: '2 horas de contenido para tus redes · 100 USD' },
  ],
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

export interface Plan {
  name: string
  featured?: boolean
  price: string
  for: string
  features: string[]
}

export const planes = {
  eyebrow: 'Planes',
  title: { text: 'Hagamos crecer tus redes.', emphasis: 'crecer' } satisfies Headline,
  currency: 'USD',
  period: 'por mes',
  badge: 'Más elegido',
  cta: 'Quiero este plan',
  ctaHref: WHATSAPP_MESSAGE,
  plans: [
    {
      name: 'Inicial',
      price: '115',
      for: 'Para empezar con contenido constante.', // TODO copy
      features: ['Análisis básico', 'Contenido orgánico, sin anuncios', 'Hasta 2 canales', '6 posteos, 8 historias y 2 reels al mes'],
    },
    {
      name: 'Plus',
      featured: true,
      price: '135',
      for: 'Para sumar anuncios y vender más.', // TODO copy
      features: ['Análisis avanzado', 'Contenido + 2 campañas de Meta Ads*', 'Hasta 3 canales con contenido adaptado', '8 posteos, 12 historias y 4 reels al mes'],
    },
    {
      name: 'Premium',
      price: '155',
      for: 'Para estar en todas las redes que necesites.', // TODO copy
      features: ['Análisis avanzado y llamadas 1:1 semanales', 'Hasta 5 campañas de Meta Ads simultáneas*', 'Todas las redes necesarias', '8 posteos, 12 historias y 8 reels al mes'],
    },
  ] satisfies Plan[],
  note: '*La inversión en publicidad se cotiza aparte.',
  extra: { text: '¿Necesitás algo a medida, una web o una sesión de fotos?', link: 'Consultanos' }, // TODO copy
}

export const caso = {
  eyebrow: 'Caso de éxito',
  title: { text: 'Una identidad completa para Hostel El Duende Errante.', emphasis: 'El Duende Errante.' } satisfies Headline,
  text: 'Logo, versión reducida y aplicaciones: un manual de marca para que su comunicación sea coherente y reconocible. Lo diseñamos con más de 10 años de experiencia en identidad visual.', // TODO copy
  images: [
    { caption: 'Logo completo', src: '/media/duende-logo-completo.webp', alt: 'Logo completo del Hostel El Duende Errante', width: 800, height: 651 },
    { caption: 'Versión reducida', src: '/media/duende-version-reducida.webp', alt: 'Versión reducida del logo del Hostel El Duende Errante', width: 800, height: 651 },
    { caption: 'Aplicaciones', src: '/media/duende-mockup.webp', alt: 'Remeras blancas y negras con el logo del Hostel El Duende Errante', width: 800, height: 800 },
  ] satisfies (ImageAsset & { caption: string })[],
  cta: { label: 'Quiero mi identidad de marca', href: WHATSAPP_MESSAGE },
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
  navAria: 'Servicios y blog',
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

/** Preguntas frecuentes (respuestas armadas con los datos reales del sitio). */
export const faq = {
  eyebrow: 'Preguntas frecuentes',
  title: { text: 'Lo que siempre nos preguntan.', emphasis: 'nos preguntan.' } satisfies Headline, // TODO copy
  text: '¿Tenés otra duda? Escribinos y te respondemos.', // TODO copy
  cta: { label: 'Hacer una pregunta', href: WHATSAPP_MESSAGE },
  items: [
    {
      q: '¿Cuánto tarda en arrancar?',
      a: 'El primer mes se organiza en etapas: en las semanas 1 y 2 hacemos el diagnóstico y la estrategia; en las semanas 3 y 4 producimos el contenido, lo aprobás y lo publicamos.',
    },
    {
      q: '¿La inversión en publicidad está incluida?',
      a: 'No. Los planes Plus y Premium incluyen armar y llevar adelante las campañas de Meta Ads; la inversión en publicidad, lo que se le paga a Meta, se cotiza aparte.',
    },
    {
      q: '¿Qué plan me conviene?',
      a: 'Inicial es para empezar con contenido constante, sin anuncios. Plus suma 2 campañas de Meta Ads. Premium permite hasta 5 campañas simultáneas y llamadas 1:1 semanales. Si dudás, hacé el diagnóstico rápido.',
    },
    {
      q: '¿Veo el contenido antes de que se publique?',
      a: 'Sí. Antes de publicar te mostramos las primeras piezas para que las apruebes.',
    },
    {
      q: '¿Hacen trabajos a medida?',
      a: 'Sí: identidad de marca, asesorías 1:1 y sesiones de fotos y videos (2 horas, 100 USD). Contanos qué necesitás.',
    },
    {
      q: '¿Cómo empezamos?',
      a: 'Con una videollamada gratuita: nos contás tu proyecto y vemos juntos cuál es el próximo paso.',
    },
  ],
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
