import { Fragment } from 'react'

/** Renderiza `*texto*` como énfasis editorial (Instrument Serif itálica, sin mayúsculas forzadas). */
export function Emphasis({ text, className = 'font-accent' }: { text: string; className?: string }) {
  return (
    <>
      {text.split('*').map((part, i) =>
        i % 2 ? (
          <em key={i} className={className}>
            {part}
          </em>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </>
  )
}
