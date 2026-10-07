import { useRef, useState, type DragEvent } from 'react'
import { prepareImage, type PreparedImage } from '../lib/image'
import { Spinner } from './ui'

interface Props {
  /** URL para mostrar la portada actual (pendiente o ya guardada) */
  previewUrl: string
  imageBase: string
  onImage: (image: PreparedImage) => void
  onError: (message: string) => void
}

/** Portada: arrastrar o elegir una imagen. Se achica y se convierte a WebP antes de subirla. */
export function CoverInput({ previewUrl, imageBase, onImage, onError }: Props) {
  const input = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [over, setOver] = useState(false)

  const take = async (file: File | undefined) => {
    if (!file) return
    setBusy(true)
    try {
      onImage(await prepareImage(file, `${imageBase || 'nota'}-portada`))
    } catch (e) {
      onError(e instanceof Error ? e.message : 'No se pudo cargar la imagen.')
    } finally {
      setBusy(false)
      if (input.current) input.current.value = ''
    }
  }

  const drop = (e: DragEvent) => {
    e.preventDefault()
    setOver(false)
    take(e.dataTransfer.files[0])
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault()
        setOver(true)
      }}
      onDragLeave={() => setOver(false)}
      onDrop={drop}
      className={`relative overflow-hidden rounded-2xl bg-white ring-1 transition ${over ? 'ring-2 ring-brand-signal' : 'ring-brand-deep/15'}`}
    >
      {previewUrl ? (
        <img src={previewUrl} alt="" className="aspect-video w-full object-cover" />
      ) : (
        <div className="grid aspect-video place-items-center bg-brand-paper text-center">
          <div className="px-6">
            <p className="text-sm font-bold text-brand-deep">Arrastrá una imagen o elegila</p>
            <p className="mt-1 text-xs text-brand-night/55">Horizontal (16:9). Se achica y se optimiza sola.</p>
          </div>
        </div>
      )}
      <div className="absolute right-3 bottom-3 flex gap-2">
        <button type="button" onClick={() => input.current?.click()} disabled={busy} className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-brand-deep shadow-lift ring-1 ring-brand-deep/10 hover:bg-brand-paper">
          {busy && <Spinner />}
          {previewUrl ? 'Cambiar portada' : 'Elegir imagen'}
        </button>
      </div>
      <input ref={input} type="file" accept="image/*" hidden onChange={(e) => take(e.target.files?.[0])} />
    </div>
  )
}
