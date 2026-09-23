import { ArrowRight, GitFork, Star, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import Reveal from '../components/Reveal';
import SectionHeading from '../components/SectionHeading';
import StatCounter from '../components/StatCounter';
import StateBlock from '../components/StateBlock';
import { useLocale } from '../context/LocaleContext';
import { SITE } from '../data/content';
import type { GithubProfile, GithubStats } from '../types';
import { languageColor } from '../utils/language';
import { compactNumber, formatDate } from '../utils/format';

interface GithubSectionProps {
  profile: GithubProfile | null;
  stats: GithubStats | null;
  loading: boolean;
  error: string | null;
  locale: string;
  onRetry: () => void;
}

/** Language share by bytes across all repositories (0–100%). */
function languageShares(languages: Record<string, number>) {
  const total = Object.values(languages).reduce((a, b) => a + b, 0) || 1;
  return Object.entries(languages)
    .map(([name, bytes]) => ({ name, pct: (bytes / total) * 100 }))
    .sort((a, b) => b.pct - a.pct);
}

export default function GithubSection({
  profile,
  stats,
  loading,
  error,
  locale,
  onRetry,
}: GithubSectionProps) {
  const { t } = useLocale();

  if (!stats && loading) {
    return (
      <section id="github" className="py-20 sm:py-28">
        <div className="container-x">
          <SectionHeading eyebrow="05" title={t.githubSection.title} subtitle={t.githubSection.subtitle} />
          <div className="mt-10">
            <StateBlock variant="loading" message={t.githubSection.loading} />
          </div>
        </div>
      </section>
    );
  }

  if (!stats) {
    return (
      <section id="github" className="py-20 sm:py-28">
        <div className="container-x">
          <SectionHeading eyebrow="05" title={t.githubSection.title} subtitle={t.githubSection.subtitle} />
          <div className="mt-10">
            <StateBlock
              variant="error"
              message={error ?? t.githubSection.error}
              onRetry={onRetry}
              retryLabel={t.githubSection.retry}
            />
          </div>
        </div>
      </section>
    );
  }

  const shares = languageShares(stats.languages);
  const counters = [
    { value: stats.publicRepos, label: t.githubSection.repos },
    { value: stats.followers, label: t.githubSection.followers },
    { value: stats.following, label: t.githubSection.following },
    { value: stats.totalStars, label: t.githubSection.stars },
    { value: stats.totalForks, label: t.githubSection.forks },
  ];

  return (
    <section id="github" className="relative overflow-hidden py-20 sm:py-28">
      {/* ambient background */}
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-indigo-500/[0.04] to-transparent"
        aria-hidden
      />

      <div className="container-x relative">
        <SectionHeading
          eyebrow="05"
          title={t.githubSection.title}
          subtitle={t.githubSection.subtitle}
          action={
            <Link to="/profile" className="btn-primary !px-5 !py-2.5 text-xs">
              {t.nav.profile}
              <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          }
        />

        {/* Counters */}
        <Reveal className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {counters.map((c) => (
            <div
              key={c.label}
              className="glass rounded-2xl px-4 py-6 text-center transition-transform duration-300 hover:-translate-y-1"
            >
              <StatCounter value={c.value} label={c.label} />
            </div>
          ))}
        </Reveal>

        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          {/* Languages */}
          <Reveal>
            <div className="glass h-full rounded-2xl p-6">
              <div className="mb-5 flex items-center justify-between gap-3">
                <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                  {t.githubSection.languages}
                </h3>
                <span className="text-xs text-slate-400">
                  <Star className="mr-1 inline h-3.5 w-3.5" aria-hidden />
                  {compactNumber(stats.totalStars)}
                </span>
              </div>

              {shares.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400">—</p>
              ) : (
                <>
                  {/* stacked bar */}
                  <div
                    className="flex h-3 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-white/5"
                    role="img"
                    aria-label={shares.map((s) => `${s.name} ${s.pct.toFixed(0)}%`).join(', ')}
                  >
                    {shares.map((s) => (
                      <span
                        key={s.name}
                        className="h-full transition-all duration-700"
                        style={{
                          width: `${Math.max(s.pct, 2)}%`,
                          backgroundColor: languageColor(s.name),
                        }}
                      />
                    ))}
                  </div>

                  <ul className="mt-5 space-y-3">
                    {shares.map((s) => (
                      <li key={s.name} className="flex items-center gap-3 text-sm">
                        <span
                          className="h-2.5 w-2.5 shrink-0 rounded-full"
                          style={{ backgroundColor: languageColor(s.name) }}
                          aria-hidden
                        />
                        <span className="flex-1 text-slate-600 dark:text-slate-300">{s.name}</span>
                        <span className="font-mono text-xs text-slate-400">
                          {s.pct.toFixed(1)}%
                        </span>
                      </li>
                    ))}
                  </ul>
                </>
              )}

              <p className="mt-5 flex items-start gap-2 text-xs leading-5 text-slate-400 dark:text-slate-500">
                <Users className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
                {t.githubSection.note}
              </p>
            </div>
          </Reveal>

          {/* Recently updated */}
          <Reveal delay={100}>
            <div className="glass h-full rounded-2xl p-6">
              <h3 className="mb-5 text-base font-semibold text-slate-900 dark:text-white">
                {t.githubSection.recent}
              </h3>

              <ul className="space-y-3">
                {stats.recent.map((repo) => (
                  <li key={repo.id}>
                    <a
                      href={repo.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center gap-3 rounded-xl border border-transparent px-3 py-2.5 transition-all hover:border-indigo-400/30 hover:bg-indigo-500/5"
                    >
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: languageColor(repo.language) }}
                        aria-hidden
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-slate-800 group-hover:text-indigo-500 dark:text-slate-100 dark:group-hover:text-indigo-400">
                          {repo.name}
                        </span>
                        <span className="block truncate text-xs text-slate-400">
                          {formatDate(repo.pushed_at, locale)}
                        </span>
                      </span>
                      <span className="flex shrink-0 items-center gap-2 text-xs text-slate-400">
                        <Star className="h-3.5 w-3.5" aria-hidden />
                        {compactNumber(repo.stargazers_count)}
                        <GitFork className="h-3.5 w-3.5" aria-hidden />
                        {compactNumber(repo.forks_count)}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>

              <div className="mt-5 flex flex-wrap gap-2 border-t border-slate-200 pt-5 dark:border-white/10">
                <a
                  href={SITE.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-ghost !px-4 !py-2 text-xs"
                >
                  {t.githubSection.open}
                </a>
                {profile && (
                  <span className="chip">
                    {t.profile.joined}: {formatDate(profile.created_at, locale)}
                  </span>
                )}
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
