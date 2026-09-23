import { useMemo, useState } from 'react';
import { RefreshCw, Search } from 'lucide-react';
import ProjectCard from '../components/ProjectCard';
import Reveal from '../components/Reveal';
import SectionHeading from '../components/SectionHeading';
import StateBlock from '../components/StateBlock';
import { useLocale } from '../context/LocaleContext';
import { getFeatured } from '../services/github';
import type { Project, SortKey } from '../types';
import { CATEGORY_LABEL } from '../utils/language';
import { cn } from '../utils/format';

interface ProjectsProps {
  projects: Project[] | null;
  loading: boolean;
  error: string | null;
  rateLimited: boolean;
  refreshing: boolean;
  onRefresh: () => void;
  onRetry: () => void;
}

interface FilterDef {
  key: string;
  label: string;
  match: (p: Project) => boolean;
}

/** Libraries that are useful as standalone filters when present. */
const FILTER_LIBS = ['React', 'Next.js', 'Vite', 'Tailwind CSS'];
const CATEGORY_ORDER = ['frontend', 'backend', 'fullstack', 'python', 'other'];

/** Automatically build filter chips from the actual project data. */
function buildFilters(projects: Project[], allLabel: string): FilterDef[] {
  const filters: FilterDef[] = [
    { key: 'all', label: allLabel, match: () => true },
  ];

  const categories = new Set<string>(projects.map((p) => p.tech.category));
  for (const cat of CATEGORY_ORDER) {
    if (categories.has(cat)) {
      filters.push({
        key: cat,
        label: CATEGORY_LABEL[cat],
        match: (p) => p.tech.category === cat,
      });
    }
  }

  const langCount = new Map<string, number>();
  for (const p of projects) {
    for (const lang of Object.keys(p.tech.languages)) {
      langCount.set(lang, (langCount.get(lang) ?? 0) + 1);
    }
  }
  [...langCount.entries()]
    .sort((a, b) => b[1] - a[1])
    .forEach(([lang]) => {
      filters.push({
        key: `lang:${lang}`,
        label: lang,
        match: (p) => lang in p.tech.languages,
      });
    });

  const libs = new Set(projects.flatMap((p) => p.tech.libraries));
  for (const lib of FILTER_LIBS) {
    if (libs.has(lib)) {
      filters.push({
        key: `lib:${lib}`,
        label: lib,
        match: (p) => p.tech.libraries.includes(lib),
      });
    }
  }

  return filters;
}

