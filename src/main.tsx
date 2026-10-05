import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import './styles/index.css'
import { App } from './app/App'
import { normalizePath, resolveRoute } from './app/routes'
import { loadPost } from './lib/blog'

// Hoja de Google Fonts: arranca deshabilitada en index.html para no competir con el primer pintado
const googleFonts = document.getElementById('google-fonts') as HTMLLinkElement | null
if (googleFonts) googleFonts.disabled = false

const root = document.getElementById('root')!
const path = normalizePath(location.pathname)
const route = resolveRoute(path)

// La página de una nota necesita su contenido antes de hidratar (es un chunk aparte)
const post = route.name === 'post' ? await loadPost(route.slug) : null

const app = (
  <StrictMode>
    <App route={route} post={post} />
  </StrictMode>
)

// En producción cada ruta viene prerenderizada (scripts/prerender.mjs): se hidrata si el HTML es de esta ruta.
// Si no (dev, o un servidor que devuelve otro HTML), se renderiza desde cero.
if (root.hasChildNodes() && root.dataset.route === path) hydrateRoot(root, app)
else {
  root.textContent = ''
  createRoot(root).render(app)
}
