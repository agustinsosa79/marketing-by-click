/**
 * Textos de la web editables desde el panel (sección "Textos").
 * Única fuente de verdad: qué se puede editar, con qué límites y cuál es el texto original.
 * La usan el sitio (src/data/content.ts), el panel y el servidor (que vuelve a validar todo).
 *
 * Criterio: se edita el contenido que no pesa para Google. Quedan bloqueados (y se muestran con candado):
 * el hero completo, los títulos de las secciones, los nombres de servicios y planes, y lo que va
 * a datos estructurados o a la descripción de cada página.
 *
 * En content/textos.json se guardan solo los textos que difieren del original. Si un valor falta, está
 * vacío o no pasa la validación, el sitio usa el texto original: la web nunca queda con un hueco.
 *
 * ⚠️ Este archivo lo importa también el sitio: no puede importar nada.
 */

export type TextField =
  | { kind: 'text' | 'textarea'; key: string; label: string; hint?: string; default: string; min: number; max: number }
  | { kind: 'list'; key: string; label: string; hint?: string; default: string[]; minItems: number; maxItems: number; itemMin: number; itemMax: number }

export interface TextGroup {
  title?: string
  fields: TextField[]
}

export interface LockedText {
  label: string
  value: string
  /** Por qué está bloqueado (si no, se usa el motivo general). */
  reason?: string
}

export interface TextSection {
  id: string
  label: string
  /** Dirección de la sección en la web (para el marco de la vista previa). */
  path: string
  intro: string
  locked: LockedText[]
  groups: TextGroup[]
}

/** Reemplazos dentro de los textos: se completan solos con el dato actual. */
export const TOKENS = { precioSesion: '{precio_sesion}' } as const

const SEO = 'Afecta a cómo te encuentra Google.'

// atajos para declarar campos
const text = (key: string, label: string, def: string, min: number, max: number, hint?: string): TextField => ({ kind: 'text', key, label, default: def, min, max, hint })
const area = (key: string, label: string, def: string, min: number, max: number, hint?: string): TextField => ({ kind: 'textarea', key, label, default: def, min, max, hint })
const list = (key: string, label: string, def: string[], items: [number, number], chars: [number, number], hint?: string): TextField => ({
  kind: 'list',
  key,
  label,
  default: def,
  minItems: items[0],
  maxItems: items[1],
  itemMin: chars[0],
  itemMax: chars[1],
  hint,
})
const button = (key: string, def: string, max = 28) => text(key, 'Texto del botón', def, 4, max)
const message = (key: string, def: string, hint = 'Es el mensaje que aparece ya escrito al abrir WhatsApp.') => area(key, 'Mensaje de WhatsApp', def, 10, 200, hint)

