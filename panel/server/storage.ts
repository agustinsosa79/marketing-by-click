import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { MEDIA_DIR, POSTS_DIR } from '../shared/blog.js'
import { UserError } from './http.js'

/**
 * Dónde se guardan las notas.
 *  - Producción (GitHub): cada guardado es UN commit en el repo del sitio. Vercel detecta el commit
 *    y vuelve a publicar la web (1-2 minutos). No hay base de datos: el repo es la base de datos.
 *  - Desarrollo (PANEL_STORAGE=local): escribe directo en la carpeta del sitio, para probar sin tocar GitHub.
 */

export interface FileChange {
  path: string
  /** null = borrar el archivo */
  content: string | null
  encoding?: 'utf-8' | 'base64'
}

export interface Storage {
  list(dir: string): Promise<string[]>
  read(file: string): Promise<string | null>
  readBinary(file: string): Promise<Uint8Array | null>
  commit(changes: FileChange[], message: string): Promise<void>
}

/** Solo se puede tocar content/blog/*.md y public/media/blog/*.webp|jpg|png. Nada más del repo. */
export function assertAllowedPath(file: string) {
  const ok =
    (file.startsWith(`${POSTS_DIR}/`) && /^[a-z0-9_-]+\.md$/.test(file.slice(POSTS_DIR.length + 1))) ||
    (file.startsWith(`${MEDIA_DIR}/`) && /^[a-z0-9-]+\.(webp|jpe?g|png)$/.test(file.slice(MEDIA_DIR.length + 1)))
  if (!ok || file.includes('..')) throw new UserError('Ruta no permitida.', 403)
}

// ---------------------------------------------------------------- GitHub

