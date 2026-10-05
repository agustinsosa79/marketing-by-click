/**
 * El preloader corre siempre al entrar al inicio (desde Google, un link, una pestaña nueva o al recargar),
 * salvo cuando se llega navegando desde otra página del sitio (ej. del blog a /#planes): ahí el inicio
 * entra con una versión corta. index.html lo detecta antes del primer pintado y marca html[data-from-site],
 * que oculta el preloader con CSS.
 */
export function cameFromSite() {
  return typeof document !== 'undefined' && document.documentElement.hasAttribute('data-from-site')
}
