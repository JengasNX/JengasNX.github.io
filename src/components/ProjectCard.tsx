import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, ExternalLink, GitFork, Star } from 'lucide-react';
import type { Project } from '../types';
import { useLocale } from '../context/LocaleContext';
import { languageColor, CATEGORY_LABEL } from '../utils/language';
import { cn } from '../utils/format';

interface ProjectCardProps {
  project: Project;
  featured?: boolean;
  /** Show the large GitHub-generated preview image. */
  showPreview?: boolean;
}

/**
 * Project card: visual preview, description, detected technologies,
 * GitHub link and Live Demo (when GitHub Pages / homepage exists).
 */
export default function ProjectCard({
  project,
  featured = false,
  showPreview = true,
}: ProjectCardProps) {
  const { t } = useLocale();
  const [imgFailed, setImgFailed] = useState(false);

  const libs = project.tech.libraries;
  const visibleLibs = libs.slice(0, featured ? 5 : 3);
  const restCount = libs.length - visibleLibs.length;

  return (
    <article
      className={cn(
        'group glass flex h-full flex-col overflow-hidden rounded-2xl transition-all duration-300 hover:-translate-y-1.5 hover:border-indigo-400/40 hover:shadow-xl hover:shadow-indigo-500/10',
        featured && 'sm:flex-row',
      )}
    >
      {/* Preview */}
      {showPreview && (
        <Link
          to={`/project/${project.name}`}
          className={cn(
            'relative block overflow-hidden bg-ink-900',
            featured ? 'sm:w-1/2' : '',
          )}
          aria-label={`${t.projects.preview}: ${project.name}`}
        >
          <div className={cn('aspect-video w-full', featured && 'sm:h-full sm:min-h-[240px]')}>
            {!imgFailed ? (
              <img
                src={project.previewUrl}
                alt={`${project.name} — ${t.projects.noPreview}`}
                loading="lazy"
                decoding="async"
                onError={() => setImgFailed(true)}
                className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
              />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-ink-800 via-ink-900 to-black p-4 text-center">
                <span className="font-mono text-sm font-semibold text-indigo-400">
                  {project.name}
                </span>
                <span className="text-[11px] uppercase tracking-widest text-slate-500">
                  {t.projects.noPreview}
                </span>
              </div>
            )}
          </div>

          {/* Badges over the preview */}
          <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
            {featured && (
              <span className="rounded-full bg-indigo-500 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-md">
                {t.projects.badgeFeatured}
              </span>
            )}
            {project.demoUrl && (
              <span className="rounded-full bg-emerald-500/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-md">
                {t.projects.badgePages}
              </span>
            )}
          </div>
        </Link>
      )}

      {/* Body */}
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <Link
            to={`/project/${project.name}`}
            className="text-lg font-semibold leading-snug text-slate-900 transition-colors group-hover:text-indigo-500 dark:text-white"
          >
            {project.name}
            <ArrowUpRight
              className="ml-1 inline h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100"
              aria-hidden
            />
          </Link>

          <div className="flex shrink-0 items-center gap-2.5 text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1" title={t.projects.stars}>
              <Star className="h-3.5 w-3.5" aria-hidden />
              {project.stargazers_count}
            </span>
            <span className="flex items-center gap-1" title={t.projects.forks}>
              <GitFork className="h-3.5 w-3.5" aria-hidden />
              {project.forks_count}
            </span>
          </div>
        </div>

        <p className="line-clamp-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
          {project.description ?? '—'}
        </p>

        {/* Detected technologies */}
        <div className="flex flex-wrap gap-1.5">
          <span className="chip">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: languageColor(project.language) }}
              aria-hidden
            />
            {project.language ?? '—'}
          </span>
          <span className="chip">{CATEGORY_LABEL[project.tech.category]}</span>
          {visibleLibs.map((lib) => (
            <span key={lib} className="chip">
              {lib}
            </span>
          ))}
          {restCount > 0 && <span className="chip">+{restCount}</span>}
        </div>

        {/* Actions */}
        <div className="mt-auto flex flex-wrap items-center gap-2 pt-2">
          <Link to={`/project/${project.name}`} className="btn-primary !px-4 !py-2 text-xs">
            {t.projects.details}
          </Link>
          <a
            href={project.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-ghost !px-4 !py-2 text-xs"
          >
            {t.projects.github}
          </a>
          {project.demoUrl && (
            <a
              href={project.demoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost !px-4 !py-2 text-xs"
            >
              <ExternalLink className="h-3.5 w-3.5" aria-hidden />
              {t.projects.demo}
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
