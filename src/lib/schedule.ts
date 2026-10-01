import { ScrollTrigger } from './gsap'

/**
 * Cola de "setups" de secciones de abajo del pliegue.
 * Mientras corre el preloader nadie puede scrollear, así que armar las animaciones de las secciones
 * puede esperar: cada setup corre en su propia tarea (requestIdleCallback) en vez de todos juntos
 * en el commit de React (una tarea larga que bloqueaba el hilo principal más de un segundo).
 * Al vaciarse la cola se recalculan las posiciones de ScrollTrigger una sola vez.
 */
type Setup = () => void | (() => void)
interface Job {
  fn: Setup
  cleanup?: () => void
  done: boolean
  cancelled: boolean
}

const queue: Job[] = []
let released = false
let draining = false

const idle = (cb: () => void) => {
  if (typeof window.requestIdleCallback === 'function') window.requestIdleCallback(() => cb(), { timeout: 400 })
  else setTimeout(cb, 16)
}

function drain() {
  if (draining) return
  draining = true
  const step = () => {
    const job = queue.shift()
    if (!job) {
      draining = false
      ScrollTrigger.refresh()
      return
    }
    if (!job.cancelled) {
      const r = job.fn()
      if (typeof r === 'function') job.cleanup = r
      job.done = true
    }
    idle(step)
  }
  idle(step)
}

/** Libera la cola (lo llama el preloader cuando arrancó su timeline). */
export function releaseDeferred() {
  if (released) return
  released = true
  drain()
}

// Red de seguridad: si por algún motivo nadie libera la cola, se libera sola
if (typeof window !== 'undefined') window.setTimeout(releaseDeferred, 5000)

/** Encola un setup. Devuelve un cleanup: cancela si todavía no corrió o ejecuta su cleanup si ya corrió. */
export function deferSetup(fn: Setup): () => void {
  const job: Job = { fn, done: false, cancelled: false }
  queue.push(job)
  if (released) drain()
  return () => {
    job.cancelled = true
    job.cleanup?.()
  }
}
