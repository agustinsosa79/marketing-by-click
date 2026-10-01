# Plan de rediseño (v2)

Dirección: **brutalismo editorial azul**. La marca es monocromática, así que el contraste sale de la escala (tipografía gigante contra etiquetas mono chiquitas), de la estructura visible (líneas, bordes duros, sombras sólidas) y del movimiento. No suma colores.

## Sistema

| Pieza | Decisión | Dónde vive |
|---|---|---|
| Color de página | `--page-bg` / `--page-fg` interpolados por scroll según el `data-bg` de cada sección | `hooks/usePageColors.ts`, `lib/pageColors.ts` |
| Tokens nuevos | `brand-night` #0c1640 y `brand-sky` #42b8fd; escalas `text-hero`, `text-mega`, `text-index`, `text-step`, `text-statement` | `styles/index.css` (`@theme`) |
| Tipografías | `.font-display` (Montserrat 900), `.font-body`, `.font-accent` (Instrument Serif itálica), `.font-editorial` (serif recta, menú), `.font-label` (Space Mono) | `index.html` (link) y `styles/index.css` |
| Motion | Eases `reveal` / `hop` / `power3.out`. Duraciones 0.35 / 0.8 / 1.2. Staggers 0.02 (chars) / 0.04 (words) / 0.08 (lines) | `lib/motion.ts` |
| Entradas | `data-reveal="lines\|words\|chars\|fade\|rule\|clip\|pop"`: ningún elemento aparece sin animación | `setupReveals()` en `lib/motion.ts` |
| Scroll | Lenis (`lerp 0.06`, `respectReducedMotion: false`) + ticker de GSAP | `lib/lenis.ts` |
| Versión reducida | Solo con `?motion=reduce`: fades, sin desplazamientos | `hooks/useReducedMotion.ts` |

## Microinteracciones

- **Cursor propio:** punto con `mix-blend-difference` y burbuja `brand-sky` con etiqueta: VER en servicios, PLAY / PAUSA en el video, ESCRIBINOS en los CTA.
- **Botones:**
  - borde duro y sombra sólida;
  - hover: relleno que sube, roll de letras y el botón se despega de la sombra;
  - press: se hunde contra la sombra (`scale 0.97`);
  - magnéticos en los CTA principales.
- **Links:** subrayado que se dibuja de izquierda a derecha y se retira hacia la derecha.
- **Imágenes:** zoom al hover dentro de su marco y parallax suave.
- **Navbar:**
  - se esconde al bajar y vuelve compacta al subir, con el color de página al 80% y blur;
  - barra de progreso `brand-sky`;
  - hora de Argentina en vivo;
  - íconos que giran al hover y MENÚ con roll.
- **Menú:** panel `brand-night` con patrón de flechas del isotipo. La página se achica a tarjeta y los items pasan de blur a nítido.

## Secciones (orden nuevo)

1. **Hero** (200svh, sticky). El video del preloader queda a pantalla completa con el titular "Estrategias online que *generan* resultados." encima. Con el scroll se recorta en una tarjeta y el titular duplicado queda claro adentro y azul afuera.
   - Barra inferior con datos reales e indicador de scroll.
   - CTA de WhatsApp.
   - Acceso directo "Conocé a Ian · video con sonido", que lleva al video y lo arranca.
2. **Manifiesto** (`night`). La frase se enciende palabra por palabra (scrub), con tres píldoras de fotos reales que se abren dentro del texto. "Patagonia" va en serif itálica `brand-sky`.
3. **Founder** (`paper`). Movido desde el final para que el video de Ian aparezca temprano y grande (8 de 12 columnas), con reproductor propio y sonido. Al lado: el texto de Ian y la card de @ianmarketer.
4. **Historia** (`deep`).
   - "Desde" + odómetro "1987".
   - "De la gráfica al mundo digital." recorre la pantalla en horizontal, con pausa al entrar y al salir para que se lea antes de moverse.
   - Dos cintas cruzadas que reaccionan a la velocidad del scroll.