export const TEXT_SECTIONS: TextSection[] = [
  {
    id: 'hero',
    label: 'Inicio (portada)',
    path: '/#inicio',
    intro: 'La portada concentra lo que Google usa para entender de qué trata el sitio. No se edita desde el panel.',
    locked: [
      { label: 'Título principal (H1)', value: 'Agencia de marketing digital y redes sociales.' },
      { label: 'Bajada', value: 'Convertimos tus redes en un sistema de ventas con estrategia, contenido y anuncios en Instagram y Facebook.' },
      { label: 'Botón', value: 'Hablemos por WhatsApp' },
      { label: 'Enlace', value: 'Ver planes' },
    ],
    groups: [],
  },
  {
    id: 'servicios',
    label: 'Servicios',
    path: '/servicios/estrategia',
    intro: 'Qué incluye cada servicio. Se ve en la página de cada servicio (en el inicio va solo el nombre y una frase).',
    locked: [
      { label: 'Título', value: 'Todo lo que tu marca necesita para vender en redes.' },
      { label: 'Nombres de los servicios', value: 'Estrategia · Contenido · Meta Ads · Branding' },
      { label: 'Texto corto de cada servicio', value: 'Ej.: “Entendemos tu negocio y armamos un plan de acción 100% a medida.”', reason: 'Se envía a Google como descripción del servicio.' },
    ],
    groups: [
      { title: 'Estrategia', fields: [list('servicios.estrategia.includes', 'Qué incluye', ['Reunión inicial para conocer tu negocio y tus objetivos', 'Investigación de tu marca, tu público y tu competencia', 'Propuesta y planificación para tus redes', 'Análisis básico en el plan Inicial y avanzado en Plus y Premium', 'Llamadas 1:1 semanales en el plan Premium'], [3, 6], [6, 90])] },
      {
        title: 'Contenido',
        fields: [
          list(
            'servicios.contenido.includes',
            'Qué incluye',
            ['Posteos, historias y reels cada mes, según tu plan', 'De 2 canales en el plan Inicial a todas las redes que necesites en Premium', 'Contenido adaptado a cada canal en los planes Plus y Premium', 'Aprobación de las primeras piezas antes de publicar', `Sesión de fotos y videos opcional: ${TOKENS.precioSesion}`],
            [3, 6],
            [6, 90],
            `${TOKENS.precioSesion} se reemplaza solo por el precio y la duración de la sesión de fotos (sección Precios).`,
          ),
        ],
      },
      { title: 'Meta Ads', fields: [list('servicios.meta-ads.includes', 'Qué incluye', ['Anuncios estratégicos en Instagram y Facebook', '2 campañas en el plan Plus', 'Hasta 5 campañas simultáneas en el plan Premium', 'Reporte de resultados cada mes', 'La inversión en publicidad se cotiza aparte'], [3, 6], [6, 90])] },
      { title: 'Branding', fields: [list('servicios.branding.includes', 'Qué incluye', ['Logo completo', 'Versión reducida para espacios chicos', 'Aplicaciones en productos reales', 'Manual de marca para una comunicación coherente y reconocible', 'Más de 10 años de experiencia en identidad visual'], [3, 6], [6, 90])] },
      { title: 'Botón', fields: [button('servicios.cta', 'Consultar por WhatsApp')] },
    ],
  },
  {
    id: 'proyectos',
    label: 'Proyectos',
    path: '/#proyectos',
    intro: 'El botón al portfolio y el texto de la página de proyectos. Los proyectos se cargan en la sección Proyectos del panel.',
    locked: [
      { label: 'Título', value: 'Marcas que ya confiaron en nosotros.' },
    ],
    groups: [
      { fields: [area('proyectos.text', 'Texto de la página de proyectos', 'Acompañamos a marcas, profesionales y emprendimientos de distintos rubros a construir, comunicar y hacer crecer sus proyectos.', 60, 220), button('proyectos.all', 'Ver todos los proyectos')] },
    ],
  },
  {
    id: 'proceso',
    label: 'Cómo trabajamos',
    path: '/#proceso',
    intro: 'Una línea por etapa del primer mes, y lo que se repite después. Se ve en el inicio y en las páginas de servicio.',
    locked: [
      { label: 'Título', value: 'Tu primer mes, en tres etapas.' },
      { label: 'Nombre y semanas de cada etapa', value: 'Diagnóstico · Estrategia · Ejecución · Cada mes' },
    ],
    groups: [
      { title: 'Diagnóstico · Semanas 1 y 2', fields: [area('proceso.diagnostico.text', 'Texto', 'Conocemos tu marca, tu público y tu competencia antes de proponer nada.', 20, 120)] },
      { title: 'Estrategia · Semanas 1 y 2', fields: [area('proceso.estrategia.text', 'Texto', 'Armamos el plan para tus redes y lo ajustamos con vos.', 20, 120)] },
      { title: 'Ejecución · Semanas 3 y 4', fields: [area('proceso.ejecucion.text', 'Texto', 'Producimos el contenido, lo aprobás y lo publicamos.', 20, 120)] },
      { title: 'Cada mes · Desde el mes 2', fields: [area('proceso.mensual.text', 'Texto', 'El ciclo se repite: medimos, ajustamos y seguimos creciendo.', 20, 120)] },
      { title: 'Botón', fields: [button('proceso.cta', 'Empezar mi primer mes', 30)] },
    ],
  },
  {
    id: 'diagnostico',
    label: 'Diagnóstico',
    path: '/#planes',
    intro: 'Las tres preguntas que recomiendan un plan. Se abren en una ventana desde Planes, con el botón “¿No sabés cuál elegir?”. Se editan los textos; qué plan recomienda cada respuesta queda fijo.',
    locked: [
      { label: 'Título', value: '¿No sabés qué plan elegir?' },
      { label: 'Qué plan recomienda cada respuesta', value: 'Más anuncios, más redes o llamadas semanales → plan más completo', reason: 'Es la lógica del diagnóstico: cambiarla requiere ajustar el código.' },
    ],
    groups: [
      { fields: [area('diagnostico.text', 'Texto antes de la primera pregunta', 'Respondé tres preguntas y te decimos cuál te conviene. Toma menos de un minuto.', 30, 150)] },
      {
        title: 'Pregunta 1',
        fields: [text('diagnostico.q1', 'Pregunta', '¿Querés sumar anuncios en Instagram y Facebook?', 10, 80), text('diagnostico.q1.o1', 'Respuesta → plan Inicial', 'Por ahora no, solo contenido', 2, 40), text('diagnostico.q1.o2', 'Respuesta → plan Plus', 'Sí, algunas campañas', 2, 40), text('diagnostico.q1.o3', 'Respuesta → plan Premium', 'Sí, varias al mismo tiempo', 2, 40)],
      },
      {
        title: 'Pregunta 2',
        fields: [text('diagnostico.q2', 'Pregunta', '¿En cuántas redes querés estar?', 10, 80), text('diagnostico.q2.o1', 'Respuesta → plan Inicial', '1 o 2', 1, 40), text('diagnostico.q2.o2', 'Respuesta → plan Plus', '3', 1, 40), text('diagnostico.q2.o3', 'Respuesta → plan Premium', 'Todas las que necesite', 2, 40)],
      },
      {
        title: 'Pregunta 3',
        fields: [text('diagnostico.q3', 'Pregunta', '¿Te sirven llamadas 1:1 todas las semanas?', 10, 80), text('diagnostico.q3.o1', 'Respuesta → no suma', 'No hace falta', 2, 40), text('diagnostico.q3.o2', 'Respuesta → plan Premium', 'Sí, me gustaría', 2, 40)],
      },
      {
        title: 'Resultado',
        fields: [
          area('diagnostico.resultText', 'Texto del resultado', 'Escribinos por WhatsApp con tu resultado y lo vemos juntos en una videollamada gratuita.', 30, 160),
          button('diagnostico.resultCta', 'Enviar por WhatsApp'),
          message('diagnostico.message', 'Hola! Hice el diagnóstico en la web y me recomendó el plan', 'Al final se agrega solo el nombre del plan recomendado.'),
        ],
      },
    ],
  },
  {
    id: 'planes',
    label: 'Planes',
    path: '/#planes',
    intro: 'Para quién es cada plan y qué incluye. En las tarjetas se ven los 3 primeros ítems; la lista completa, en “Comparar planes”. Los precios se cambian en la sección Precios.',
    locked: [
      { label: 'Título', value: 'Hagamos crecer tus redes.' },
      { label: 'Nombres de los planes', value: 'Inicial · Plus · Premium', reason: 'También los usan el diagnóstico y los mensajes de WhatsApp.' },
    ],
    groups: [
      { title: 'Inicial', fields: [text('planes.inicial.for', 'Para quién es', 'Para empezar con contenido constante.', 10, 70), list('planes.inicial.features', 'Qué incluye', ['Análisis básico', 'Contenido orgánico, sin anuncios', 'Hasta 2 canales', '6 posteos, 8 historias y 2 reels al mes'], [3, 5], [3, 60])] },
      { title: 'Plus', fields: [text('planes.plus.for', 'Para quién es', 'Para sumar anuncios y vender más.', 10, 70), list('planes.plus.features', 'Qué incluye', ['Análisis avanzado', 'Contenido + 2 campañas de Meta Ads*', 'Hasta 3 canales con contenido adaptado', '8 posteos, 12 historias y 4 reels al mes'], [3, 5], [3, 60])] },
      {
        title: 'Premium',
        fields: [
          text('planes.premium.for', 'Para quién es', 'Para estar en todas las redes que necesites.', 10, 70),
          text('planes.premium.highlight', 'Diferencial destacado', 'Llamadas 1:1 semanales', 6, 30, 'Va en el recuadro azul, arriba de la lista.'),
          text('planes.premium.highlightNote', 'Debajo del diferencial', 'Exclusivo del plan Premium', 6, 40),
          list('planes.premium.features', 'Qué incluye', ['Análisis avanzado', 'Hasta 5 campañas de Meta Ads simultáneas*', 'Todas las redes necesarias', '8 posteos, 12 historias y 8 reels al mes'], [3, 5], [3, 60]),
        ],
      },
      {
        title: 'Textos comunes',
        fields: [
          text('planes.badge', 'Etiqueta del plan destacado', 'Más elegido', 4, 16),
          button('planes.cta', 'Quiero este plan', 24),
          text('planes.note', 'Nota al pie', '*La inversión en publicidad se cotiza aparte.', 10, 90, 'El asterisco (*) de los ítems remite a esta nota.'),
        ],
      },
    ],
  },
  {
    id: 'asesoria',
    label: 'Asesoría y extras',
    path: '/#asesoria',
    intro: 'La asesoría 1:1 y los servicios fuera de los planes, en la fila de abajo de los planes. Los precios se cambian en la sección Precios.',
    locked: [
      { label: 'Título de la asesoría', value: 'Una asesoría 1:1, 100% personalizada.' },
      { label: 'Nombres de los extras', value: 'Sitio web / e-commerce · Sesión de fotos y videos · Soluciones a medida' },
    ],
    groups: [
      {
        title: 'Asesoría 1:1',
        fields: [
          area('asesoria.text', 'Texto', '¿Tu negocio tiene potencial para crecer, pero no tenés claro cuál es el siguiente paso? Lo vemos juntos, a la medida de tu marca.', 40, 220),
          button('asesoria.cta', 'Quiero una asesoría'),
          message('asesoria.message', 'Hola! Quiero una asesoría 1:1.'),
        ],
      },
      { title: 'Sitio web / e-commerce', fields: [message('extras.web.message', 'Hola! Quiero consultar por un sitio web.')] },
      { title: 'Sesión de fotos y videos', fields: [message('extras.sesion.message', 'Hola! Quiero consultar por una sesión de fotos y videos.')] },
      { title: 'Soluciones a medida', fields: [message('extras.medida.message', 'Hola! Necesito algo a medida para mi marca.')] },
      { title: 'Textos comunes', fields: [text('extras.cta', 'Acción de cada extra', 'Consultar', 4, 16)] },
    ],
  },
  {
    id: 'preguntas',
    label: 'Preguntas',
    path: '/#preguntas',
    intro: 'El botón que acompaña a las preguntas frecuentes (van debajo de Nosotros). Las preguntas se editan en la sección Preguntas.',
    locked: [{ label: 'Título', value: 'Lo que siempre nos preguntan.' }],
    groups: [{ fields: [button('faq.cta', 'Hacer una pregunta')] }],
  },
  {
    id: 'nosotros',
    label: 'Nosotros',
    path: '/#nosotros',
    intro: 'La frase de Ian, junto al video.',
    locked: [{ label: 'Título', value: 'Construimos marcas que venden más.' }],
    groups: [
      {
        fields: [
          area('nosotros.quote', 'Frase de Ian', 'Hola, soy Ian. Creé Clic Studio para ayudar a marcas con un gran producto que necesitan más claridad y estrategia.', 40, 200),
          button('nosotros.cta', 'Hablemos con Ian'),
          text('nosotros.instagram', 'Texto del enlace a Instagram', 'El Instagram de Ian', 6, 30),
        ],
      },
    ],
  },
  {
    id: 'contacto',
    label: 'Contacto y cierres',
    path: '/#contacto',
    intro: 'La sección final del inicio, la frase del pie y el cierre de las páginas del blog y de los proyectos.',
    locked: [
      { label: 'Título de contacto', value: '¿Hablamos?' },
      { label: 'Títulos de los cierres', value: '¿Querés aplicarlo a tu marca? · ¿Querés algo así para tu marca?' },
    ],
    groups: [
      {
        title: 'Contacto (inicio)',
        fields: [
          text('contacto.eyebrow', 'Etiqueta', 'Videollamada gratuita', 6, 30),
          area('contacto.text', 'Texto', '¿Tu negocio tiene potencial para crecer pero no sabés cuál es el próximo paso? Contanos tu proyecto y lo vemos juntos.', 40, 200),
          button('contacto.button', 'Agendá una videollamada', 30),
        ],
      },
      { title: 'Pie de página', fields: [text('footer.line', 'Frase', 'Más visibilidad, más clientes, más ventas.', 10, 60)] },
      { title: 'Cierre de las notas del blog', fields: [area('blog.cta.text', 'Texto', '¿Tu negocio tiene potencial para crecer pero no sabés cuál es el próximo paso? Contanos tu proyecto y lo vemos juntos.', 40, 200)] },
      { title: 'Cierre de los proyectos', fields: [area('proyectos.detail.cta.text', 'Texto', 'Contanos tu proyecto en una videollamada gratuita y vemos juntos por dónde empezar.', 40, 200)] },
    ],
  },
]

