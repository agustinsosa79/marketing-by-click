import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import './styles/index.css'
import { App } from './app/App'

// Hoja de Google Fonts: arranca deshabilitada en index.html para no competir con el primer pintado
const googleFonts = document.getElementById('google-fonts') as HTMLLinkElement | null
if (googleFonts) googleFonts.disabled = false

const root = document.getElementById('root')!
const app = (
  <StrictMode>
    <App />
  </StrictMode>
)

// En producción el HTML viene prerenderizado (scripts/prerender.mjs): se hidrata. En dev se renderiza.
if (root.hasChildNodes()) hydrateRoot(root, app)
else createRoot(root).render(app)
