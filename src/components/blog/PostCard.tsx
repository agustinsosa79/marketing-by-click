import { blog } from '../../data/content'
import { formatDate, postUrl, type PostMeta } from '../../lib/blog'
import { Arrow } from '../ui/Icon'

/** Fecha · minutos de lectura. */
export function PostMetaLine({ post, className = '' }: { post: PostMeta; className?: string }) {
  return (
    <p className={`text-sm font-semibold ${className}`}>
      <time dateTime={post.date}>{formatDate(post.date)}</time>
      <span aria-hidden="true"> · </span>
      {post.readingMinutes} {blog.minutes}
    </p>
  )
}

export function CategoryChip({ children, className = '' }: { children: string; className?: string }) {
  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${className}`}>{children}</span>
}

/**
 * Tarjeta de nota: portada 16:9, categoría, fecha y título. Toda la tarjeta es un link.
 * Hover: la portada se acerca, el título pasa a azul señal y la flecha se endereza.
 */
export function PostCard({ post, headingLevel: Heading = 'h3' }: { post: PostMeta; headingLevel?: 'h2' | 'h3' }) {
  return (
    <article data-post-card className="group relative">
      <a href={postUrl(post.slug)} data-cursor={blog.read} className="flex flex-col gap-5">
        <div className="relative aspect-video overflow-hidden rounded-3xl bg-brand-night ring-1 ring-brand-deep/10">
          <img src={post.cover} alt={post.coverAlt} width={900} height={506} loading="lazy" decoding="async" className="size-full object-cover transition-transform duration-1000 ease-expo group-hover:scale-105" />
          <CategoryChip className="absolute top-4 left-4 bg-white text-brand-deep">{post.category}</CategoryChip>
        </div>
        <div className="flex flex-col gap-3">
          <PostMetaLine post={post} className="text-brand-night/60" />
          <Heading className="font-display text-2xl text-brand-deep transition-colors duration-500 group-hover:text-brand-signal md:text-3xl">{post.title}</Heading>
          <p className="line-clamp-2 text-base text-brand-night/70">{post.description}</p>
          <span className="flex items-center gap-2 text-sm font-bold text-brand-signal">
            {blog.read}
            <Arrow className="size-4 transition-transform duration-500 ease-expo group-hover:rotate-45" />
          </span>
        </div>
      </a>
    </article>
  )
}
