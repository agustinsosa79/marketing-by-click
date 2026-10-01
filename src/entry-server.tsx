import { StrictMode } from 'react'
import { renderToString } from 'react-dom/server'
import { App } from './app/App'

/**
 * Prerender en el build (scripts/prerender.mjs): el HTML inicial ya trae el preloader, la navbar y el hero,
 * así el wordmark se pinta con CSS antes de que baje y corra el JS. Las secciones de abajo del pliegue
 * son lazy: quedan fuera del HTML y se renderizan en el cliente.
 */
export function render() {
  return renderToString(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}