5. **Servicios** (`paper`). Principios en tabla de tres columnas. Debajo, el índice de seis servicios con hover, imagen que sigue al cursor, expand con FLIP y CTA a WhatsApp. En mobile es un acordeón.
6. **Proceso** (`night`). Cards apiladas con sticky, una por paso (01–07, la única secuencia real). La de abajo se achica y se oscurece. Cada card trae una barra de 7 segmentos con el avance. Cierra con "Meses siguientes".
   - Reemplaza al scroll horizontal anterior, que arrancaba antes de tiempo y cortaba la primera card.
7. **Planes** (`paper`). Cards brutalistas con precio en odómetro y sticker "Más elegido" en el dorado original de la marca. En mobile, carrusel con snap. Además: Sesión de fotos & videos y Servicios adicionales como chips.
8. **Casos** (`primary`). "En nosotros podés confiar", números reales (1987 · +10 años · 100% a medida) y el caso Branding Studio (Hostel El Duende Errante).
9. **CTA final** (`sky`). "¿HABLAMOS?" `// TODO copy`, de borde a borde y letra por letra. Lleva la pregunta real de Asesoría 1:1 y el botón magnético "Agendá una videollamada gratuita".
10. **Footer** (`night`). Revelado tipo telón con parallax, wordmark letra por letra, navegación, contacto y hora.

## Bugs del feedback y cómo se resolvieron

| Captura | Problema | Solución |
|---|---|---|
| Servicios, "Fotos & videos" | La imagen del cursor y la del panel se veían a la vez, y el texto quedaba debajo de la imagen | La imagen del cursor se oculta cuando la fila está abierta y "aterriza" en el panel. La descripción vive solo en el panel |
| Servicios, "BRANDINGTu marca…" | El hover desplazaba el nombre sobre la descripción | Grilla de 12 columnas: nombre, etiqueta e ícono en columnas separadas, sin desplazamientos |
| Proceso | El scroll horizontal arrancaba antes de llegar y cortaba la primera card. Las cards se veían vacías | Cards apiladas verticales que nunca se mueven antes de verse enteras. Composición en banda (número, nombre, ícono y progreso) |
| Planes | Cards genéricas | Estilo brutalista: borde duro, sombra sólida, odómetro y sticker |
| Hero | "Web vieja": overlay azul pesado y layout genérico | Video limpio con degradé solo para legibilidad, titular gigante, recorte a tarjeta con el scroll y datos en mono |
| Video de Ian | No se podía pausar ni escuchar, y estaba escondido | Reproductor propio con sonido, en la tercera sección, con acceso directo desde el hero |

## Performance (Lighthouse > 90)

| Problema medido | Solución |
|---|---|
| Una tarea larga de ~1,5 s al cargar: todas las secciones armaban sus animaciones en el mismo commit de React | Las secciones de abajo del pliegue van en un chunk aparte (`app/BelowFold.tsx`, `React.lazy`) y arman sus animaciones en tareas sueltas con `requestIdleCallback` (`lib/schedule.ts`) mientras corre el preloader. Al final hay un solo `ScrollTrigger.refresh()` |
| Roll de letras partido en decenas de botones al cargar | `RollText` parte el texto recién en el primer hover |
| Animaciones infinitas corriendo fuera de pantalla | Las cintas, los stickers, el anillo del video, el patrón del menú y el indicador de scroll se pausan cuando no se ven |
| LCP: el wordmark esperaba al JS y a la hoja de Google Fonts | Montserrat Black alojada localmente (`public/fonts`, 18 KB) y precargada. Tamaño del wordmark por CSS (`text-wordmark`). Entrada por animación CSS que después toma GSAP. HTML inicial prerenderizado en el build (`src/entry-server.tsx` + `scripts/prerender.mjs`), con el JS ejecutándose después del primer pintado |
| Video del hero de 4,6 MB precargado desde el arranque | Recomprimido a 790 KB (H.264 CRF 29, 720p, sin audio). Empieza a bajar recién cuando arranca el preloader. El original quedó en `reference/stock/hero-original.mp4` |

`npm run lighthouse` (mobile) y `npm run lighthouse -- desktop` corren contra `npm run preview`.
