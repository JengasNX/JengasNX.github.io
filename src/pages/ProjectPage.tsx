import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  CalendarDays,
  ExternalLink,
  GitFork,
  Github,
  History,
  Star,
} from 'lucide-react';
import Reveal from '../components/Reveal';
import Spinner from '../components/Spinner';
import StateBlock from '../components/StateBlock';
import { useLocale } from '../context/LocaleContext';
import { getProject, getReadme } from '../services/github';
import type { Project } from '../types';
import { languageColor, CATEGORY_LABEL } from '../utils/language';
import { formatDate } from '../utils/format';
import { renderMarkdown } from '../utils/markdown';

type LoadState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; project: Project };

/** Full project detail page: preview, README, stack, stats, links. */
export default function ProjectPage() {
  const { name = '' } = useParams();
  const { t, locale } = useLocale();

  const [state, setState] = useState<LoadState>({ status: 'loading' });
  const [readme, setReadme] = useState<string | null>(null);
  const [readmeMissing, setReadmeMissing] = useState(false);
  const [showIframe, setShowIframe] = useState(false);
  const [previewFailed, setPreviewFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setState({ status: 'loading' });
    setShowIframe(false);
    setReadme(null);
    setReadmeMissing(false);
    setPreviewFailed(false);

    getProject(name)
      .then((project) => {
        if (cancelled) return;
        if (!project) {
          setState({ status: 'error', message: t.projects.notFound });
          return;
        }
        setState({ status: 'ready', project });

        if (project.hasReadme) {
          getReadme(name)
            .then((md) => !cancelled && setReadme(md))
            .catch(() => !cancelled && setReadmeMissing(true));
        } else {
          setReadmeMissing(true);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setState({
            status: 'error',
            message: err instanceof Error ? err.message : t.projects.error,
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [name, t.projects.notFound, t.projects.error]);

  if (state.status === 'loading') {
    return (
      <div className="flex min-h-[70vh] items-center justify-center pt-24">
        <Spinner label={t.projects.loading} />
      </div>
    );
  }

  if (state.status === 'error') {
    return (
      <div className="container-x pt-32">
        <StateBlock
          variant="error"
          message={state.message}
          retryLabel={t.projects.back}
          onRetry={() => window.history.back()}
        />
        <div className="mt-6 text-center">
          <Link to="/" className="btn-ghost text-xs">
            <ArrowLeft className="h-4 w-4" aria-hidden />
            {t.projects.back}
          </Link>
        </div>
      </div>
    );
  }

  const p = state.project;
  const langEntries = Object.entries(p.tech.languages).sort((a, b) => b[1] - a[1]);
  const langTotal = langEntries.reduce((sum, [, bytes]) => sum + bytes, 0) || 1;

  return (
    <div className="pt-24">
      <div className="container-x pb-24">
        <Link
          to="/"
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-indigo-500 dark:text-slate-400"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          {t.projects.back}
        </Link>

        {/* ------------------------------------------------------- Header */}
        <Reveal>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span className="chip">{CATEGORY_LABEL[p.tech.category]}</span>
                {p.demoUrl && <span className="chip">{t.projects.badgePages}</span>}
                {p.license?.spdx_id && p.license.spdx_id !== 'NOASSERTION' && (
                  <span className="chip">{p.license.spdx_id}</span>
                )}
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
                {p.name}
              </h1>
              <p className="mt-3 max-w-3xl text-base leading-7 text-slate-500 dark:text-slate-400">
                {p.description ?? '—'}
              </p>
            </div>

            <div className="flex shrink-0 flex-wrap gap-2">
              <a
                href={p.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary !px-5 !py-2.5 text-xs"
              >
                <Github className="h-4 w-4" aria-hidden />
                {t.projects.viewOnGithub}
              </a>
              {p.demoUrl && (
                <a
                  href={p.demoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-ghost !px-5 !py-2.5 text-xs"
                >
                  <ExternalLink className="h-4 w-4" aria-hidden />
                  {t.projects.openDemo}
                </a>
              )}
            </div>
          </div>
        </Reveal>

        {/* ------------------------------------------------------ Preview */}
        <Reveal delay={80} className="mt-8">
          <div className="glass overflow-hidden rounded-2xl">
            {!showIframe ? (
              <div className="relative aspect-video w-full bg-ink-900">
                {!previewFailed ? (
                  <img
                    src={p.previewUrl}
                    alt={`${p.name} — ${t.projects.preview}`}
                    decoding="async"
                    onError={() => setPreviewFailed(true)}
                    className="h-full w-full object-cover object-top"
                  />
                ) : (
                  <div className="flex h-full flex-col items-center justify-center gap-2">
                    <span className="font-mono text-indigo-400">{p.name}</span>
                    <span className="text-xs uppercase tracking-widest text-slate-500">
                      {t.projects.noPreview}
                    </span>
                  </div>
                )}

                {p.demoUrl && (
                  <button
                    type="button"
                    onClick={() => setShowIframe(true)}
                    className="btn-primary absolute bottom-4 right-4 !px-4 !py-2 text-xs shadow-xl"
                  >
                    {t.projects.iframeShow}
                  </button>
                )}
              </div>
            ) : (
              <div className="relative aspect-video w-full bg-white">
                {/* Safe iframe preview: framing external sites is optional and
                    may be blocked by their X-Frame-Options / CSP headers. */}
                <iframe
                  src={p.demoUrl ?? ''}
                  title={`${p.name} — ${t.projects.preview}`}
                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                  referrerPolicy="no-referrer"
                  className="h-full w-full border-0"
                  loading="lazy"
                />
                <button
                  type="button"
                  onClick={() => setShowIframe(false)}
                  className="btn-ghost absolute bottom-4 right-4 !px-4 !py-2 text-xs"
                >
                  {t.projects.noPreview}
                </button>
              </div>
            )}
          </div>
          {showIframe && (
            <p className="mt-2 text-xs text-slate-400">{t.projects.iframeNote}</p>
          )}
        </Reveal>

        {/* -------------------------------------------------------- Grid */}
        <div className="mt-8 grid gap-5 lg:grid-cols-[1.6fr_1fr]">
          {/* README */}
          <Reveal>
            <article className="glass rounded-2xl p-6 sm:p-8">
              <h2 className="mb-4 text-lg font-bold text-slate-900 dark:text-white">
                {t.projects.readme}
              </h2>
              {readme ? (
                <div
                  className="md-body"
                  // README is fully escaped inside renderMarkdown before markup.
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(readme) }}
                />
              ) : readmeMissing ? (
                <p className="text-sm text-slate-400">{t.projects.readmeMissing}</p>
              ) : (
                <Spinner label={t.common.loading} />
              )}
            </article>
          </Reveal>

          {/* Sidebar */}
          <Reveal delay={100} className="space-y-5">
            {/* Stats */}
            <div className="glass rounded-2xl p-6">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <p className="flex items-center justify-center gap-1 text-xl font-bold text-slate-900 dark:text-white">
                    <Star className="h-4 w-4 text-amber-400" aria-hidden />
                    {p.stargazers_count}
                  </p>
                  <p className="text-[11px] uppercase tracking-wide text-slate-400">
                    {t.projects.stars}
                  </p>
                </div>
                <div>
                  <p className="flex items-center justify-center gap-1 text-xl font-bold text-slate-900 dark:text-white">
                    <GitFork className="h-4 w-4 text-indigo-400" aria-hidden />
                    {p.forks_count}
                  </p>
                  <p className="text-[11px] uppercase tracking-wide text-slate-400">
                    {t.projects.forks}
                  </p>
                </div>
                <div>
                  <p className="text-xl font-bold text-slate-900 dark:text-white">
                    {(p.size / 1024).toFixed(1)}
                    <span className="text-sm"> KB</span>
                  </p>
                  <p className="text-[11px] uppercase tracking-wide text-slate-400">
                    Size
                  </p>
                </div>
              </div>

              <dl className="mt-5 space-y-3 border-t border-slate-200 pt-5 text-sm dark:border-white/10">
                <div className="flex items-center justify-between gap-3">
                  <dt className="flex items-center gap-2 text-slate-400">
                    <CalendarDays className="h-4 w-4" aria-hidden />
                    {t.projects.created}
                  </dt>
                  <dd className="font-medium text-slate-700 dark:text-slate-200">
                    {formatDate(p.created_at, locale)}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="flex items-center gap-2 text-slate-400">
                    <History className="h-4 w-4" aria-hidden />
                    {t.projects.lastPush}
                  </dt>
                  <dd className="font-medium text-slate-700 dark:text-slate-200">
                    {formatDate(p.pushed_at, locale)}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-slate-400">{t.projects.category}</dt>
                  <dd className="font-medium text-slate-700 dark:text-slate-200">
                    {CATEGORY_LABEL[p.tech.category]}
                  </dd>
                </div>
              </dl>
            </div>

            {/* Languages */}
            <div className="glass rounded-2xl p-6">
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-400">
                {t.skills.languages}
              </h3>
              <div className="mb-4 flex h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-white/5">
                {langEntries.map(([lang, bytes]) => (
                  <span
                    key={lang}
                    style={{
                      width: `${(bytes / langTotal) * 100}%`,
                      backgroundColor: languageColor(lang),
                    }}
                  />
                ))}
              </div>
              <ul className="space-y-2">
                {langEntries.map(([lang, bytes]) => (
                  <li
                    key={lang}
                    className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-300"
                  >
                    <span className="flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: languageColor(lang) }}
                        aria-hidden
                      />
                      {lang}
                    </span>
                    <span className="font-mono text-xs text-slate-400">
                      {((bytes / langTotal) * 100).toFixed(1)}%
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Stack + topics */}
            <div className="glass rounded-2xl p-6">
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
                {t.projects.stack}
              </h3>
              <div className="flex flex-wrap gap-2">
                {[...new Set([...p.tech.libraries, ...Object.keys(p.tech.languages)])].map(
                  (item) => (
                    <span key={item} className="chip">
                      {item}
                    </span>
                  ),
                )}
              </div>

              {p.topics.length > 0 && (
                <>
                  <h3 className="mb-3 mt-5 text-sm font-semibold uppercase tracking-wide text-slate-400">
                    {t.projects.topics}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {p.topics.map((topic) => (
                      <span key={topic} className="chip">
                        #{topic}
                      </span>
                    ))}
                  </div>
                </>
              )}
            </div>
          </Reveal>
        </div>
      </div>
    </div>
  );
}
