import { motion } from 'framer-motion';
import { ArrowDown, Github, Mail } from 'lucide-react';
import Background from '../components/Background';
import { useLocale } from '../context/LocaleContext';
import { SITE } from '../data/content';
import type { GithubProfile } from '../types';
import { USERNAME } from '../services/github';

interface HeroProps {
  profile: GithubProfile | null;
}

const fadeUp = {
  hidden: { opacity: 0, y: 26 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.08 * i, duration: 0.7, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  }),
};

export default function Hero({ profile }: HeroProps) {
  const { t } = useLocale();

  const scrollTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  const avatar = profile?.avatar_url ?? `https://github.com/${USERNAME}.png`;

  return (
    <section id="home" className="relative flex min-h-[100svh] items-center overflow-hidden pt-16">
      <Background />

      <div className="container-x relative z-10 py-16">
        <div className="flex flex-col items-center gap-8 text-center">
          {/* Status */}
          <motion.span
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={0}
            className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400"
          >
            <span className="relative flex h-2 w-2" aria-hidden>
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse-dot" />
            </span>
            {t.hero.status}
          </motion.span>

          {/* Avatar */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={1}
            className="relative"
          >
            <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-indigo-500 via-violet-500 to-blue-500 opacity-70 blur-md" />
            <img
              src={avatar}
              alt={`${SITE.name} — ${t.hero.role}`}
              width={144}
              height={144}
              decoding="async"
              className="relative h-28 w-28 rounded-full border-4 border-white object-cover shadow-2xl sm:h-36 sm:w-36 dark:border-ink-900"
            />
          </motion.div>

          {/* Heading */}
          <div className="flex flex-col items-center gap-4">
            <motion.h1
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={2}
              className="text-5xl font-bold tracking-tight text-slate-900 sm:text-6xl lg:text-7xl dark:text-white"
            >
              {SITE.firstName}
            </motion.h1>

            <motion.p
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={3}
              className="gradient-text text-xl font-semibold sm:text-2xl"
            >
              {t.hero.role}
            </motion.p>

            <motion.p
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={4}
              className="max-w-2xl text-base leading-7 text-slate-500 sm:text-lg dark:text-slate-400"
            >
              {t.hero.description}
            </motion.p>
          </div>

          {/* Actions */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={5}
            className="flex flex-wrap items-center justify-center gap-3"
          >
            <button type="button" onClick={() => scrollTo('projects')} className="btn-primary">
              {t.hero.viewProjects}
            </button>
            <a
              href={SITE.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost"
            >
              <Github className="h-4 w-4" aria-hidden />
              GitHub
            </a>
            <button type="button" onClick={() => scrollTo('contact')} className="btn-ghost">
              <Mail className="h-4 w-4" aria-hidden />
              {t.hero.contact}
            </button>
          </motion.div>

          {/* Scroll hint */}
          <motion.button
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={6}
            type="button"
            onClick={() => scrollTo('about')}
            aria-label={t.hero.scroll}
            className="mt-4 flex h-10 w-10 items-center justify-center rounded-full border border-slate-300 text-slate-400 transition-all hover:-translate-y-0.5 hover:text-indigo-500 dark:border-white/10 dark:hover:text-indigo-400"
          >
            <ArrowDown className="h-4 w-4 animate-bounce" aria-hidden />
          </motion.button>
        </div>
      </div>
    </section>
  );
}