export const LOCKED_REASON = `${SEO} Para cambiarlo, pedilo a quien administra el sitio.`

export const TEXT_FIELDS: Record<string, TextField> = Object.fromEntries(TEXT_SECTIONS.flatMap((s) => s.groups.flatMap((g) => g.fields)).map((f) => [f.key, f]))

export type TextValue = string | string[]
export type TextValues = Record<string, TextValue>

// ---------------------------------------------------------------- validación (panel y servidor)

const line = (v: unknown) =>
  String(v ?? '')
    // sin caracteres de control ni saltos de línea: todos estos textos son de una sola línea o un párrafo
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u001f\u007f]/g, ' ')
    // texto plano: cualquier etiqueta HTML pegada por error se quita
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim()

const same = (a: TextValue, b: TextValue) => JSON.stringify(a) === JSON.stringify(b)

/** Error de un valor según su campo, o null si está bien. Vacío = volver al original (no es error). */
export function fieldError(field: TextField, value: TextValue): string | null {
  if (field.kind === 'list') {
    const items = (Array.isArray(value) ? value : []).map(line).filter(Boolean)
    if (items.length === 0) return null
    if (items.length < field.minItems) return `Tiene que haber al menos ${field.minItems} ítems.`
    if (items.length > field.maxItems) return `Puede haber hasta ${field.maxItems} ítems.`
    const bad = items.findIndex((i) => i.length < field.itemMin || i.length > field.itemMax)
    if (bad >= 0) return `El ítem ${bad + 1} tiene que tener entre ${field.itemMin} y ${field.itemMax} caracteres.`
    return null
  }
  const v = line(value)
  if (!v) return null
  if (v.length < field.min) return `Muy corto: mínimo ${field.min} caracteres.`
  if (v.length > field.max) return `Muy largo: máximo ${field.max} caracteres.`
  return null
}

