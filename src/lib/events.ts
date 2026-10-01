/** Eventos de página entre secciones que no comparten estado de React. */
export const PLAY_FOUNDER_VIDEO = 'mbc:play-founder-video'

export function playFounderVideo() {
  window.dispatchEvent(new CustomEvent(PLAY_FOUNDER_VIDEO))
}
