import { PenLine } from 'lucide-react';
import Reveal from '../components/Reveal';
import SectionHeading from '../components/SectionHeading';
import { useLocale } from '../context/LocaleContext';
import { ARTICLES } from '../data/content';
import { formatDate } from '../utils/format';

/**
 * Articles & Notes.
 * Content source: src/data/content.ts → ARTICLES.
 * The array is intentionally empty until real articles are written.
 */
export default function Articles({ locale }: { locale: string }) {
  const { t } = useLocale();

  return (
    <section id="articles" className="py-20 sm:py-28">
      <div className="container-x">
        <SectionHeading
          eyebrow="08"
          title={t.articles.title}
          subtitle={t.articles.subtitle}
        />

        {ARTICLES.length === 0 ? (
          <Reveal className="mt-10">
            <div className="glass flex flex-col items-center gap-4 rounded-2xl px-6 py-14 text-center">
              <span
                className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/15 to-violet-500/15 text-indigo-500 dark:text-indigo-400"
                aria-hidden
              >
                <PenLine className="h-6 w-6" />
              </span>
              <p className="max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
                {t.articles.empty}
              </p>
            </div>
          </Reveal>
        ) : (
          <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {ARTICLES.map((article, i) => (
              <Reveal as="li" key={article.slug} delay={i * 80}>
                <a
                  href={article.url ?? `#/articles/${article.slug}`}
                  className="glass group flex h-full flex-col gap-3 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1.5 hover:border-indigo-400/40"
                >
                  <span className="text-xs text-slate-400">{formatDate(article.date, locale)}</span>
                  <h3 className="text-base font-semibold text-slate-900 transition-colors group-hover:text-indigo-500 dark:text-white">
                    {article.title}
                  </h3>
                  <p className="line-clamp-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
                    {article.excerpt}
                  </p>
                  <div className="mt-auto flex flex-wrap gap-1.5 pt-2">
                    {article.tags.map((tag) => (
                      <span key={tag} className="chip">
                        {tag}
                      </span>
                    ))}
                  </div>
                </a>
              </Reveal>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