/**
 * Normaliza lo que llega del panel: solo campos conocidos, texto plano, y solo lo que difiere del original
 * (vacío o igual al original = se borra, así la web vuelve al texto original).
 */
export function cleanTexts(raw: unknown): { values: TextValues; errors: { key: string; message: string }[] } {
  const values: TextValues = {}
  const errors: { key: string; message: string }[] = []
  if (!raw || typeof raw !== 'object') return { values, errors }
  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    const field = TEXT_FIELDS[key]
    if (!field) continue
    const clean: TextValue = field.kind === 'list' ? (Array.isArray(value) ? value.map(line).filter(Boolean) : []) : line(value)
    const error = fieldError(field, clean)
    if (error) {
      errors.push({ key, message: error })
      continue
    }
    if ((Array.isArray(clean) ? clean.length === 0 : !clean) || same(clean, field.default)) continue
    values[key] = clean
  }
  return { values, errors }
}

// ---------------------------------------------------------------- lectura (sitio)

/** Texto de un campo: el guardado si es válido; si no, el original. Una clave inexistente rompe el build a propósito. */
export function resolveText(values: Record<string, unknown> | undefined, key: string): string {
  const field = TEXT_FIELDS[key]
  if (!field || field.kind === 'list') throw new Error(`Texto inexistente: ${key}`)
  const v = values?.[key]
  if (typeof v !== 'string') return field.default
  const clean = line(v)
  return clean && !fieldError(field, clean) ? clean : field.default
}

export function resolveList(values: Record<string, unknown> | undefined, key: string): string[] {
  const field = TEXT_FIELDS[key]
  if (!field || field.kind !== 'list') throw new Error(`Lista inexistente: ${key}`)
  const v = values?.[key]
  if (!Array.isArray(v)) return field.default
  const clean = v.map(line).filter(Boolean)
  return clean.length && !fieldError(field, clean) ? clean : field.default
}
