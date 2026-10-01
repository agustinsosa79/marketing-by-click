# Marketing by Clic — Análisis de marca y propuesta de arquitectura

> Fase 0 del rediseño de https://marketingbyclic.com/ · relevado el 01/10/2026 con `npm run scrape`
> (`scripts/scrape.ts` + `scripts/identify-fonts.mjs`). Datos crudos en `reference/`, medios en `public/media/`.

---

## 0. Cómo se extrajo (y qué limita Canva)

El sitio es un export de **Canva Websites**. Tiene varias trampas que el scraper resuelve:

| Problema de Canva | Cómo se resolvió |
|---|---|
| `networkidle` nunca llega (conexiones abiertas) | `load` + esperas fijas |
| El scroll no es del documento: es un `div` interno de 16.336 px | Scroll programático de ese contenedor |
| Screenshots `fullPage` y por elemento salen cortados | Captura por tramos y unión en `<canvas>`. Las secciones se recortan de la imagen completa |
| Links e imágenes fuera de pantalla se **desmontan del DOM** | Recolección en cada paso del scroll + captura por red |
| Titulares partidos en un `<span>` (o un `<a>`) por letra | Se toma el texto del bloque contenedor |
| Gran parte del texto visible **no es texto del DOM** | Se usa la capa oculta de accesibilidad que Canva duplica (texto completo y limpio) |
| Fuentes con nombre ofuscado y **tabla `name` vaciada** | Vendor ID del archivo + comparación píxel a píxel contra Google Fonts |
| Paleta computada pobre (el texto está rasterizado) | Paleta por **histograma de píxeles** de las capturas (`reference/palette-pixels-*.json`) |

Es una sola página (one-page). Los 9 items del menú apuntan todos a `/` y hacen scroll por JS. No hay páginas internas.

---

## 1. Paleta

Fuente principal: histograma de píxeles de la captura desktop completa, más muestreo puntual de elementos.

| Hex | % superficie | Dónde aparece hoy | Token propuesto |
|---|---|---|---|
| `#223a8d` | 52.6 % | Fondo dominante (hero, nosotros, portfolio, servicio, tiempos, contacto), logo | **`brand-deep`** — azul Clic |
| `#004aad` | 0.9 % | Card plan Premium | **`brand-primary`** — cobalto |
| `#42b8fd` | 0.7 % | Card plan Plus, label "Nuestro trabajo", resaltados "ADS / TODAS LAS REDES" | **`brand-accent`** — celeste |
| `#1e84f0` | 1.5 % | Card "Sesión de fotos & videos" | `brand-electric` |
| `#4667af` | 11.4 % | Fondo Branding, card "Servicios adicionales", botón "Casos de éxito" | `brand-mid` |
| `#98acd9` | 5.5 % | Fondo sección Planes | `brand-soft` |
| `#93bcd5` | 1.2 % | Card plan Inicial, bloque "Semanas 3 y 4" | `brand-powder` |
| `#e3e8ff` | 15.9 % | Fondos claros (Founder, Asesoría), cards, texto claro sobre azul, logo versión clara | **`brand-paper`** |
| `#1a4292` | 0.4 % | Texto sobre fondo claro (títulos Founder/Asesoría) | **`brand-ink`** |
| `#a8944d` | — | Cinta "Más elegido" | `brand-gold` (uso puntual) |
| `#ffffff` | 1.5 % | Texto sobre azul | `white` (de Tailwind) |

**Lectura de marca:** es una marca **monocromática azul**. No hay un acento cálido real (el dorado es un detalle aislado). El rediseño tiene que sostener esa identidad y sacarle más rango tonal, no sumar colores nuevos.

