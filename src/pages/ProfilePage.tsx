import { Link } from 'react-router-dom';
import { ArrowLeft, CalendarDays, Github, UserRound } from 'lucide-react';
import ProjectCard from '../components/ProjectCard';
import Reveal from '../components/Reveal';
import SectionHeading from '../components/SectionHeading';
import StatCounter from '../components/StatCounter';
import StateBlock from '../components/StateBlock';
import { useGithub } from '../hooks/useGithub';
import { useLocale } from '../context/LocaleContext';
import { SITE } from '../data/content';
import { USERNAME } from '../services/github';
import { languageColor } from '../utils/language';
import { formatDate } from '../utils/format';

/**
 * GitHub Profile page — a professional presentation of the public profile:
 * avatar, name, stats, technologies, recent repositories, big CTA.
 */
export default function ProfilePage() {
  const { t, locale } = useLocale();
  const { profile, projects, stats, loading, error, retry } = useGithub();

  const avatar = profile?.avatar_url ?? `https://github.com/${USERNAME}.png`;

  const libCount = new Map<string, number>();
  for (const p of projects ?? []) {
    for (const lib of p.tech.libraries) libCount.set(lib, (libCount.get(lib) ?? 0) + 1);
  }
  const libs = [...libCount.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([name]) => name);

  const langShares = (() => {
    const languages = stats?.languages ?? {};
    const total = Object.values(languages).reduce((a, b) => a + b, 0) || 1;
    return Object.entries(languages)
      .map(([name, bytes]) => ({ name, pct: (bytes / total) * 100 }))
      .sort((a, b) => b.pct - a.pct);
  })();

  return (
    <div className="pt-24">
      <div className="container-x pb-24">
        {/* Back */}
        <Link
          to="/"
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-indigo-500 dark:text-slate-400"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          {t.profile.back}
        </Link>

        <SectionHeading
          eyebrow="GitHub"
          title={t.profile.title}
          subtitle={t.profile.subtitle}
        />

        {loading && !profile && (
          <div className="mt-10">
            <StateBlock variant="loading" message={t.githubSection.loading} />
          </div>
        )}
        {error && !profile && (
          <div className="mt-10">
            <StateBlock
              variant="error"
              message={error}
              onRetry={retry}
              retryLabel={t.projects.retry}
            />
          </div>
        )}

        {profile && (
          <>
            {/* ------------------------------------------------ Profile card */}
            <Reveal className="mt-10">
              <div className="glass relative overflow-hidden rounded-3xl">
                {/* banner */}
                <div className="h-28 bg-gradient-to-r from-indigo-600/30 via-violet-600/20 to-blue-600/30 sm:h-36" />

                <div className="flex flex-col gap-6 px-6 pb-8 sm:-mt-14 sm:flex-row sm:items-end sm:px-8">
                  <div className="relative w-fit">
                    <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 opacity-70 blur-sm" />
                    <img
                      src={avatar}
                      alt={profile.login}
                      width={128}
                      height={128}
                      decoding="async"
                      className="relative h-24 w-24 rounded-full border-4 border-white object-cover shadow-xl sm:h-28 sm:w-28 dark:border-ink-900"
                    />
                  </div>

                  <div className="flex-1 space-y-1.5 sm:pb-2">
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl dark:text-white">
                        {SITE.firstName}
                      </h2>
                      <span className="chip font-mono">@{profile.login}</span>
                    </div>
                    <p className="gradient-text text-sm font-semibold">{t.hero.role}</p>
                    {profile.bio && (
                      <p className="max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
                        {profile.bio}
                      </p>
                    )}
                    <p className="flex flex-wrap items-center gap-4 pt-1 text-xs text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <CalendarDays className="h-3.5 w-3.5" aria-hidden />
                        {t.profile.joined}: {formatDate(profile.created_at, locale)}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <UserRound className="h-3.5 w-3.5" aria-hidden />
                        {profile.followers} / {profile.following}
                      </span>
                    </p>
                  </div>

                  <a
                    href={SITE.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary shrink-0 self-start sm:self-auto"
                  >
                    <Github className="h-4 w-4" aria-hidden />
                    {t.profile.open}
                  </a>
                </div>
              </div>
            </Reveal>

            {/* ------------------------------------------------------ Stats */}
            {stats && (
              <Reveal className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
                {[
                  { value: stats.publicRepos, label: t.profile.repos },
                  { value: stats.totalStars, label: t.githubSection.stars },
                  { value: stats.totalForks, label: t.githubSection.forks },
                  { value: profile.followers, label: t.githubSection.followers },
                ].map((c) => (
                  <div key={c.label} className="glass rounded-2xl px-4 py-6 text-center">
                    <StatCounter value={c.value} label={c.label} />
                  </div>
                ))}
              </Reveal>
            )}

            {/* ----------------------------------------------- Technologies */}
            <div className="mt-10 grid gap-5 lg:grid-cols-2">
              <Reveal>
                <div className="glass h-full rounded-2xl p-6">
                  <h3 className="mb-4 text-base font-semibold text-slate-900 dark:text-white">
                    {t.githubSection.languages}
                  </h3>
                  <ul className="space-y-3">
                    {langShares.map((s) => (
                      <li key={s.name}>
                        <div className="mb-1 flex items-center justify-between text-sm">
                          <span className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                            <span
                              className="h-2.5 w-2.5 rounded-full"
                              style={{ backgroundColor: languageColor(s.name) }}
                              aria-hidden
                            />
                            {s.name}
                          </span>
                          <span className="font-mono text-xs text-slate-400">
                            {s.pct.toFixed(1)}%
                          </span>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-white/5">
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{
                              width: `${Math.max(s.pct, 2)}%`,
                              backgroundColor: languageColor(s.name),
                            }}
                          />
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>

              <Reveal delay={100}>
                <div className="glass h-full rounded-2xl p-6">
                  <h3 className="mb-4 text-base font-semibold text-slate-900 dark:text-white">
                    {t.profile.tech}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {libs.length === 0 ? (
                      <span className="text-sm text-slate-400">—</span>
                    ) : (
                      libs.map((lib) => <span key={lib} className="chip">{lib}</span>)
                    )}
                  </div>

                  <h3 className="mb-3 mt-6 text-base font-semibold text-slate-900 dark:text-white">
                    {t.profile.activity}
                  </h3>
                  <ul className="space-y-2">
                    {(stats?.recent ?? []).map((repo) => (
                      <li key={repo.id} className="flex items-center gap-3 text-sm">
                        <span
                          className="h-2 w-2 shrink-0 rounded-full"
                          style={{ backgroundColor: languageColor(repo.language) }}
                          aria-hidden
                        />
                        <a
                          href={repo.html_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="min-w-0 flex-1 truncate text-slate-600 transition-colors hover:text-indigo-500 dark:text-slate-300"
                        >
                          {repo.name}
                        </a>
                        <span className="shrink-0 text-xs text-slate-400">
                          {formatDate(repo.pushed_at, locale)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            </div>

            {/* ------------------------------------------------- Repos list */}
            {projects && projects.length > 0 && (
              <>
                <h3 className="mt-12 text-xl font-bold text-slate-900 dark:text-white">
                  {t.profile.repos}
                </h3>
                <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {projects.map((project, i) => (
                    <Reveal key={project.id} delay={(i % 3) * 80}>
                      <ProjectCard project={project} />
                    </Reveal>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
