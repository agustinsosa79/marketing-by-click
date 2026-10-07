import { useMemo, useRef, useState } from 'react'
import { MEDIA_URL } from '../../shared/blog'
import { prepareImage, type PreparedImage } from '../lib/image'
import { renderMarkdown } from '../lib/markdown'
import { Spinner } from './ui'

interface Props {
  value: string
  onChange: (value: string) => void
  /** nombre base para las imágenes que se suban (la dirección de la nota) */
  imageBase: string
  onImage: (image: PreparedImage) => void
  resolveImage: (src: string) => string
  onError: (message: string) => void
}

type Action = { label: string; title: string; run: () => void }

/**
 * Editor del texto de la nota: Markdown con barra de herramientas (no hace falta saber la sintaxis)
 * y pestaña de vista previa con los mismos estilos que el sitio.
 */
export function MarkdownEditor({ value, onChange, imageBase, onImage, resolveImage, onError }: Props) {
  const area = useRef<HTMLTextAreaElement>(null)
  const file = useRef<HTMLInputElement>(null)
  const [tab, setTab] = useState<'write' | 'preview'>('write')
  const [uploading, setUploading] = useState(false)

  // Reemplaza la selección y deja el cursor donde corresponde
  const apply = (transform: (selected: string) => { text: string; select?: [number, number] }) => {
    const el = area.current!
    const { selectionStart: start, selectionEnd: end } = el
    const { text, select } = transform(value.slice(start, end))
    const next = value.slice(0, start) + text + value.slice(end)
    onChange(next)
    requestAnimationFrame(() => {
      el.focus()
      const [a, b] = select ?? [text.length, text.length]
      el.setSelectionRange(start + a, start + b)
    })
  }

  const wrap = (mark: string, placeholder: string) =>
    apply((sel) => {
      const inner = sel || placeholder
      return { text: `${mark}${inner}${mark}`, select: [mark.length, mark.length + inner.length] }
    })

  // Prefijo por línea (subtítulos, listas, citas). Asegura que el bloque arranque en una línea nueva.
  const prefix = (make: (i: number) => string, placeholder: string) =>
    apply((sel) => {
      const el = area.current!
      const needsBreak = el.selectionStart > 0 && value[el.selectionStart - 1] !== '\n'
      const lines = (sel || placeholder).split('\n').map((line, i) => `${make(i)}${line.replace(/^(#{1,6}\s|[-*]\s|\d+\.\s|>\s)/, '')}`)
      const text = `${needsBreak ? '\n\n' : ''}${lines.join('\n')}`
      return { text }
    })

  const link = () => {
    const url = window.prompt('Pegá la dirección del enlace (por ejemplo https://marketingbyclic.com/servicios/meta-ads):', 'https://')
    if (!url || url === 'https://') return
    apply((sel) => {
      const label = sel || 'texto del enlace'
      return { text: `[${label}](${url.trim()})`, select: [1, 1 + label.length] }
    })
  }

  const pickImage = async (f: File | undefined) => {
    if (!f) return
    setUploading(true)
    try {
      const img = await prepareImage(f, imageBase || 'imagen', 1400)
      onImage(img)
      apply(() => {
        const alt = 'Describí la imagen'
        const lead = value && !value.endsWith('\n') ? '\n\n' : ''
        return { text: `${lead}![${alt}](${MEDIA_URL}/${img.name})\n`, select: [lead.length + 2, lead.length + 2 + alt.length] }
      })
    } catch (e) {
      onError(e instanceof Error ? e.message : 'No se pudo cargar la imagen.')
    } finally {
      setUploading(false)
      if (file.current) file.current.value = ''
    }
  }

  const actions: Action[] = [
    { label: 'Subtítulo', title: 'Subtítulo (arma el índice de la nota)', run: () => prefix(() => '## ', 'Subtítulo') },
    { label: 'B', title: 'Negrita', run: () => wrap('**', 'texto en negrita') },
    { label: '• Lista', title: 'Lista con viñetas', run: () => prefix(() => '- ', 'Un punto') },
    { label: '1. Lista', title: 'Lista numerada', run: () => prefix((i) => `${i + 1}. `, 'Primer paso') },
    { label: '“ Cita', title: 'Frase destacada', run: () => prefix(() => '> ', 'Una frase para destacar') },
    { label: 'Enlace', title: 'Enlace a otra página', run: link },
  ]

  const html = useMemo(() => (tab === 'preview' ? renderMarkdown(value, resolveImage) : ''), [tab, value, resolveImage])

  return (
    <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-brand-deep/15 focus-within:ring-2 focus-within:ring-brand-signal">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-brand-deep/10 bg-brand-paper/60 p-2">
        <div className="flex flex-wrap gap-1" role="toolbar" aria-label="Formato del texto">
          {actions.map((a) => (
            <button
              key={a.label}
              type="button"
              title={a.title}
              disabled={tab === 'preview'}
              onClick={a.run}
              className={`rounded-lg px-2.5 py-1.5 text-xs text-brand-deep transition hover:bg-white disabled:opacity-40 ${a.label === 'B' ? 'font-black' : 'font-bold'}`}
            >
              {a.label}
            </button>
          ))}
          <button
            type="button"
            title="Insertar una imagen"
            disabled={tab === 'preview' || uploading}
            onClick={() => file.current?.click()}
            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold text-brand-deep transition hover:bg-white disabled:opacity-40"
          >
            {uploading && <Spinner className="size-3" />}
            Imagen
          </button>
          <input ref={file} type="file" accept="image/*" hidden onChange={(e) => pickImage(e.target.files?.[0])} />
        </div>
        <div className="flex rounded-full bg-white p-0.5 ring-1 ring-brand-deep/10" role="tablist" aria-label="Modo del editor">
          {(['write', 'preview'] as const).map((t) => (
            <button
              key={t}
              type="button"
              role="tab"
              aria-selected={tab === t}
              onClick={() => setTab(t)}
              className={`rounded-full px-3 py-1 text-xs font-bold transition ${tab === t ? 'bg-brand-deep text-white' : 'text-brand-deep'}`}
            >
              {t === 'write' ? 'Escribir' : 'Vista previa'}
            </button>
          ))}
        </div>
      </div>

      {tab === 'write' ? (
        <textarea
          ref={area}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={22}
          spellCheck
          aria-label="Texto de la nota"
          placeholder={'Empezá con un párrafo que diga de qué trata la nota.\n\nUsá "Subtítulo" para separar las partes: arman el índice que se ve en la web.'}
          className="block min-h-96 w-full resize-y bg-white px-5 py-4 text-base leading-relaxed text-brand-night outline-none placeholder:text-brand-night/35"
        />
      ) : (
        <div className="min-h-96 px-5 py-6 sm:px-8">
          {value.trim() ? <div className="prose" dangerouslySetInnerHTML={{ __html: html }} /> : <p className="text-sm text-brand-night/50">Todavía no hay texto.</p>}
        </div>
      )}
    </div>
  )
}
