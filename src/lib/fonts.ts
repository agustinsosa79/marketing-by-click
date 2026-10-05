/**
 * Las fuentes de Google se cargan sin bloquear el render (link media="print" → "all" en index.html).
 * `document.fonts.ready` solo no alcanza: si la hoja todavía no llegó, resuelve antes de que existan
 * los @font-face. Esto espera la hoja + las caras que usa el sitio, con un tope de tiempo.
 */
let pending: Promise<void> | null = null

/**
 * Espera solo una cara (ej. la del wordmark del preloader) sin esperar al resto de las fuentes.
 * `googleSheet: false` para las caras propias (@font-face local): no dependen de la hoja de Google.
 */
export function fontReady(spec: string, { googleSheet = true, timeout = 2500 } = {}): Promise<void> {
  const link = document.getElementById('google-fonts') as HTMLLinkElement | null
  const sheet = new Promise<void>((resolve) => {
    if (!googleSheet || !link || link.media === 'all') return resolve()
    link.addEventListener('load', () => resolve(), { once: true })
    link.addEventListener('error', () => resolve(), { once: true })
  })
  const face = sheet.then(() => document.fonts.load(spec)).then(() => undefined).catch(() => undefined)
  return Promise.race([face, new Promise<void>((r) => setTimeout(r, timeout))])
}

export function fontsReady(timeout = 4000): Promise<void> {
  if (pending) return pending

  const sheet = new Promise<void>((resolve) => {
    const link = document.getElementById('google-fonts') as HTMLLinkElement | null
    if (!link || link.media === 'all') return resolve()
    link.addEventListener('load', () => requestAnimationFrame(() => resolve()), { once: true })
    link.addEventListener('error', () => resolve(), { once: true })
  })

  const faces = sheet
    .then(() =>
      Promise.all([
        document.fonts.load('900 1em "Montserrat Display"'),
        document.fonts.load('800 1em Montserrat'),
        document.fonts.load('700 1em Montserrat'),
        document.fonts.load('500 1em Montserrat'),
      ]),
    )
    .then(() => document.fonts.ready)
    .then(() => undefined)
    .catch(() => undefined)

  pending = Promise.race([faces, new Promise<void>((r) => setTimeout(r, timeout))])
  return pending
}
