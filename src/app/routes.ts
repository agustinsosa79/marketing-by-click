/** Rutas del sitio. Navegación entre páginas = carga completa (cada ruta tiene su HTML prerenderizado). */
export type Route =
  | { name: 'home' }
  | { name: 'blog' }
  | { name: 'post'; slug: string }
  | { name: 'service'; slug: string }
  | { name: 'projects' }
  | { name: 'project'; slug: string }
  | { name: 'notfound' }

export function normalizePath(pathname: string) {
  const path = pathname.replace(/\/index\.html$/, '').replace(/\/+$/, '')
  return path === '' ? '/' : path
}

export function resolveRoute(pathname: string): Route {
  const path = normalizePath(pathname)
  if (path === '/') return { name: 'home' }
  if (path === '/blog') return { name: 'blog' }
  const post = path.match(/^\/blog\/([a-z0-9-]+)$/)
  if (post) return { name: 'post', slug: post[1] }
  const service = path.match(/^\/servicios\/([a-z0-9-]+)$/)
  if (service) return { name: 'service', slug: service[1] }
  if (path === '/proyectos') return { name: 'projects' }
  const project = path.match(/^\/proyectos\/([a-z0-9-]+)$/)
  if (project) return { name: 'project', slug: project[1] }
  return { name: 'notfound' }
}
