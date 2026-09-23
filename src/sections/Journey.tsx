import { GraduationCap, Rocket, Wrench } from 'lucide-react';
import Reveal from '../components/Reveal';
import SectionHeading from '../components/SectionHeading';
import { useLocale } from '../context/LocaleContext';
import type { GithubProfile, Project } from '../types';
import { formatDate } from '../utils/format';

interface JourneyProps {
  profile: GithubProfile | null;
  projects: Project[] | null;
  locale: string;
}

const ICONS = [<GraduationCap key="l" />, <Wrench key="b" />, <Rocket key="s" />];

/**
 * My Journey — Learning → Building → Launching.
 * Only dates that GitHub actually confirms are shown:
 * the account/first repository creation date and the latest push.
 */
export default function Journey({ profile, projects, locale }: JourneyProps) {
  const { t } = useLocale();

  const createdDates = (projects ?? []).map((p) => p.created_at);
  const firstRepo = createdDates.length
    ? createdDates.reduce((a, b) => (a < b ? a : b))
    : profile?.created_at ?? null;

  const lastPush = (projects ?? [])
    .map((p) => p.pushed_at)
    .sort((a, b) => +new Date(b) - +new Date(a))[0] ?? null;

  return (
    <section id="journey" className="py-20 sm:py-28">
      <div className="container-x">
        <SectionHeading
          eyebrow="06"
          title={t.journey.title}
          subtitle={t.journey.subtitle}
        />

        <div className="relative mt-12">
          {/* connecting line (desktop) */}
          <div
            className="absolute left-0 right-0 top-7 hidden h-px bg-gradient-to-r from-transparent via-indigo-400/40 to-transparent lg:block"
            aria-hidden
          />

          <ol className="grid gap-6 lg:grid-cols-3">
            {t.journey.steps.map((step, i) => (
              <Reveal as="li" key={step.tag} delay={i * 120} className="relative">
                <div className="glass h-full rounded-2xl p-6 transition-transform duration-300 hover:-translate-y-1">
                  <div className="mb-4 flex items-center gap-3">
                    <span className="relative z-10 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-lg shadow-indigo-500/25 [&>svg]:h-6 [&>svg]:w-6">
                      {ICONS[i]}
                    </span>
                    <span className="font-mono text-xs font-semibold uppercase tracking-widest text-indigo-500 dark:text-indigo-400">
                      {String(i + 1).padStart(2, '0')} · {step.tag}
                    </span>
                  </div>
                  <p className="text-sm leading-7 text-slate-500 dark:text-slate-400">{step.text}</p>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>

        {/* Real dates confirmed by GitHub */}
        <Reveal delay={150} className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {firstRepo && (
            <span className="chip !px-4 !py-2 text-sm">
              {t.journey.fromLabel}: <strong className="font-semibold">{formatDate(firstRepo, locale)}</strong>
            </span>
          )}
          {lastPush && (
            <span className="chip !px-4 !py-2 text-sm">
              {t.projects.lastPush}: <strong className="font-semibold">{formatDate(lastPush, locale)}</strong>
            </span>
          )}
          <span className="text-xs text-slate-400 dark:text-slate-500">{t.journey.fromNote}</span>
        </Reveal>
      </div>
    </section>
  );
}
