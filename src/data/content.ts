/**
 * Todo el copy del sitio. Fuente: reference/content.json (scrape de marketingbyclic.com).
 * - Typos del original corregidos (ver docs/brand-analysis.md §5).
 * - Microcopy nuevo marcado con `// TODO copy` para revisión.
 * - `*palabra*` = énfasis editorial (serif itálica).
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
  tagline: ['Marketing digital.', 'Estrategias online que generan resultados.'],
  phrase: 'De la gráfica al mundo digital.',
}

export const preloader = {
  // Frase corta debajo del video (texto real de la marca)
  caption: 'Estrategias online que generan resultados',
  // Microtexto abajo a la derecha (2 líneas)
  microtext: ['Marketing digital.', 'De la gráfica al mundo digital.'],
}

export const sections = {
  hero: 'inicio',
  nosotros: 'nosotros',
  historia: 'historia',
  servicios: 'servicios',
  proceso: 'proceso',
  planes: 'planes',
  casos: 'casos',
  founder: 'founder',
  contacto: 'contacto',
} as const

export const nav = {
  menuLabel: 'Menú',
  closeLabel: 'Cerrar',
  openAria: 'Abrir menú', // TODO copy
  closeAria: 'Cerrar menú', // TODO copy
  menuAria: 'Menú principal', // TODO copy
  skipLink: 'Saltar al contenido', // TODO copy
  homeLabel: 'Marketing by Clic, volver al inicio', // TODO copy
  // TODO copy: labels del menú propuestos, mapeados a las secciones nuevas
  items: [
    { label: 'Nosotros', id: sections.nosotros },
    { label: 'Founder', id: sections.founder },
    { label: 'Servicios', id: sections.servicios },
    { label: 'Proceso', id: sections.proceso },
    { label: 'Planes', id: sections.planes },
    { label: 'Casos', id: sections.casos },
    { label: 'Contacto', id: sections.contacto },
  ],
  // Links visibles en la barra (desktop); el resto queda en el menú
  quickLinks: [sections.servicios, sections.proceso, sections.planes, sections.founder] as string[],
  quickAria: 'Secciones principales', // TODO copy
  ctaLabel: 'Hablemos', // TODO copy
  ctaCursor: 'Escribinos', // TODO copy
  navigationLabel: 'Navegación', // TODO copy
  contactLabel: 'Hablemos', // TODO copy
  secondary: [
    { label: 'WhatsApp', href: WHATSAPP },
    { label: 'Instagram', href: contact.instagram.href },
    { label: contact.founderInstagram.label, href: contact.founderInstagram.href },
  ] satisfies Link[],
  socials: [
    { label: 'Instagram de Marketing by Clic', href: contact.instagram.href, icon: 'instagram' }, // TODO copy (aria)
    { label: 'Escribinos por WhatsApp', href: WHATSAPP, icon: 'whatsapp' }, // TODO copy (aria)
  ] as const,
}

export const hero = {
  // Titular del brief v2: frase real de la marca (meta description del sitio)
  headline: ['Estrategias', 'online que', '*generan*', 'resultados.'],
  title: 'Convertimos tus redes en una herramienta de crecimiento.',
  subtitle: 'Potenciamos la comunicación de tu marca para convertir tus redes en un sistema de ventas.',
  cta: { label: 'Hablemos por WhatsApp', href: WHATSAPP }, // TODO copy
  meta: ['Marketing digital', 'Patagonia, Argentina', 'Desde 1987'], // TODO copy (datos reales, formato nuevo)
  scroll: 'Scroll', // TODO copy
  ianTeaser: { label: 'Conocé a Ian', hint: 'Video con sonido' }, // TODO copy
  video: {
    src: '/media/hero.mp4',
    poster: '/media/hero-poster.webp',
  },
}

export type StatementPart = string | { accent: string } | { pill: ImageAsset }

export const manifiesto = {
  eyebrow: 'Somos Marketing by Clic',
  // Texto real; las píldoras de imagen van dentro de la frase (fotos reales de la marca)
  statement: [
    'Un estudio estratégico de marketing digital nacido en la',
    { accent: 'Patagonia.' },
    { pill: { src: '/media/founder-ian-sm.webp', alt: 'Ian frente a un lago en la Patagonia', width: 600, height: 800 } },
    'Conectamos negocios con la comunidad.',
    { pill: { src: '/media/videollamada.webp', alt: 'Ian en una videollamada con un cliente', width: 900, height: 1600 } },
    'Acompañamos cada marca de cerca',
    { pill: { src: '/media/duende-mockup.webp', alt: 'Remeras con la marca de un cliente', width: 800, height: 800 } },
    'y hacemos lo que realmente necesitan.',
  ] satisfies StatementPart[],
}

export const historia = {
  eyebrow: 'Nuestra historia', // TODO copy
  since: 'Desde',
  year: '1987',
  phrase: brand.phrase,
  from: 'De la gráfica', // partes de brand.phrase para el recorrido animado
  to: 'al mundo digital.',
}

export const servicios = {
  eyebrow: 'Qué hacemos', // TODO copy
  cursor: 'Ver', // TODO copy
  cta: 'Consultar por WhatsApp', // TODO copy
  ctaHref: WHATSAPP_MESSAGE,
  title: '¿Necesitás ayuda?',
  intro: 'Tenés tu propia historia y tus propios desafíos. Por eso, la prioridad es escucharte antes de actuar.',
  principles: [
    { title: 'Análisis personalizado', text: 'Identificamos juntos qué necesita tu negocio para crecer.' },
    { title: 'Soluciones a medida', text: 'Planificamos estrategias creativas y prácticas para conectar con tus clientes.' },
    { title: 'Ejecución', text: 'Implementamos las acciones para lograr el impacto que buscás.' },
  ],
  items: [
    {
      name: 'Estrategia',
      tag: 'Plan 100% a medida', // TODO copy (resumen del texto real)
      text: 'Comprendemos tu negocio y diseñamos el mejor plan de acción 100% a medida.',
      image: { src: '/media/servicio-estrategia-foto.webp', alt: 'Escritorio visto desde arriba con gráficos y una laptop', width: 900, height: 506 },
    },
    {
      name: 'Contenido',
      tag: 'Conecta con tu audiencia', // TODO copy (resumen del texto real)
      text: 'Creamos contenido que conecta con tu audiencia, mejora tu visibilidad y supera tus objetivos.',
      image: { src: '/media/servicio-contenido-foto.webp', alt: 'Manos escribiendo en un celular', width: 900, height: 506 },
    },
    {
      name: 'Meta Ads',
      tag: 'Para que vendas de verdad', // TODO copy (resumen del texto real)
      text: 'Creamos anuncios estratégicos para que vendas de verdad.',
      image: { src: '/media/servicio-meta-ads-foto.webp', alt: 'Celular y laptop con métricas en pantalla', width: 900, height: 506 },
    },
    {
      name: 'Branding',
      tag: 'Más que un logo', // TODO copy (resumen del texto real)
      text: 'Tu marca necesita más que un logo: necesita una identidad.',
      image: { src: '/media/duende-logo-completo.webp', alt: 'Logo del Hostel El Duende Errante', width: 800, height: 651 },
    },
    {
      name: 'Asesoría 1:1',
      tag: '100% personalizada', // TODO copy (texto real de Asesoría)
      text: 'A través de nuestras asesorías estratégicas te ayudamos a ordenar ideas, detectar oportunidades y definir un camino claro para crecer con intención.',
      image: { src: '/media/videollamada.webp', alt: 'Ian en una videollamada de asesoría', width: 900, height: 1600 },
    },
    {
      name: 'Fotos & videos',
      tag: 'Jornada de 2hs', // TODO copy (resumen del texto real)
      price: '100 USD · Sujeto a disponibilidad',
      text: 'Jornada intensiva de 2hs de creación de contenido de alta calidad, auténtico, dinámico y alineado a tu marca.',
      image: { src: '/media/ian-video-poster.webp', alt: 'Ian grabando contenido para redes', width: 832, height: 464 },
    },
  ] satisfies { name: string; tag: string; text: string; image: ImageAsset; price?: string }[],
}

export const proceso = {
  eyebrow: 'Cómo trabajamos', // TODO copy
  title: 'Cronograma de Trabajo',
  month: 'Mes inicial',
  steps: [
    { group: 'Semanas 1 y 2', name: 'Reunión inicial', icon: '/media/paso-reunion-inicial.webp' },
    { group: 'Semanas 1 y 2', name: 'Investigación y estrategia', icon: '/media/paso-investigacion-estrategia.webp' },
    { group: 'Semanas 1 y 2', name: 'Propuesta', icon: '/media/paso-propuesta.webp' },
    { group: 'Semanas 1 y 2', name: 'Planificación y desarrollo', icon: '/media/paso-planificacion-desarrollo.webp' },
    { group: 'Semanas 3 y 4', name: 'Producción de contenidos', icon: '/media/paso-produccion-contenidos.webp' },
    { group: 'Semanas 3 y 4', name: 'Aprobación de primeras piezas', icon: '/media/paso-aprobacion-piezas.webp' },
    { group: 'Semanas 3 y 4', name: 'Publicación', icon: '/media/paso-publicacion.webp' },
  ],
  following: {
    title: 'Meses siguientes',
    items: [
      'La renovación del contenido se planifica durante la última semana de cada mes.',
      'Publicaciones periódicas en los canales contratados.',
      'Gestión a demanda de campañas de publicidad en Meta Ads* (sujeto a disponibilidad del plan contratado).',
      'Revisión constante de la estrategia general.',
    ],
  },
  report: 'De forma periódica, recibirán un reporte con los resultados de las actividades realizadas.',
}

export interface Plan {
  name: string
  featured?: boolean
  price: string
  features: string[]
}

export const planes = {
  eyebrow: 'Planes', // TODO copy
  title: 'Hagamos crecer tus redes.',
  currency: 'usd',
  period: '/ cada mes',
  badge: 'Más elegido',
  note: '*inversión cotiza aparte',
  cta: 'Quiero este plan', // TODO copy
  ctaHref: WHATSAPP_MESSAGE,
  plans: [
    {
      name: 'Inicial',
      price: '115',
      features: [
        'Análisis básico',
        'Contenido orgánico (sin ADS)',
        'Hasta 2 canales (contenido replicado)',
        '8 historias al mes',
        '6 posteos al mes',
        '2 reel/tiktok al mes',
      ],
    },
    {
      name: 'Plus',
      featured: true,
      price: '135',
      features: [
        'Análisis avanzado',
        'Contenido orgánico + 2 campañas de ADS*',
        'Hasta 3 canales (contenido adaptado)',
        '12 historias al mes',
        '8 posteos al mes',
        '4 reel/tiktok al mes',
      ],
    },
    {
      name: 'Premium',
      price: '155',
      features: [
        'Análisis avanzado',
        'Llamadas 1:1 semanales',
        'Hasta 5 campañas de ADS simultáneas*',
        'Estrategia adaptada de canales (Sí, TODAS LAS REDES NECESARIAS)',
        '12 historias al mes',
        '8 posteos al mes',
        '8 reel/tiktok al mes',
      ],
    },
  ] satisfies Plan[],
  sesion: {
    title: 'Sesión de fotos & videos',
    price: '100 USD',
    availability: 'Sujeto a disponibilidad',
    text: [
      'Jornada intensiva de 2hs de creación de contenido de alta calidad realizada con UGC y cámara de dispositivo iPhone enfocada en generar contenido auténtico, dinámico y alineado a tu marca.',
      'El objetivo es mostrar el uso de tus productos y/o servicios de forma real y cercana, priorizando formatos que se adapten a los requerimientos actuales de las redes sociales (reels, stories e imágenes).',
    ],
  },
  adicionales: {
    title: 'Servicios adicionales',
    cta: 'Consúltanos :)',
    items: [
      'Branding personalizado',
      'Sitio web / e-commerce',
      'E-mail marketing',
      'Diseño gráfico profesional',
      'Fotografía profesional',
      'Campañas de ADS extra',
      'Canales extra',
      'Soluciones logísticas',
    ],
    nuevo: { badge: 'Nuevo!', label: 'Asesoría completa de marketing digital' },
  },
}

export const casos = {
  eyebrow: 'Nuestro trabajo',
  title: 'En nosotros podés confiar.',
  image: { src: '/media/videollamada.webp', alt: 'Ian en una videollamada con un cliente', width: 900, height: 1600 },
  paragraphs: [
    'Diseñamos estrategias digitales personalizadas para conectar tu marca con su audiencia, potenciando la presencia online para posicionarse mejor en el mercado.',
    'Con nuestros clientes, logramos potenciar su alcance y fortalecer su posición en el mercado, además de redefinir su identidad de marca y mejorar su visibilidad, aumentando sus ventas mediante la integración de Meta Ads.',
  ],
  trayectoria:
    'A lo largo de nuestra trayectoria, acompañamos a marcas, profesionales y emprendimientos de distintos rubros a construir, comunicar y hacer crecer sus proyectos.',
  invite: 'Conocé algunos de los proyectos que ya confiaron en nosotros ↓',
  branding: {
    title: 'Branding Studio.',
    caseLabel: 'Caso de éxito: Hostel “El Duende Errante”',
    images: [
      { caption: 'Logo completo', src: '/media/duende-logo-completo.webp', alt: 'Logo completo del Hostel El Duende Errante', width: 800, height: 651 },
      { caption: 'Versión reducida', src: '/media/duende-version-reducida.webp', alt: 'Versión reducida del logo del Hostel El Duende Errante', width: 800, height: 651 },
      { caption: 'Mockup', src: '/media/duende-mockup.webp', alt: 'Remeras blancas y negras con el logo del Hostel El Duende Errante', width: 800, height: 800 },
    ] satisfies (ImageAsset & { caption: string })[],
    headline: 'Tu marca necesita más que un logo: necesita una identidad.',
    text: [
      'En Clic desarrollamos manuales de marca completos: incluyendo logo, colores, tipografías, usos, aplicaciones e incluso mockups para que tu comunicación sea coherente, profesional y reconocible.',
      'Diseñamos identidades visuales con estrategia, criterio estético y la experiencia de diseñadores con más de 10 años en el rubro.',
    ],
    cta: { label: 'Solicitá tu manual de marca', href: WHATSAPP_MESSAGE }, // TODO copy (original: "Solicitá tu manual de marca personalizado.")
  },
}

export const founder = {
  eyebrow: 'Founder',
  player: {
    play: 'Mirá el video', // TODO copy
    resume: 'Seguir viendo', // TODO copy
    hint: 'Con sonido', // TODO copy
    replay: 'Volver a ver', // TODO copy
    cursorPlay: 'Play', // TODO copy
    cursorPause: 'Pausa', // TODO copy
    pauseAria: 'Pausar video', // TODO copy
    playAria: 'Reproducir video con sonido', // TODO copy
    muteAria: 'Silenciar', // TODO copy
    unmuteAria: 'Activar sonido', // TODO copy
    seekAria: 'Posición del video', // TODO copy
  },
  title: 'Hola, soy *Ian!*',
  intro: 'Me apasionan el marketing y las personas detrás de cada negocio.',
  paragraphs: [
    'Creé Marketing by Clic para ayudar a todas esas marcas que tienen un gran producto, pero necesitan más claridad y estrategia.',
    'Hoy en día todos compiten por atención. Por eso creo que antes de publicar más, hay que entender hacia dónde queremos ir y construir una estrategia que tenga sentido para el negocio.',
    'Mi trabajo es ayudarte a ordenar, comunicar y hacer crecer tu marca, sin perder la esencia que la hace única 💙',
  ],
  instagram: { ...contact.founderInstagram, text: 'Seguime para aprender sobre negocios digitales' },
  photo: { src: '/media/founder-ian.webp', srcSmall: '/media/founder-ian-sm.webp', alt: 'Ian, fundador de Marketing by Clic, frente a un lago en la Patagonia', width: 1200, height: 1600 },
  video: { src: '/media/video-hero-ian.mp4', poster: '/media/ian-video-poster.webp', label: 'Ian hablando a cámara' }, // TODO copy (aria)
}

export const asesoria = {
  title: 'Recibí una asesoría 1:1 100% personalizada',
  question: '¿Sentís que tu negocio tiene potencial para crecer, pero no tenés claro cuál es el siguiente paso?',
  text: 'A través de nuestras asesorías estratégicas te ayudamos a ordenar ideas, detectar oportunidades y definir un camino claro para crecer con intención.',
  invite: 'Escribinos ahora y conversemos sobre tu proyecto.',
}

export const cta = {
  eyebrow: 'Asesoría 1:1 · Videollamada gratuita', // TODO copy
  question: '¿Hablamos?', // TODO copy
  cursor: 'Escribinos', // TODO copy
  title: 'Hagamos crecer tus redes',
  text: 'Más visibilidad, más clientes, más ventas.',
  button: { label: 'Agendá una videollamada gratuita', href: WHATSAPP_MESSAGE },
}

export const results = {
  // Solo datos que la marca publica en su propio sitio
  eyebrow: 'En números', // TODO copy
  items: [
    { value: 1987, prefix: '', suffix: '', label: 'Desde', text: 'De la gráfica al mundo digital.' },
    { value: 10, prefix: '+', suffix: '', label: 'Años en el rubro', text: 'Diseñadores con más de 10 años de experiencia en identidad visual.' }, // TODO copy (dato real, redacción nueva)
    { value: 100, prefix: '', suffix: '%', label: 'A medida', text: 'Cada plan de acción se diseña para tu negocio.' }, // TODO copy (dato real, redacción nueva)
  ],
}

export const footer = {
  navTitle: 'Secciones', // TODO copy
  contactTitle: 'Contacto', // TODO copy
  lines: ['Nacido en la Patagonia.', 'Desde 1987.'], // TODO copy (armado con frases reales de la marca)
  copyright: `© ${new Date().getFullYear()} Marketing by Clic`, // TODO copy
  backToTop: 'Volver arriba', // TODO copy
}
