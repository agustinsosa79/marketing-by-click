# Blog: cómo publicar una nota

## Desde el panel (para el cliente)

1. Entrá a **marketingbyclic.com/admin** e iniciá sesión.
2. **Blog → Nueva nota.** Completá:
   - **Título**: lo que se lee en Google (ideal, menos de 60 caracteres).
   - **Resumen**: 1 o 2 oraciones, de 120 a 155 caracteres. Aparece en Google y en las tarjetas.
   - **Fecha**, **Categoría** (Estrategia, Contenido, Meta Ads o Branding).
   - **Portada**: imagen horizontal 16:9, mínimo 1200 px de ancho, y su descripción.
   - **Texto**: usá *Título 2* para los subtítulos (arman el índice "En esta nota").
3. **Publicar.** El sitio se vuelve a generar solo en un par de minutos.
   - Con **Borrador** activado, la nota se guarda pero no se publica.

La nota más nueva queda destacada arriba en /blog y entra sola en el sitemap y en el feed RSS (/blog/rss.xml).

## Cómo funciona (para el desarrollador)

- Cada nota es un archivo `content/blog/<slug>.md` (frontmatter + Markdown). El panel (Decap CMS, `public/admin/`) solo crea y edita esos archivos en el repo.
- `vite-plugin-blog.ts` convierte cada `.md` en datos + HTML. Los archivos que empiezan con `_` no se publican (`_plantilla.md`).
- `npm run build` prerenderiza `/`, `/blog`, cada nota y `/404` con su `<head>` propio (title, description, canonical, Open Graph, BlogPosting y BreadcrumbList) y genera `sitemap.xml` y `blog/rss.xml`.
- QA: `node scripts/qa-blog.mjs [base] [ancho] [alto] [prefijo]`.

## Pendiente: inicio de sesión del panel

Depende de dónde se publique el sitio (`public/admin/config.yml`):

- **Netlify** (lo más simple): `backend: name: git-gateway` y activar Identity + Git Gateway. El cliente entra con email y contraseña.
- **Vercel / Cloudflare / otro**: dejar `backend: github` y sumar un servidor OAuth (`base_url`). El cliente entra con una cuenta de GitHub con acceso al repo.
- Probar en local sin login: `npx decap-server` y abrir `http://localhost:5173/admin/` con `npm run dev`.
