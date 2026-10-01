/**
 * Mide un fotograma del preloader (referencia o implementación) en % del viewport.
 * Se ejecuta dentro de Chromium (page.evaluate) sobre un data URL.
 *
 * - rect:  filas donde la banda central x∈[20%,80%] es ≥98.5% "no fondo" → el video recortado.
 * - title: filas con píxeles oscuros en x∈[0.5%,14%] (la primera letra del wordmark; el video
 *          nunca llega a esa zona).
 * - below: primer bloque de píxeles oscuros en la banda central debajo del video
 *          (isotipo o frase).
 */
export const measureInPage = async (dataUrl) => {
  const img = new Image()
  img.src = dataUrl
  await img.decode()
  const W = img.naturalWidth
  const H = img.naturalHeight
  const c = document.createElement('canvas')
  c.width = W
  c.height = H
  const x = c.getContext('2d', { willReadFrequently: true })
  x.drawImage(img, 0, 0)
  const d = x.getImageData(0, 0, W, H).data
  const px = (cx, cy) => {
    const i = (cy * W + cx) * 4
    return [d[i], d[i + 1], d[i + 2]]
  }
  const bg = px(Math.round(W * 0.02), Math.round(H * 0.02))
  const dist = (a, b) => Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) + Math.abs(a[2] - b[2])
  const isBg = (p) => dist(p, bg) < 45
  const isDark = (p) => 0.3 * p[0] + 0.59 * p[1] + 0.11 * p[2] < 110

  const pct = (v, total) => Math.round((v / total) * 1000) / 10
  const rectRows = []
  const titleRows = []
  // se ignora el borde superior (las grabaciones de pantalla traen una línea del navegador)
  for (let y = Math.round(H * 0.015); y < H; y++) {
    let non = 0
    let n = 0
    for (let cx = Math.round(W * 0.2); cx < W * 0.8; cx += 2) {
      n++
      if (!isBg(px(cx, y))) non++
    }
    if (non / n >= 0.985) rectRows.push(y)
    for (let cx = Math.round(W * 0.005); cx < W * 0.14; cx += 2) {
      if (isDark(px(cx, y))) {
        titleRows.push(y)
        break
      }
    }
  }
  const rect = rectRows.length ? { top: pct(rectRows[0], H), bottom: pct(rectRows[rectRows.length - 1] + 1, H) } : null
  if (rect) {
    // bordes laterales en la fila central del video
    const y = Math.round(((rectRows[0] + rectRows[rectRows.length - 1]) / 2))
    let l = Math.round(W / 2)
    while (l > 0 && !isBg(px(l - 1, y))) l--
    let r = Math.round(W / 2)
    while (r < W - 1 && !isBg(px(r + 1, y))) r++
    rect.left = pct(l, W)
    rect.right = pct(r + 1, W)
  }
  const title = titleRows.length ? { top: pct(titleRows[0], H), bottom: pct(titleRows[titleRows.length - 1] + 1, H) } : null

  // bloque oscuro debajo del video (isotipo / frase), banda central
  const from = rect ? rectRows[rectRows.length - 1] + Math.round(H * 0.01) : title ? titleRows[titleRows.length - 1] + Math.round(H * 0.02) : 0
  let bTop = -1
  let bBottom = -1
  for (let y = from; y < H * 0.975; y++) {
    let dark = false
    for (let cx = Math.round(W * 0.4); cx < W * 0.6; cx += 1) {
      if (isDark(px(cx, y))) {
        dark = true
        break
      }
    }
    if (dark && bTop < 0) bTop = y
    if (dark) bBottom = y
    if (!dark && bTop >= 0 && y - bBottom > H * 0.02) break
  }
  const below = bTop >= 0 ? { top: pct(bTop, H), bottom: pct(bBottom + 1, H) } : null
  return { rect, title, below }
}
