import { useRef, useState, type DragEvent } from 'react'
import { prepareImage, type PreparedImage } from '../lib/image'
import { Spinner } from './ui'

interface Props {
  /** Imagen actual (pendiente o ya guardada); vacío = sin imagen */
  url: string
  /** Base del nombre de archivo (ej. "marca-portada") */
  imageBase: string
  onImage: (image: PreparedImage) => void
  onRemove?: () => void
  onError: (message: string) => void
  /** Proporción del recuadro (la imagen se guarda completa; esto es solo cómo se muestra acá). */
  aspect?: string
  hint?: string
}

/** Elegir o arrastrar una imagen. Se achica y se convierte a WebP en el navegador antes de subirla. */
export function ImagePicker({ url, imageBase, onImage, onRemove, onError, aspect = 'aspect-4/3', hint = 'Se achica y se optimiza sola.' }: Props) {
  const input = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [over, setOver] = useState(false)

  const take = async (file: File | undefined) => {
    if (!file) return
    setBusy(true)
    try {
      onImage(await prepareImage(file, imageBase || 'proyecto'))
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
      {url ? (
        <img src={url} alt="" className={`${aspect} w-full bg-brand-paper object-cover`} />
      ) : (
        <div className={`grid ${aspect} place-items-center bg-brand-paper text-center`}>
          <div className="px-6">
            <p className="text-sm font-bold text-brand-deep">Arrastrá una imagen o elegila</p>
            <p className="mt-1 text-xs text-brand-night/55">{hint}</p>
          </div>
        </div>
      )}
      <div className="absolute right-3 bottom-3 flex gap-2">
        {url && onRemove && (
          <button type="button" onClick={onRemove} className="rounded-full bg-white px-3 py-2 text-sm font-bold text-red-700 shadow-lift ring-1 ring-brand-deep/10 hover:bg-red-50">
            Quitar
          </button>
        )}
        <button
          type="button"
          onClick={() => input.current?.click()}
          disabled={busy}
          className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-brand-deep shadow-lift ring-1 ring-brand-deep/10 hover:bg-brand-paper"
        >
          {busy && <Spinner />}
          {url ? 'Cambiar' : 'Elegir imagen'}
        </button>
      </div>
      <input ref={input} type="file" accept="image/*" hidden onChange={(e) => take(e.target.files?.[0])} />
    </div>
  )
}
