import { ArrowUp, Github } from 'lucide-react';
import { useLocale } from '../context/LocaleContext';
import { SITE } from '../data/content';

export default function Footer() {
  const { t } = useLocale();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-200 py-10 dark:border-white/5">
      <div className="container-x flex flex-col items-center justify-between gap-5 sm:flex-row">
        <div className="flex flex-col items-center gap-1.5 text-center sm:items-start sm:text-left">
          <p className="text-sm font-semibold text-slate-900 dark:text-white">
            {SITE.name} <span className="font-normal text-slate-400">· {SITE.role}</span>
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">{t.footer.built}</p>
        </div>

        <div className="flex items-center gap-4">
          <a
            href={SITE.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs font-medium text-slate-500 transition-colors hover:text-indigo-500 dark:text-slate-400"
          >
            <Github className="h-4 w-4" />
            {t.footer.source}
          </a>
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            aria-label="Back to top"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition-all hover:-translate-y-0.5 hover:text-indigo-500 dark:border-white/10 dark:text-slate-400"
          >
            <ArrowUp className="h-4 w-4" />
          </button>
        </div>
      </div>
      <p className="container-x mt-6 text-center text-xs text-slate-400 dark:text-slate-500">
        © {year} {SITE.name}. {t.footer.rights}
      </p>
    </footer>
  );
}