function githubStorage(): Storage {
  const token = process.env.GITHUB_TOKEN
  const repo = process.env.GITHUB_REPO || 'agustinsosa79/marketing-by-click'
  // la rama de la que sale la web en producción
  const branch = process.env.GITHUB_BRANCH || 'master'
  // Si el sitio está en una subcarpeta del repo (ej. "web/"), va acá
  const root = (process.env.GITHUB_ROOT || '').replace(/^\/|\/$/g, '')
  if (!token) throw new Error('Falta GITHUB_TOKEN')
  const repoPath = (file: string) => (root ? `${root}/${file}` : file)
  const encode = (file: string) => repoPath(file).split('/').map(encodeURIComponent).join('/')
  const api = `https://api.github.com/repos/${repo}`
  const headers = {
    authorization: `Bearer ${token}`,
    accept: 'application/vnd.github+json',
    'x-github-api-version': '2022-11-28',
    'user-agent': 'marketingbyclic-panel',
  }

  // 401/403: el token venció o le sacaron permisos. Es lo único que el cliente no puede resolver solo.
  const checkAccess = (res: Response) => {
    if (res.status === 401 || res.status === 403) {
      console.error(`GitHub ${res.status}: revisar GITHUB_TOKEN`)
      throw new UserError('El panel perdió el permiso para guardar en la web (venció el acceso a GitHub). Avisale a quien instaló el panel.', 503)
    }
  }

  async function gh<T>(url: string, init: RequestInit = {}): Promise<T> {
    const res = await fetch(`${api}${url}`, { ...init, headers: { ...headers, ...(init.headers as Record<string, string>) } })
    checkAccess(res)
    if (!res.ok) {
      const body = await res.text()
      if (res.status === 422 && url.startsWith('/git/refs')) throw new UserError('Hubo otro cambio al mismo tiempo. Volvé a guardar.', 409)
      throw new Error(`GitHub ${init.method ?? 'GET'} ${url} → ${res.status}: ${body.slice(0, 300)}`)
    }
    return res.json() as Promise<T>
  }

  async function raw(file: string) {
    const res = await fetch(`${api}/contents/${encode(file)}?ref=${encodeURIComponent(branch)}`, {
      headers: { ...headers, accept: 'application/vnd.github.raw' },
    })
    if (res.status === 404) return null
    checkAccess(res)
    if (!res.ok) throw new Error(`GitHub GET ${file} → ${res.status}`)
    return res
  }

  return {
    async list(dir) {
      const res = await fetch(`${api}/contents/${encode(dir)}?ref=${encodeURIComponent(branch)}`, { headers })
      if (res.status === 404) return []
      checkAccess(res)
      if (!res.ok) throw new Error(`GitHub list ${dir} → ${res.status}`)
      const items = (await res.json()) as { type: string; name: string }[]
      return items.filter((i) => i.type === 'file').map((i) => `${dir}/${i.name}`)
    },
    async read(file) {
      return (await raw(file))?.text() ?? null
    },
    async readBinary(file) {
      const res = await raw(file)
      return res ? new Uint8Array(await res.arrayBuffer()) : null
    },
    async commit(changes, message) {
      changes.forEach((c) => assertAllowedPath(c.path))
      const ref = await gh<{ object: { sha: string } }>(`/git/ref/heads/${encodeURIComponent(branch)}`)
      const head = ref.object.sha
      const commit = await gh<{ tree: { sha: string } }>(`/git/commits/${head}`)
      const tree = await Promise.all(
        changes.map(async (c) => {
          if (c.content === null) return { path: repoPath(c.path), mode: '100644', type: 'blob', sha: null }
          const blob = await gh<{ sha: string }>('/git/blobs', { method: 'POST', body: JSON.stringify({ content: c.content, encoding: c.encoding ?? 'utf-8' }) })
          return { path: repoPath(c.path), mode: '100644', type: 'blob', sha: blob.sha }
        }),
      )
      const newTree = await gh<{ sha: string }>('/git/trees', { method: 'POST', body: JSON.stringify({ base_tree: commit.tree.sha, tree }) })
      const newCommit = await gh<{ sha: string }>('/git/commits', {
        method: 'POST',
        body: JSON.stringify({ message, tree: newTree.sha, parents: [head] }),
      })
      // sin force: si alguien commiteó en el medio, falla en vez de pisar su trabajo
      await gh(`/git/refs/heads/${encodeURIComponent(branch)}`, { method: 'PATCH', body: JSON.stringify({ sha: newCommit.sha, force: false }) })
    },
  }
}

// ---------------------------------------------------------------- Local (solo desarrollo)

function localStorage(): Storage {
  if (process.env.VERCEL) throw new Error('PANEL_STORAGE=local no se puede usar en Vercel')
  const root = path.resolve(process.env.PANEL_LOCAL_ROOT || path.resolve(process.cwd(), '..'))
  const abs = (file: string) => path.join(root, ...file.split('/'))
  const missing = (e: unknown) => (e as NodeJS.ErrnoException).code === 'ENOENT'

  return {
    async list(dir) {
      try {
        return (await readdir(abs(dir), { withFileTypes: true })).filter((d) => d.isFile()).map((d) => `${dir}/${d.name}`)
      } catch (e) {
        if (missing(e)) return []
        throw e
      }
    },
    async read(file) {
      try {
        return await readFile(abs(file), 'utf8')
      } catch (e) {
        if (missing(e)) return null
        throw e
      }
    },
    async readBinary(file) {
      try {
        return new Uint8Array(await readFile(abs(file)))
      } catch (e) {
        if (missing(e)) return null
        throw e
      }
    },
    async commit(changes) {
      for (const c of changes) {
        assertAllowedPath(c.path)
        if (c.content === null) await rm(abs(c.path), { force: true })
        else {
          await mkdir(path.dirname(abs(c.path)), { recursive: true })
          await writeFile(abs(c.path), Buffer.from(c.content, c.encoding === 'base64' ? 'base64' : 'utf8'))
        }
      }
    },
  }
}

export const getStorage = (): Storage => (process.env.PANEL_STORAGE === 'local' ? localStorage() : githubStorage())