**Roles propuestos:**
- `brand-deep` (#223a8d) es el tono oscuro de la marca: menú fullscreen, overlay del video, footer y secciones oscuras.
- `brand-primary` (#004aad) para el bloque de CTA final a pantalla completa. Se distingue de `brand-deep` sin salir de la familia. Blanco sobre cobalto da 8.13:1.
- `brand-paper` (#e3e8ff) como fondo del preloader y de las secciones claras. `brand-ink` para el texto sobre paper.
- `brand-accent` (#42b8fd) solo para detalles: hover, labels, subrayados, cursor. Sobre `brand-deep` da 4.62:1 (AA).

**Contraste WCAG de los pares que usa la web hoy:**

| Par | Ratio | Resultado |
|---|---|---|
| blanco / `#223a8d` | 10.20 | AA |
| `#e3e8ff` / `#223a8d` | 8.38 | AA |
| `#1a4292` / `#e3e8ff` | 7.71 | AA |
| blanco / `#004aad` | 8.13 | AA |
| blanco / `#4667af` | 5.50 | AA |
| `#42b8fd` / `#223a8d` | 4.62 | AA |
| blanco / `#1e84f0` | 3.74 | solo texto grande |
| blanco / `#93bcd5` (plan Inicial) | **2.02** | **falla** |
| blanco / `#42b8fd` (plan Plus) | **2.21** | **falla** |
| blanco / `#98acd9` (título Planes) | **2.27** | **falla** |

En el rediseño, `brand-powder`, `brand-soft` y `brand-accent` nunca llevan texto blanco encima. Llevan `brand-deep` o `brand-ink`.

---

## 2. Tipografías detectadas

Canva vacía la tabla de nombres de los archivos, así que se identificaron por vendor ID (tabla `OS/2`) y por coincidencia de render contra Google Fonts (IoU de píxeles, `reference/font-identification.json`).

| ID Canva | Identificación | Evidencia | Uso actual |
|---|---|---|---|
| `YAFdtQi73Xs` | **Montserrat** (400 y 700) | Vendor `ULA ` (Julieta Ulanovsky), coincidencia 84 % / 94 % | Cuerpo y la mayoría de los títulos. Es la fuente de la marca |
| `YAFdJn5d8s0` | Grotesk neutra de Canva, sin equivalente exacto en Google Fonts | Vendor `UKWN`. Lo más cercano es Instrument Sans/Archivo, con solo ~50 % | Algunos títulos: "Hola, soy Ian!", "En nosotros podés confiar.", "¿Necesitás ayuda?", "Hagamos crecer tus redes." |
| `YAEnXHTFXhg` | Display **expandida** del foundry TipoType (no verificable) | Vendor `TpTp`, width class 7 (expandida), 700 | Botones: "CONTÁCTANOS", "AGENDÁ UNA VIDEOLLAMADA GRATUITA" |

Hoy conviven **3 familias** sin un criterio claro (títulos en Montserrat y en la grotesk mezclados), con títulos en caja mixta y tamaños parecidos entre sí. Eso aplana la jerarquía.

**Propuesta:**
- **Display — Montserrat 800/900, MAYÚSCULAS, tracking cerrado.** Es la fuente real de la marca, y en peso Black funciona como grotesk pesada para títulos gigantes (preloader, footer, CTA). Mantiene continuidad con el logo y con lo que la gente ya reconoce.
- **Cuerpo — Montserrat 400/500**, chico y con mucho aire.
- **Serif del menú — Instrument Serif** (condensada, alto contraste). Es nueva para la marca: se usa solo en el menú fullscreen y en algún acento editorial (por ejemplo, una palabra en itálica dentro de un título), para dar el contrapunto que hoy falta.
- Se eliminan la grotesk de Canva y la expandida de TipoType. Los botones pasan a Montserrat 600 mayúsculas con tracking amplio.

> Alternativa si querés más carácter en display: **Archivo** en ancho expandido (eje `wdth`), que recupera algo del espíritu de la display de los botones actuales. Mi recomendación es Montserrat por coherencia de marca.

Todas se cargan con `<link>` de Google Fonts en `index.html` y se exponen como clases (`.font-display`, `.font-body`, `.font-serif-display`).

---

## 3. Activos de marca descargados (`public/media/`)

| Archivo | Qué es | Nota |
|---|---|---|
| `logo-marketing-by-clic-blanco.png` | Logo completo (isotipo + "MARKETING By Clic"), blanco, 799×222 | **Solo PNG, no hay SVG** |
| `logo-marketing-by-clic-claro.png` | Mismo logo en `#e3e8ff`, 799×226 | Versión del footer |
| `favicon-32.png`, `favicon-192.png`, `apple-touch-icon-180.png` | Isotipo azul sobre paper | Única versión del isotipo aislado (192 px máx.) |
| `icono-instagram.png`, `icono-whatsapp.png` (+ `-claro`) | Íconos dibujados a mano, en azul de marca y en paper | Tienen trazo irregular y son parte de la identidad. Sirven para la navbar |
| `video-hero-ian.mp4` + `video-hero-ian-poster.jpg` | Video de Ian hablando a cámara. 832×464, 25 s, con audio (AAC estéreo; en Canva se reproducía muteado), 2.6 MB | Va en la sección Founder con reproductor propio y sonido |
| `founder-ian.jpg` (+ `-mobile`) | Retrato de Ian en un lago patagónico, 1200×1600 | |
| `nuestro-trabajo-videollamada.jpg` (+ `-mobile`) | Ian en videollamada, 900×1600 | |
| `servicio-estrategia.png`, `servicio-contenido.png`, `servicio-meta-ads.png` | Los 3 pilares de servicio como **imagen con texto incrustado** | En el rediseño se pasan a texto real (transcripción en §5) |
| `paso-*.png` (7 archivos) | Íconos circulares de los 7 pasos del cronograma | |
| `branding-duende-logo-completo.png`, `-version-reducida.png`, `-mockup-remeras.png` | Caso Hostel "El Duende Errante" | |
| `planes-cinta-mas-elegido.png`, `cronograma-flecha.png` | Recursos gráficos de Canva | Se reemplazan por CSS/SVG |
| `ui-canva-sprite-descartar.png` | Sprite del reproductor de Canva | Se descarta |

**Faltantes que conviene pedirle a la marca:**
1. **Logo e isotipo en vector (SVG/AI/PDF).** Para el preloader y la navbar puedo recortar el isotipo del PNG de 799 px y vectorizarlo, pero un original siempre es mejor.
2. Un video en mejor resolución (mínimo 1920×1080) o material de b-roll propio.
3. Más casos de éxito con imágenes (hoy hay uno solo).

---

## 4. Estructura actual, sección por sección

Navbar fija: texto "Marketing by Clic" + 9 items en una sola línea (NOSOTROS · FOUNDER · PORTFOLIO · SERVICIO · TIEMPOS · PLANES · BRANDING · ASESORÍA 1:1 · CONTÁCTANOS).

| # | Sección (id de menú) | Fondo | Contenido | Altura desktop |
|---|---|---|---|---|
| 1 | Hero | `#223a8d` | Logo, titular, video de Ian, bajada. Íconos IG/WA casi invisibles | 1.871 px |
| 2 | Nosotros | `#223a8d` | "Somos Marketing by Clic", "Desde 1987", "De la gráfica al mundo digital", texto de presentación | 1.774 px |
| 3 | Founder | `#e3e8ff` | "Hola, soy Ian!", texto personal, foto, @ianmarketer | 1.159 px |
| 4 | Portfolio | `#223a8d` | "En nosotros podés confiar.", foto, "Nuestro trabajo", resultados en texto, botón "CASOS DE ÉXITO" | 1.918 px |
| 5 | Servicio | `#223a8d` | "¿Necesitás ayuda?", 3 bullets de enfoque, 3 pilares (como imagen) | 1.569 px |
| 6 | Tiempos | `#223a8d` | Cronograma: mes inicial (2 bloques de semanas, 7 pasos) + meses siguientes + nota de reportes | 1.518 px |
| 7 | Planes | `#98acd9` | 3 planes con precio, Sesión de fotos & videos, Servicios adicionales | 1.957 px |
| 8 | Branding | `#4667af` | "Branding Studio.", caso Hostel El Duende Errante (3 imágenes), texto | 1.762 px |
| 9 | Asesoría 1:1 | `#e3e8ff` | Título, 2 párrafos, botón CONTÁCTANOS | 1.115 px |
| 10 | Contacto / footer | `#223a8d` | "HAGAMOS CRECER TUS REDES", botón videollamada, logo, WhatsApp, Instagram | 1.702 px |

Total: **16.336 px** de alto en desktop.

---

## 5. Inventario de contenido (copy textual de la marca)

> El texto completo y ordenado está en `reference/content.json`. Acá va consolidado y legible.
> 🔸 = error tipográfico en el original. Lo mantengo hasta que me digas si se corrige (sugerencia al lado).

**Meta**
- Title: `Marketing by Clic`
- Description / OG: `MARKETING DIGITAL. Estrategias online que generan resultados`

**Hero**
- Convertimos tus redes en una herramienta de crecimiento.
- Potenciamos la comunicación de tu marca para convertir tus redes en un sistema de ventas.

**Nosotros**
- Somos Marketing by Clic
- Desde 1987
- De la gráfica al mundo digital.
- Un estudio estratégico de marketing digital nacido en la Patagonia.
- Conectamos negocios con la comunidad.
- Acompañamos cada marca de cerca y hacemos lo que realmente necesitan.

**Founder**
- Hola, soy Ian!
- Me apasionan el marketing y las personas detrás de cada negocio. Creé Marketing by Clic para ayudar a todas esas que marcas tienen 🔸(→ "a todas esas marcas que tienen") un gran producto, pero necesitan más claridad y estrategia. Hoy en día todos compiten por atención. Por eso creo que antes de publicar más, hay que entender hacia dónde queremos ir y construir una estrategia que tenga sentido para el negocio. Mi trabajo es ayudarte a ordenar, comunicar y hacer crecer tu marca, sin perder la esencia que la hace única 💙
- @ianmarketer — Seguime para aprender sobre negocios digitales

**Portfolio**
- En nosotros podés confiar.
- Nuestro trabajo
- Diseñamos estrategias digitales personalizadas para conectar tu marca con su audiencia, potenciando la presencia online para posicionarse mejor en el mercado.
- Con nuestros clientes, logramos potenciar su alcance y fortalecer su posición en el mercado, además de redefinir su identidad de marca y mejorar de su 🔸(→ "mejorar su") visibilidad, aumentando sus ventas mediante la integración de Meta Ads.
- A lo largo de nuestra trayectoria, acompañamos a marcas, profesionales y emprendimientos de distintos rubros a construir, comunicar y hacer crecer sus proyectos.
- Conocé algunos de los proyectos que ya confiaron en nosotros ↓
- Botón: CASOS DE ÉXITO

**Servicio**
- ¿Necesitás ayuda?
- Tenés tu propia historia y tus propios desafíos. Por eso, la prioridad es escucharte antes de actuar.
- **Análisis personalizado:** Identificamos juntos qué necesita tu negocio para crecer.
- **Soluciones a medida:** Planificamos estrategias creativas y prácticas para conectar con tus clientes.
- **Ejecución:** Implementamos las acciones para lograr el impacto que buscás.
- Pilares (transcritos de las imágenes):
  - **ESTRATEGIA** — Comprendemos tu negocio y diseñamos el mejor plan de acción 100% a medida.
  - **CONTENIDO** — Creamos contenido que conecta con tu audiencia, mejora tu visibilidad y supera tus objetivos.
  - **META ADS** — Creamos anuncios estratégicos para que vendas de verdad.

**Tiempos — Cronograma de Trabajo** (secuencia real → acá sí va numeración)
- Mes inicial
  - Semanas 1 y 2: Reunión inicial → Investigación y estrategia → Propuesta → Planificación y desarrollo
  - Semanas 3 y 4: Producción de contenidos → Aprobación de primeras piezas → Publicación
- Meses siguientes:
  - La renovación del contenido se planifica durante la última semana de cada mes.
  - Publicaciones períodicas 🔸(→ "periódicas") en los canales contratados.
  - Gestión a demanda de campañas de publicidad en Meta Ads* *(sujeto a disponibilidad del plan contratado)
  - Revisión constante de la estrategia general.
- De forma periódica, recibirán un reporte con los resultados de las actividades realizadas.

**Planes — Hagamos crecer tus redes.**

| | Inicial | Plus · *Más elegido* | Premium |
|---|---|---|---|
| Análisis | básico | avanzado | avanzado |
| Contenido / ADS | Contenido orgánico (sin ADS) | Contenido orgánico + 2 campañas de ADS* | Hasta 5 campañas de ADS simultáneas* |
| Canales | Hasta 2 canales (contenido replicado) | Hasta 3 canales (contenido adaptado) | Estrategia adaptada de canales (Sí, TODAS LAS REDES NECESARIAS) |
| Extra | — | — | Llamadas 1:1 semanales |
| Historias / mes | 8 | 12 | 12 |
| Posteos / mes | 6 | 8 | 8 |
| Reel/TikTok / mes | 2 | 4 | 8 |
| Precio | 115 usd / cada mes | 135 usd / cada mes | 155 usd / cada mes |

\*inversión cotiza aparte

- **Sesión de fotos & videos** — 100 USD · Sujeto a disponibilidad
  Jornada intensiva de 2hs de creación de contenido de alta calidad realizada con UGC y cámara de dispositivo iPhone enfocada en generar contenido auténtico, dinámico y alineado a tu marca. El objetivo es mostrar el uso de tus productos y/o servicios de forma real y cercana, priorizando formatos que se adapten a los requerimientos actuales de las redes sociales (reels, stories e imágenes).
- **Servicios adicionales** — Consúltanos :)
  Branding personalizado · Sitio web / e-commerce · E-mail marketing · ~~Sitio web / e-commerce~~ 🔸(duplicado) · Diseño gráfico profesional · Fotografía profesional · Campañas de ADS extra · Canales extra · Soluciones logísticas
  **Nuevo!** Asesoría completa de marketing digital

**Branding**
- Branding Studio.
- Caso de éxito: Hostel "El Duende Errante" — Logo completo · Versión reducida · Mockup
- Tu marca necesita más que un logo: necesita una identidad.
- En Clic desarrollamos manuales de marca completos: incluyendo logo, colores, tipografías, usos, aplicaciones e incluso mockups para que tu comunicación sea coherente, profesional y reconocible. Diseñamos identidades visuales con estrategia, criterio estético y la experiencia de diseñadores con más de 10 años en el rubro.
- Solicitá tu manual de marca personalizado. (link a WhatsApp)

**Asesoría 1:1**
- Recibí una asesoría 1:1 100% personalizada
- ¿Sentís que tu negocio tiene potencial para crecer, pero no tenés claro cuál es el siguiente paso? 🤔📈
- A través de nuestras asesorías estratégicas te ayudamos a ordenar ideas, detectar oportunidades y definir un camino claro para crecer con intención.
- Escribinos ahora y conversemos sobre tu proyecto.
- Botón: CONTÁCTANOS

**Contacto / footer**
- HAGAMOS CRECER TUS REDES
- Más visibilidad, más clientes, más ventas.
- Botón: AGENDÁ UNA VIDEOLLAMADA GRATUITA
- +54 9 2944 12-6756
- @marketingbyclic

**Datos de contacto y redes** (`reference/links.json`)

| Canal | Destino | Dónde se usa hoy |
|---|---|---|
| WhatsApp directo | `http://wa.me/5492944126756` | Ícono del hero, teléfono del footer |
| WhatsApp mensaje prearmado | `https://wa.me/message/2SGQE2CNFXEDF1` | Casos de éxito, Branding, Asesoría, Agendá videollamada |
| Instagram marca | `https://www.instagram.com/marketingbyclic/` | Ícono del hero, ícono del footer |
| Instagram founder | `https://www.instagram.com/ianmarketer` | Founder y, por error, el texto "@marketingbyclic" del footer |

No hay **email**, formulario, páginas legales ni política de privacidad.

---

## 6. Problemas de UX de la web actual

**Conversión**
1. **El hero no tiene CTA.** El único contacto arriba del pliegue son los íconos IG/WA, que son azul `#1f3a8c` sobre azul `#223a8d` (contraste ≈1:1): **son invisibles**.
2. **"CASOS DE ÉXITO" promete un portfolio y abre WhatsApp.** Rompe la expectativa justo en la sección de confianza.
3. Los CTAs dicen cosas distintas ("CONTÁCTANOS", "contáctanos", "AGENDÁ UNA VIDEOLLAMADA GRATUITA", "Solicitá tu manual…") pero todos van al mismo link. No hay un CTA principal reconocible.
4. **Bug:** el texto "@marketingbyclic" del footer lleva al Instagram de **@ianmarketer**.

**Arquitectura y navegación**

5. El menú tiene 9 items en una línea, con nombres internos ("TIEMPOS", "FOUNDER") y repite la marca como texto al lado de un logo que ya la muestra.
6. Los items del menú van todos a `/`: no hay anclas en la URL, no se puede compartir una sección y "atrás" no funciona como se espera.
7. El orden no sigue el razonamiento de quien compra: quién somos → founder → "confiá en nosotros" → recién después qué hacemos → cuándo → cuánto. La prueba social (portfolio) llega antes de entender el servicio, y Branding y Asesoría quedan después de los precios, como si fueran secundarios.
8. Contenido fragmentado y repetido: "Hagamos crecer tus redes" aparece como título de Planes y otra vez como cierre. Los 3 bullets de Servicio y los 3 pilares dicen casi lo mismo de dos formas.

**Jerarquía visual**

9. Tres familias tipográficas sin criterio. Títulos de tamaño parecido y en caja mixta: nada domina.
10. **Grandes vacíos sin intención** (500–800 px de azul vacío al final de Hero, Nosotros, Portfolio y Contacto), por las alturas fijas de Canva. La página mide 16.000 px para poco contenido.
11. Planes: texto blanco sobre celeste/powder **no pasa WCAG** (2.0–2.3:1), justo donde se decide la compra.
12. Los pilares de Servicio son **imágenes con texto**: no se indexan, no los leen los lectores de pantalla y se ven borrosos en pantallas retina.

**Mobile** (capturas `reference/screenshots/home-mobile-*`)

- El hamburguesa abre la misma lista de 9 items. En la barra no hay logo ni contacto.
- El hero ocupa casi **dos pantallas**: el logo grande y un titular de 6 líneas empujan el video y la bajada fuera del primer viewport, y sigue sin haber CTA.
- Los planes se apilan uno debajo del otro: para comparar Inicial, Plus y Premium hay que scrollear ~3 pantallas y recordar los datos. Mantienen los problemas de contraste de desktop.
- "Servicios adicionales" es una lista larga de 10 ítems en negrita (con el duplicado) dentro de una card con mucho espacio vacío abajo.

**Técnica / SEO / accesibilidad**

13. El scroll ocurre en un `div` interno, no en el documento. Se pierden la restauración de scroll y el comportamiento nativo en mobile, y aparece un segundo scrollbar.
14. No hay `h1`/`h2` reales. El texto visible está partido letra por letra y el contenido real vive en una capa oculta. Malo para SEO y para lectores de pantalla.
15. Video del hero: es un talking head **sin audio ni subtítulos**, así que en autoplay mudo el mensaje se pierde. Además es de baja resolución (832×464).
16. SEO mínimo: title de 3 palabras, sin `og:image`, meta description en mayúsculas.
17. Peso: el runtime de Canva declara 67 `@font-face` y carga varios bundles de JS para una página estática.
18. Errores de copy: 3 typos y un ítem duplicado (ver 🔸 en §5).

---

## 7. Nueva arquitectura propuesta

**Principio:** contar la historia en el orden en que alguien decide contratar. *Qué te prometo → por qué creerme → qué hago → cómo lo hago → cuánto cuesta → hablemos.*

| # | Sección nueva | Fuente (sección actual) | Tratamiento |
|---|---|---|---|
| — | **Preloader** | Logo + meta description | "MARKETING BY CLIC" gigante en Montserrat Black sobre `brand-paper`, isotipo chico, tagline "Estrategias online que generan resultados" abajo a la derecha. La línea de video se abre, hace el hold y se expande a fullscreen |
| 1 | **Hero** | Hero | Video de fondo (handoff del preloader) con overlay `brand-deep`. Titular "Convertimos tus redes en una herramienta de crecimiento." con SplitText por líneas, la bajada y **CTA principal a WhatsApp** |
| 2 | **Manifiesto** | Nosotros | "Un estudio estratégico de marketing digital nacido en la Patagonia. Conectamos negocios con la comunidad. Acompañamos cada marca de cerca…" en texto grande, revelado palabra por palabra con scrub. Al costado: "Desde 1987 · De la gráfica al mundo digital." como dato ancla |
| 3 | **Servicios** | Servicio + Branding + Asesoría + Sesión de fotos | **Lista tipo índice** con filas enormes: Estrategia · Contenido · Meta Ads · Branding · Asesoría 1:1 · Sesión de fotos & videos. En hover, imagen que sigue al cursor + descripción corta (textos reales de cada bloque). En mobile, acordeón. Debajo, los 3 principios "Análisis personalizado / Soluciones a medida / Ejecución" como línea editorial |
| 4 | **Proceso** | Tiempos | Sección pineada con scroll horizontal: 7 pasos **numerados 01–07** (es una secuencia real) agrupados en "Semanas 1 y 2" / "Semanas 3 y 4", y al final "Meses siguientes" + la nota del reporte periódico |
| 5 | **Planes** | Planes | 3 planes en columnas comparables (tabla legible, con contraste corregido), "Más elegido" en Plus. Servicios adicionales como lista compacta (sin el duplicado) |
| 6 | **Caso de éxito** | Portfolio + Branding | "En nosotros podés confiar." + "Nuestro trabajo" + el caso **Hostel El Duende Errante** (3 imágenes con reveal por clip-path y parallax). Sin contadores ni testimonios: **no hay cifras ni testimonios reales** y no se inventan. El botón "Casos de éxito" se reemplaza por un CTA honesto `// TODO copy` |
| 7 | **Founder** | Founder | "Hola, soy Ian!" + texto + foto con reveal + link a @ianmarketer. Humaniza justo antes del cierre |
| 8 | **CTA final** | Asesoría + Contacto | Bloque `brand-primary` a pantalla completa: "HAGAMOS CRECER TUS REDES" gigante, "Más visibilidad, más clientes, más ventas." y botón magnético "AGENDÁ UNA VIDEOLLAMADA GRATUITA" |
| 9 | **Footer** | Contacto | "MARKETING BY CLIC" de borde a borde (eco del preloader), WhatsApp, Instagram (link corregido), @ianmarketer |

**Menú fullscreen** (serif condensada, mayúsculas): `SERVICIOS · PROCESO · PLANES · CASOS · NOSOTROS · CONTACTO` — `// TODO copy`: los labels son propuesta mía, mapeados a las secciones nuevas. Fila secundaria: WhatsApp · Instagram · @ianmarketer (no hay páginas legales). Microtexto inferior: `+54 9 2944 12-6756`.

**Navbar:** izquierda los íconos IG/WA dibujados a mano (versión clara/oscura según fondo), centro el logo, derecha "MENÚ".

**Microcopy nuevo propuesto (`// TODO copy`, a revisar):**
- CTA hero: "Hablemos por WhatsApp"
- Label del bloque de pilares: "Qué hacemos"
- Reemplazo de "CASOS DE ÉXITO": "Contanos tu proyecto"
- Label del proceso: "Cómo trabajamos"
- Aria-labels y textos alternativos de imágenes

---

## 8. Decisiones que necesito antes de seguir

1. **Video del preloader y del hero.** El único video es Ian hablando a cámara, 832×464, sin audio. Como línea fina y rectángulo apaisado funciona, pero **a pantalla completa se va a ver pixelado** y, sin audio, el mensaje se pierde. Opciones:
   - **a)** Usarlo igual (es el material real de la marca).
   - **b) (recomendada)** Poner un **b-roll de stock libre de derechos** como placeholder (manos en un teléfono, redes, cámara, Patagonia) hasta tener video propio en 1080p, y llevar el video de Ian a la sección Founder, donde tiene sentido.
2. **Tipografía display:** Montserrat Black (recomendada, continuidad de marca) o Archivo expandida (más carácter).
3. **Typos y duplicado** (🔸 en §5): ¿se corrigen en el rediseño?
4. **Bug del footer:** ¿"@marketingbyclic" debe apuntar a la cuenta de la marca? Asumo que sí.
5. **Labels del menú** y microcopy marcado `// TODO copy`.
6. **Logo vector:** si lo conseguís en SVG, lo uso. Si no, vectorizo el isotipo desde el PNG.
