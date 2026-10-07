# Blog: cómo publicar una nota

## Desde el panel (para el cliente)

1. Entrá al panel del blog (link aparte, no está dentro de la web) con tu contraseña.
2. **Nueva nota.** Completá:
   - **Título**: lo que se lee en Google (ideal, de 30 a 60 caracteres).
   - **Resumen**: 1 o 2 oraciones, de 120 a 160 caracteres. Aparece en Google y en las tarjetas.
   - **Categoría** (Estrategia, Contenido, Meta Ads o Branding) y **Fecha**.
   - **Portada**: imagen horizontal 16:9, y qué se ve en ella. Se achica y optimiza sola.
   - **Texto**: usá **Subtítulo** para separar las partes (arman el índice "En esta nota").
3. **Publicar nota.** La web se actualiza sola en 1 o 2 minutos.
   - En **Borrador**, la nota se guarda pero no se ve en la web.

La columna "Así se vería en Google" marca lo que conviene completar para posicionar mejor; no impide publicar.

La nota más nueva queda destacada arriba en /blog y entra sola en el sitemap y en el feed RSS (/blog/rss.xml).

## Cómo funciona (para el desarrollador)

- Cada nota es un archivo `content/blog/<slug>.md` (frontmatter + Markdown); sus imágenes, `public/media/blog/*.webp`.
- El panel (`panel/`, proyecto aparte en Vercel) crea, edita y borra esos archivos con un commit en el repo. Instalación, seguridad y mantenimiento: [`panel/README.md`](../panel/README.md).
- `vite-plugin-blog.ts` convierte cada `.md` en datos + HTML. Descarta el HTML escrito a mano y los links que no sean `http(s)`, `mailto:` o rutas propias. Los archivos que empiezan con `_` no se publican (`_plantilla.md`).
- `npm run build` prerenderiza `/`, `/blog`, cada nota y `/404` con su `<head>` propio (title, description, canonical, Open Graph, BlogPosting y BreadcrumbList) y genera `sitemap.xml` y `blog/rss.xml`.
- QA: `node scripts/qa-blog.mjs [base] [ancho] [alto] [prefijo]` (sitio) y `node scripts/qa-panel.mjs` (panel).
