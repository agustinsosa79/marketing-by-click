// Módulos de notas del blog (los genera vite-plugin-blog.ts a partir de content/blog/*.md)
declare module '*.md' {
  import type { PostMeta, TocItem } from '../lib/blog'
  export const meta: PostMeta
  export const html: string
  export const toc: TocItem[]
}
declare module '*.md?meta' {
  import type { PostMeta } from '../lib/blog'
  export const meta: PostMeta
}
