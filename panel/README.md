# Panel del blog

App aparte para que el cliente cree, edite y borre notas del blog sin tocar código.

```
cliente ──► panel (link de Vercel, con contraseña)
               │  "Publicar" = 1 commit en GitHub (content/blog/*.md + public/media/blog/*.webp)
               ▼
            GitHub ──► Vercel reconstruye marketingbyclic.com  (1–2 min)
```

No hay base de datos: las notas siguen siendo los `.md` del repo y el sitio las prerenderiza como siempre. El cliente no necesita cuenta de GitHub.

## Ponerlo online (una sola vez, ~5 minutos)

> Antes: el panel guarda en `master`. El blog nuevo tiene que estar en `master` (mergear `rediseno-completo`).

**1. GitHub → crear la llave** — <https://github.com/settings/personal-access-tokens/new>

- Token name: `panel blog`
- Expiration: 1 año
- Repository access: **Only select repositories** → `marketing-by-click`
- Permissions → **Contents** → **Read and write**
- Generate token → copiar (empieza con `github_pat_`)

**2. Vercel → nuevo proyecto** — <https://vercel.com/new>

- Importar el repo `marketing-by-click`
- **Root Directory** → Edit → `panel`
- **Environment Variables:**

| Name | Value |
|---|---|
| `PANEL_PASSWORD` | la contraseña del cliente (12 caracteres o más) |
| `GITHUB_TOKEN` | la llave del paso 1 |

- Deploy

**3. Listo.** Vercel da el link (ej. `marketing-by-click-panel.vercel.app`). Ese link + la contraseña es lo que se le pasa al cliente.

Si algo quedó mal configurado, el panel lo dice al abrirlo (ej. *"Falta la variable GITHUB_TOKEN"*).

### Opcionales

- **Dominio propio** (`panel.marketingbyclic.com`): Settings → Domains. No hace falta, el link de Vercel funciona igual.
- **Que no se reconstruyan de más:** Settings → Build and Deployment → Ignored Build Step → Custom. En el panel `git diff --quiet HEAD^ HEAD -- .`; en el sitio `git diff --quiet HEAD^ HEAD -- . ':(exclude)panel'`. Sin esto todo funciona igual, solo hay builds de más.
- `GITHUB_BRANCH` (por defecto `master`) y `GITHUB_REPO` (por defecto `agustinsosa79/marketing-by-click`) si alguna vez cambian.

## Mantenimiento

- **Cambiar la contraseña:** editar `PANEL_PASSWORD` en Vercel → Redeploy. Se cierran todas las sesiones abiertas.
- **La llave vence al año:** el panel avisa *"El panel perdió el permiso para guardar en la web"*. Repetir el paso 1, reemplazar `GITHUB_TOKEN` → Redeploy.
- **Dos cambios a la vez:** si alguien commitea en `master` justo mientras el cliente guarda, el panel no pisa nada: pide volver a guardar.

## Seguridad

| Qué | Cómo |
|---|---|
| Entrar | Contraseña solo en el servidor (variable cifrada de Vercel). Sesión en cookie firmada (HMAC) `HttpOnly · Secure · SameSite=Strict`, 7 días. |
| Fuerza bruta | 700 ms por intento fallido; tras 5 fallos, espera creciente hasta 15 min. |
| Pedidos de otros sitios | Login y cambios exigen `Origin` igual al del panel. |
| Qué puede escribir | Solo `content/blog/*.md` y `public/media/blog/*.webp`. |
| Imágenes | Se convierten a WebP en el navegador; el servidor verifica que sean WebP de verdad y el tamaño. |
| HTML en las notas | El sitio descarta HTML escrito a mano y solo acepta links `http(s)`, `mailto:` o rutas propias. |
| Llave de GitHub | Solo este repo, solo `Contents`. Nunca llega al navegador. |
| Navegador | CSP estricta, sin iframes, `noindex` (ver `vercel.json`). |

## Desarrollo local

```bash
cd panel
npm install
cp .env.example .env.local   # completar PANEL_PASSWORD (y PANEL_STORAGE=local para no tocar GitHub)
npm run dev                  # http://localhost:5180
```

- `PANEL_STORAGE=local` escribe en el disco (`PANEL_LOCAL_ROOT`, por defecto la raíz del repo) en vez de GitHub. En Vercel esa opción se rechaza.
- QA de punta a punta (login, crear con portada, editar, eliminar, celular), con el panel en modo local sobre una **copia** de `content/blog` y `public/media/blog`, desde la raíz del repo: `node scripts/qa-panel.mjs http://localhost:5180 <contraseña> <carpeta de la copia>`.

```
api/       endpoints (Vercel Functions): login, logout, session, posts, post, media
server/    auth (contraseña, cookie, límite de intentos) · http (guardas) · storage (GitHub / local) · posts
shared/    reglas comunes navegador/servidor: categorías, límites, slug
src/       la app: login, lista de notas, editor (Markdown + vista previa + revisión SEO)
```
