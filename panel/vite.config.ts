import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import type { IncomingMessage, ServerResponse } from 'node:http'
import { defineConfig, loadEnv, type Plugin, type ViteDevServer } from 'vite'

/**
 * En desarrollo, las funciones de /api (las mismas que corren en Vercel) se ejecutan dentro del servidor
 * de Vite: así el panel se prueba completo con `npm run dev`, sin instalar la CLI de Vercel.
 * Las variables de .env.local se pasan a process.env solo para esas funciones (nunca al navegador).
 */
function apiInDev(env: Record<string, string>): Plugin {
  return {
    name: 'panel-api-dev',
    configureServer(server: ViteDevServer) {
      Object.assign(process.env, env)
      server.middlewares.use(async (req: IncomingMessage, res: ServerResponse, next) => {
        const url = new URL(req.url ?? '/', `http://${req.headers.host}`)
        const match = url.pathname.match(/^\/api\/([a-z-]+)$/)
        if (!match) return next()
        try {
          const mod = (await server.ssrLoadModule(`/api/${match[1]}.ts`)) as Record<string, (r: Request) => Response | Promise<Response>>
          const handler = mod[req.method ?? 'GET']
          if (!handler) {
            res.statusCode = 405
            return res.end()
          }
          const chunks: Buffer[] = []
          for await (const chunk of req) chunks.push(chunk as Buffer)
          const body = ['GET', 'HEAD'].includes(req.method ?? 'GET') ? undefined : Buffer.concat(chunks)
          const request = new Request(url, { method: req.method, headers: req.headers as Record<string, string>, body })
          const response = await handler(request)
          res.statusCode = response.status
          response.headers.forEach((value, key) => res.setHeader(key, value))
          res.end(Buffer.from(await response.arrayBuffer()))
        } catch (error) {
          console.error(error)
          res.statusCode = 500
          res.end('error')
        }
      })
    },
  }
}

export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss(), apiInDev(loadEnv(mode, process.cwd(), ''))],
  server: { port: 5180 },
}))
