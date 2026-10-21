/**
 * La tipografía de marca (Carlito) está alojada en el sitio y precargada en index.html.
 * `document.fonts.load` de cada cara asegura que esté lista antes de medir/partir texto, con un tope de tiempo.
 */
let pending: Promise<void> | null = null

const withTimeout = (p: Promise<unknown>, timeout: number) =>
  Promise.race([p.then(() => undefined).catch(() => undefined), new Promise<void>((r) => setTimeout(r, timeout))])

/** Espera solo una cara (ej. la del wordmark del preloader) sin esperar al resto. */
export function fontReady(spec: string, { timeout = 2500 } = {}): Promise<void> {
  return withTimeout(document.fonts.load(spec), timeout)
}

export function fontsReady(timeout = 4000): Promise<void> {
  if (pending) return pending
  const faces = Promise.all([
    document.fonts.load('700 1em Carlito'),
    document.fonts.load('400 1em Carlito'),
    document.fonts.load('italic 700 1em Carlito'),
  ]).then(() => document.fonts.ready)
  pending = withTimeout(faces, timeout)
  return pending
}
