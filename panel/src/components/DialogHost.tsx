import { useEffect, useRef, useState, type FormEvent } from 'react'
import { registerDialogHost, type DialogRequest } from '../lib/dialog'
import { Button, inputClass } from './ui'

/**
 * Muestra los diálogos pedidos con ask() / askText() (lib/dialog.ts).
 * Usa <dialog> nativo: foco atrapado, cierre con Escape y fondo bloqueado, con el diseño del panel.
 */
export function DialogHost() {
  const ref = useRef<HTMLDialogElement>(null)
  const input = useRef<HTMLInputElement>(null)
  const [request, setRequest] = useState<DialogRequest | null>(null)
  const [value, setValue] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    registerDialogHost((r) => {
      setRequest(r)
      setValue(r.kind === 'text' ? (r.initial ?? '') : '')
      setError('')
    })
    return () => registerDialogHost(null)
  }, [])

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (request && !dialog.open) {
      dialog.showModal()
      if (request.kind === 'text') requestAnimationFrame(() => input.current?.select())
    }
    if (!request && dialog.open) dialog.close()
  }, [request])

  const finish = (ok: boolean) => {
    if (!request) return
    if (request.kind === 'confirm') request.resolve(ok)
    else request.resolve(ok ? value.trim() : null)
    setRequest(null)
  }

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (request?.kind === 'text') {
      const problem = request.validate?.(value.trim()) ?? null
      if (problem) {
        setError(problem)
        return
      }
    }
    finish(true)
  }

  return (
    <dialog
      ref={ref}
      // Escape o clic fuera: equivale a cancelar
      onCancel={(e) => {
        e.preventDefault()
        finish(false)
      }}
      onClick={(e) => e.target === ref.current && finish(false)}
      className="m-auto w-full max-w-md rounded-3xl p-0 shadow-lift backdrop:bg-brand-night/50 backdrop:backdrop-blur-sm"
      aria-labelledby="dialog-title"
    >
      {request && (
        <form onSubmit={submit} className="flex flex-col gap-4 p-6">
          <h2 id="dialog-title" className="text-xl font-extrabold tracking-tight text-brand-deep">
            {request.title}
          </h2>
          {request.text && <p className="text-sm leading-relaxed text-brand-night/75">{request.text}</p>}
          {request.kind === 'text' && (
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-bold text-brand-deep">{request.label}</span>
              <input
                ref={input}
                value={value}
                onChange={(e) => {
                  setValue(e.target.value)
                  setError('')
                }}
                placeholder={request.placeholder}
                className={inputClass}
                aria-invalid={Boolean(error)}
              />
              {error && <span className="text-sm font-semibold text-red-700">{error}</span>}
            </label>
          )}
          <div className="mt-2 flex justify-end gap-2">
            <Button variant="secondary" onClick={() => finish(false)}>
              {request.cancelLabel ?? 'Cancelar'}
            </Button>
            <Button type="submit" variant={request.tone === 'danger' ? 'danger' : 'primary'}>
              {request.confirmLabel}
            </Button>
          </div>
        </form>
      )}
    </dialog>
  )
}
