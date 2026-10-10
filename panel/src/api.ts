import type { NewImage, PostInput, PostSummary } from '../shared/blog'
import type { FaqItem, PricesInput, ProjectInput, ProjectSummary, Versioned } from '../shared/site'

/** Cliente del backend del panel (/api). La sesión viaja en una cookie que este código no puede leer. */

export class ApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

/** Avisa a la app cuando la sesión venció (vuelve al login). */
export const onUnauthorized = { current: () => {} }

async function request<T>(url: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(url, { ...init, credentials: 'same-origin', headers: { 'content-type': 'application/json', ...init.headers } })
  const data = (await res.json().catch(() => ({}))) as T & { error?: string }
  if (!res.ok) {
    if (res.status === 401 && !url.endsWith('/login')) onUnauthorized.current()
    throw new ApiError(data.error ?? 'No se pudo completar la acción.', res.status)
  }
  return data
}

export interface FullPost extends PostInput {
  updated: string | null
}

export const api = {
  session: () => request<{ authenticated: boolean; error?: string }>('/api/session'),
  login: (password: string) => request<{ ok: true }>('/api/login', { method: 'POST', body: JSON.stringify({ password }) }),
  logout: () => request<{ ok: true }>('/api/logout', { method: 'POST' }),
  posts: () => request<{ posts: PostSummary[] }>('/api/posts'),
  post: (slug: string) => request<{ post: FullPost }>(`/api/post?slug=${encodeURIComponent(slug)}`),
  create: (post: PostInput, images: NewImage[]) => request<{ slug: string }>('/api/post', { method: 'POST', body: JSON.stringify({ post, images }) }),
  update: (post: PostInput, images: NewImage[]) => request<{ slug: string }>('/api/post', { method: 'PUT', body: JSON.stringify({ post, images }) }),
  remove: (slug: string) => request<{ ok: true }>(`/api/post?slug=${encodeURIComponent(slug)}`, { method: 'DELETE' }),

  projects: () => request<{ projects: ProjectSummary[] }>('/api/projects'),
  project: (slug: string) => request<{ project: ProjectInput }>(`/api/project?slug=${encodeURIComponent(slug)}`),
  createProject: (project: ProjectInput, images: NewImage[]) => request<{ slug: string }>('/api/project', { method: 'POST', body: JSON.stringify({ project, images }) }),
  updateProject: (project: ProjectInput, images: NewImage[]) => request<{ slug: string }>('/api/project', { method: 'PUT', body: JSON.stringify({ project, images }) }),
  projectAction: (slug: string, action: 'up' | 'down' | 'top') =>
    request<{ ok: true }>(`/api/project?slug=${encodeURIComponent(slug)}`, { method: 'PATCH', body: JSON.stringify({ action }) }),
  removeProject: (slug: string) => request<{ ok: true }>(`/api/project?slug=${encodeURIComponent(slug)}`, { method: 'DELETE' }),

  prices: () => request<Versioned<PricesInput>>('/api/prices'),
  savePrices: (data: PricesInput, version: string) => request<{ version: string }>('/api/prices', { method: 'PUT', body: JSON.stringify({ data, version }) }),
  faq: () => request<Versioned<FaqItem[]>>('/api/faq'),
  saveFaq: (data: FaqItem[], version: string) => request<{ version: string }>('/api/faq', { method: 'PUT', body: JSON.stringify({ data, version }) }),
}

/** URL para mostrar una imagen del sitio (blog o proyectos) dentro del panel: se lee del repo, aunque la web no se haya actualizado. */
export const mediaSrc = (path: string) => `/api/media?path=${encodeURIComponent(path)}`
