import { Code2, GitBranch, Layers } from 'lucide-react';
import Reveal from '../components/Reveal';
import SectionHeading from '../components/SectionHeading';
import { useLocale } from '../context/LocaleContext';
import { SITE } from '../data/content';
import type { GithubProfile, GithubStats } from '../types';
import { formatDate } from '../utils/format';

interface AboutProps {
  profile: GithubProfile | null;
  stats: GithubStats | null;
}

/** About — text is editable in src/locales/{ru,en}.ts (sections about.*). */
export default function About({ profile, stats }: AboutProps) {
  const { t, locale } = useLocale();

  const langCount = stats ? Object.keys(stats.languages).length : null;

  const facts = [
    {
      icon: <Code2 className="h-5 w-5" aria-hidden />,
      label: t.about.stats.repos,
      value: profile ? String(profile.public_repos) : '—',
    },
    {
      icon: <GitBranch className="h-5 w-5" aria-hidden />,
      label: t.about.stats.since,
      value: profile ? formatDate(profile.created_at, locale) : '—',
    },
    {
      icon: <Layers className="h-5 w-5" aria-hidden />,
      label: t.about.stats.langs,
      value: langCount !== null ? String(langCount) : '—',
    },
  ];

  return (
    <section id="about" className="py-20 sm:py-28">
      <div className="container-x">
        <SectionHeading eyebrow={SITE.name} title={t.about.title} />

        <div className="mt-10 grid gap-10 lg:grid-cols-[1.4fr_1fr]">
          {/* Text */}
          <Reveal className="space-y-5">
            <p className="text-lg font-medium leading-8 text-slate-800 sm:text-xl dark:text-slate-100">
              {t.about.lead}
            </p>
            <p className="leading-8 text-slate-500 dark:text-slate-400">{t.about.p1}</p>
            <p className="leading-8 text-slate-500 dark:text-slate-400">{t.about.p2}</p>
            <p className="leading-8 text-slate-500 dark:text-slate-400">{t.about.p3}</p>
          </Reveal>

          {/* Facts */}
          <Reveal delay={120} className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
            {facts.map((fact) => (
              <div
                key={fact.label}
                className="glass flex items-center gap-4 rounded-2xl p-5 transition-transform duration-300 hover:-translate-y-1"
              >
                <span
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/15 to-violet-500/15 text-indigo-500 dark:text-indigo-400"
                  aria-hidden
                >
                  {fact.icon}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-lg font-bold text-slate-900 dark:text-white">
                    {fact.value}
                  </p>
                  <p className="truncate text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    {fact.label}
                  </p>
                </div>
              </div>
            ))}
          </Reveal>
        </div>
      </div>
    </section>
  );
}
