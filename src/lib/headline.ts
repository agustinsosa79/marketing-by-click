import type { Headline } from '../data/content'

/** Parte un titular en [antes, énfasis, después] (el énfasis es una parte literal del texto). */
export function splitHeadline({ text, emphasis }: Headline): [string, string, string] {
  const i = text.lastIndexOf(emphasis)
  if (!emphasis || i < 0) return [text, '', '']
  return [text.slice(0, i), emphasis, text.slice(i + emphasis.length)]
}