export default function Projects({
  projects,
  loading,
  error,
  rateLimited,
  refreshing,
  onRefresh,
  onRetry,
}: ProjectsProps) {
  const { t } = useLocale();
  const [query, setQuery] = useState('');
  const [filterKey, setFilterKey] = useState('all');
  const [sortKey, setSortKey] = useState<SortKey>('updated');

  const list = useMemo(() => projects ?? [], [projects]);

  const filters = useMemo(
    () => buildFilters(list, t.projects.filterAll),
    [list, t.projects.filterAll],
  );

  const activeFilter =
    filters.find((f) => f.key === filterKey) ?? filters[0];

  const featured = useMemo(() => getFeatured(list, 3), [list]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const result = list.filter((p) => {
      if (!activeFilter.match(p)) return false;
      if (!q) return true;
      const haystack = [
        p.name,
        p.description ?? '',
        p.language ?? '',
        ...p.topics,
        ...p.tech.libraries,
        ...Object.keys(p.tech.languages),
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });

    return result.sort((a, b) => {
      switch (sortKey) {
        case 'created':
          return +new Date(b.created_at) - +new Date(a.created_at);
        case 'stars':
          return b.stargazers_count - a.stargazers_count;
        case 'name':
          return a.name.localeCompare(b.name);
        case 'updated':
        default:
          return +new Date(b.pushed_at) - +new Date(a.pushed_at);
      }
    });
  }, [list, activeFilter, query, sortKey]);

  const refreshButton = (
    <button
      type="button"
      onClick={onRefresh}
      disabled={refreshing}
      className="btn-ghost !px-4 !py-2 text-xs disabled:opacity-60"
      aria-label={t.projects.refresh}
    >
      <RefreshCw className={cn('h-3.5 w-3.5', refreshing && 'animate-spin')} aria-hidden />
      {refreshing ? t.projects.refreshing : t.projects.refresh}
    </button>
  );

  return (
    <section id="projects" className="py-20 sm:py-28">
      <div className="container-x space-y-14">
        {/* ------------------------------------------------ Featured */}
        <div>
          <SectionHeading
            eyebrow="03"
            title={t.projects.featured}
            subtitle={t.projects.featuredNote}
            action={refreshButton}
          />

          <div className="mt-10 space-y-5">
            {loading && !projects && (
              <StateBlock variant="loading" message={t.projects.loading} />
            )}
            {error && !projects && (
              <StateBlock
                variant="error"
                message={error}
                onRetry={onRetry}
                retryLabel={t.projects.retry}
              />
            )}
            {projects && featured.length === 0 && (
              <StateBlock variant="empty" message={t.projects.empty} />
            )}
            {featured.length > 0 && (
              <div className="grid gap-5 lg:grid-cols-2">
                {featured.map((project, i) => (
                  <Reveal
                    key={project.id}
                    delay={i * 90}
                    className={cn(i === 0 && 'lg:col-span-2')}
                  >
                    <ProjectCard project={project} featured />
                  </Reveal>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ---------------------------------------------------- All */}
        <div>
          <SectionHeading eyebrow="04" title={t.projects.all} />

          {rateLimited && (
            <Reveal className="mt-6">
              <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-600 dark:text-amber-400">
                {t.projects.rateLimited}
              </p>
            </Reveal>
          )}

          {/* Controls */}
          <Reveal className="mt-6 flex flex-col gap-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              {/* Search */}
              <div className="relative flex-1">
                <Search
                  className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                  aria-hidden
                />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t.projects.search}
                  aria-label={t.projects.search}
                  className="input !pl-11"
                />
              </div>

              {/* Sort */}
              <label className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                <span className="whitespace-nowrap">{t.projects.sort}</span>
                <select
                  value={sortKey}
                  onChange={(e) => setSortKey(e.target.value as SortKey)}
                  className="input !w-auto cursor-pointer py-2.5 text-sm"
                  aria-label={t.projects.sort}
                >
                  <option value="updated">{t.projects.sortUpdated}</option>
                  <option value="created">{t.projects.sortCreated}</option>
                  <option value="stars">{t.projects.sortStars}</option>
                  <option value="name">{t.projects.sortName}</option>
                </select>
              </label>
            </div>

            {/* Filters (auto-generated from project data) */}
            <div
              className="flex flex-wrap gap-2"
              role="group"
              aria-label={t.projects.filters}
            >
              {filters.map((f) => (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setFilterKey(f.key)}
                  aria-pressed={filterKey === f.key}
                  className={cn(
                    'rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all duration-200',
                    filterKey === f.key
                      ? 'border-indigo-500 bg-indigo-500 text-white shadow-md shadow-indigo-500/25'
                      : 'border-slate-200 text-slate-600 hover:border-indigo-400 hover:text-indigo-500 dark:border-white/10 dark:text-slate-300 dark:hover:border-indigo-400/50 dark:hover:text-indigo-300',
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </Reveal>

          {/* Grid */}
          <div className="mt-8">
            {loading && !projects && (
              <StateBlock variant="loading" message={t.projects.loading} />
            )}
            {error && !projects && (
              <StateBlock
                variant="error"
                message={error}
                onRetry={onRetry}
                retryLabel={t.projects.retry}
              />
            )}
            {projects && filtered.length === 0 && (
              <StateBlock variant="empty" message={t.projects.empty} />
            )}
            {filtered.length > 0 && (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map((project, i) => (
                  <Reveal key={project.id} delay={(i % 3) * 80}>
                    <ProjectCard project={project} />
                  </Reveal>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
