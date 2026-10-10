import { proyectos } from '../../data/content'
import { projectMeta, projectUrl, type Project } from '../../lib/projects'
import { CategoryChip } from '../blog/PostCard'
import { Arrow } from '../ui/Icon'

/**
 * Tarjeta de proyecto: portada 4:3 con los servicios encima, marca y una línea de qué se hizo.
 * Toda la tarjeta es un link. Hover: la portada se acerca y la flecha se endereza.
 * `tone="night"` para usarla sobre fondo oscuro (sección del inicio).
 */
export function ProjectCard({
  project,
  tone = 'paper',
  headingLevel: Heading = 'h3',
  imageClass = 'aspect-4/3',
  boxed = false,
}: {
  project: Project
  tone?: 'paper' | 'night'
  headingLevel?: 'h2' | 'h3'
  /** Proporción de la portada (en el inicio va más apaisada para que la sección entre en una pantalla). */
  imageClass?: string
  /** En una caja (tarjeta con fondo): la grilla del inicio */
  boxed?: boolean
}) {
  const dark = tone === 'night'
  const meta = projectMeta(project)

  return (
    <article
      data-project-card
      className={`group relative ${boxed ? `h-full rounded-4xl p-3 ring-1 transition duration-500 ease-expo hover:-translate-y-1 ${dark ? 'bg-brand-navy ring-white/10 hover:ring-white/25' : 'bg-white ring-brand-deep/10 hover:shadow-lift'}` : ''}`}
    >
      <a href={projectUrl(project.slug)} data-cursor={proyectos.cursor} className="flex flex-col gap-5">
        <div className={`relative ${imageClass} overflow-hidden rounded-3xl ring-1 ${dark ? 'bg-brand-navy ring-white/10' : 'bg-white ring-brand-deep/10'}`}>
          <img
            src={project.cover.src}
            alt={project.cover.alt}
            width={project.cover.width}
            height={project.cover.height}
            loading="lazy"
            decoding="async"
            className="size-full object-cover transition-transform duration-1000 ease-expo group-hover:scale-105"
          />
          {project.services.length > 0 && (
            <ul className="absolute top-4 left-4 flex flex-wrap gap-1.5">
              {project.services.map((s) => (
                <li key={s}>
                  <CategoryChip className="bg-white text-brand-deep">{s}</CategoryChip>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className={`flex flex-col gap-2 ${boxed ? 'px-2 pb-3' : ''}`}>
          {meta && <p className={`text-sm font-semibold ${dark ? 'text-brand-haze' : 'text-brand-night/60'}`}>{meta}</p>}
          <Heading className={`font-display text-2xl transition-colors duration-500 md:text-3xl ${dark ? 'text-white' : 'text-brand-deep group-hover:text-brand-signal'}`}>{project.brand}</Heading>
          {project.title && <p className={`line-clamp-2 text-base ${dark ? 'text-brand-haze' : 'text-brand-night/70'}`}>{project.title}</p>}
          <span className={`mt-1 flex items-center gap-2 text-sm font-bold ${dark ? 'text-white' : 'text-brand-signal'}`}>
            <span className="link-underline">{proyectos.view}</span>
            <Arrow className="size-4 transition-transform duration-500 ease-expo group-hover:rotate-45" />
          </span>
        </div>
      </a>
    </article>
  )
}
