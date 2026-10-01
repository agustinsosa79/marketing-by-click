# Referencias: Awwwards SOTD

Qué tomamos de cada referencia del brief v2 y dónde aparece en el sitio.

Datos de Awwwards (fechas, paleta y stack) relevados el 01/10/2026. Los patrones que van de la sección 1 a la 5 son lectura propia de cada sitio y su ficha.

| Referencia | Ficha | Dato clave |
|---|---|---|
| Locomotive (estudio, agencia del año en Awwwards) | [awwwards.com/locomotive](https://www.awwwards.com/locomotive/) | Creadores de Locomotive Scroll. SOTD recientes, todos con Developer Award: L.I.S.A. (16/09/2026), Wolverine Worldwide, Truck'N Roll®, Dulcedo, Lightship |
| Butter, de ToyFight | [awwwards.com/sites/butter](https://www.awwwards.com/sites/butter) | SOTD 28/09/2026. Dos colores (#1E1E1E / #F7F7F7), interfaz tipo app, video como protagonista |
| digitalists | [awwwards.com/digitalists](https://www.awwwards.com/digitalists/) | SOTD + Developer Award 21/06/2026. Agencia austríaca: el detalle está en la ingeniería de las interacciones |
| Noomo Showcase | [uicoach.io/…/noomo-showcase](https://www.uicoach.io/inspirations/award-winning/noomo-showcase) | SOTD 01/08/2026. En vez de un showreel, una vitrina inmersiva. Paleta #0004EB + #020411: azul eléctrico sobre casi negro |
| Studio K95 | [awwwards.com/sites/studio-k95-3](https://www.awwwards.com/sites/studio-k95-3) | SOTD 11/08/2026. Un solo color dominante (#1500E1), estética editorial, GSAP, loader de entrada |

---

## 1. Monocromo azul con mucho rango tonal (K95, Noomo)

Dos de las cinco referencias trabajan con **un solo azul eléctrico y un casi-negro azulado**, igual que la identidad de Clic. Esto confirma que no hace falta sumar colores: la paleta solo necesita más rango.

- Sumamos `brand-night` (#0c1640, derivado de `brand-deep`) como el casi-negro de la marca: manifiesto, proceso, menú y footer.
- `brand-sky` (#42b8fd, medido en el sitio actual) funciona como el "eléctrico": rellenos, progreso, cursor y stickers.
- El fondo de la página interpola entre secciones (`data-bg`), así que el recorrido se lee como un solo plano azul que cambia de temperatura.

## 2. Scroll suave como base de todo (Locomotive)

- Lenis con `lerp 0.06`, sincronizado con el ticker de GSAP: todos los scrubs (hero, manifiesto, frase horizontal, cards apiladas) se leen sobre el mismo scroll suavizado.
- Las cintas de la sección Historia se inclinan y aceleran con `lenis.velocity`: la velocidad del scroll se convierte en movimiento.
- Footer con revelado tipo telón: `<main>` sube y deja ver el footer, que espera debajo.

## 3. El video como protagonista (Butter)

- El video del preloader nunca se desmonta: pasa a ser el fondo del hero y, con el scroll, se recorta en una tarjeta. El titular está duplicado (claro adentro del recorte, azul afuera), así que el texto "cambia de color" sin moverse.
- El video de Ian tiene interfaz propia, como un reproductor de app:
  - preview muda que corre mientras está en pantalla;
  - CTA circular "Mirá el video · con sonido";
  - play/pausa, barra con seek, tiempo, mute y atajos de teclado;
  - se pausa solo al salir de pantalla.

## 4. Vitrina en vez de lista (Noomo)

- Servicios funciona como un índice de filas gigantes: el hover rellena la fila desde el borde por donde entra el mouse y una imagen sigue al cursor con retraso e inclinación según la velocidad.
- Al hacer clic, la fila se expande: las filas de abajo se deslizan (FLIP) y la imagen del cursor aterriza en el panel.

## 5. Estética editorial brutalista (K95, digitalists)

- Etiquetas en mono (Space Mono) entre paréntesis, líneas divisorias que se dibujan con `scaleX`, bordes duros de 2 px y sombras sólidas desplazadas (sin blur).
- Tipografía en tres capas:
  - Montserrat Black gigante, para la voz de la marca;
  - Instrument Serif itálica, para el acento;
  - mono, para los datos.
- Stickers circulares con texto girando ("Más elegido", "Con sonido"), cintas cruzadas y texto con contorno.
- Los botones se hunden contra su sombra al presionarlos (`translate` + `scale 0.97`). Además son magnéticos y hacen roll de letras.

---

## Lo que no tomamos (y por qué)

- **WebGL / Three.js** (K95, Noomo, Butter): el material de la marca es un video de 832×464 y fotos. Un efecto 3D sin contenido 3D sería decoración. Además, el presupuesto de performance (Lighthouse > 90) no lo banca en mobile.
- **Números de sección 01/02/03:** el brief los prohíbe salvo en secuencias reales. Solo los usa el Proceso, que tiene 7 pasos.
- **Testimonios, logos de clientes o métricas inventadas:** la sección de números usa únicamente datos que la marca publica: 1987, +10 años en el rubro y 100% a medida.
