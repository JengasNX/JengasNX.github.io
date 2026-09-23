import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Github, Menu, Moon, Sun, X } from 'lucide-react';
import { useLocale } from '../context/LocaleContext';
import { useTheme } from '../context/ThemeContext';
import { cn } from '../utils/format';
import { SITE } from '../data/content';

type NavKey = 'home' | 'about' | 'skills' | 'projects' | 'github' | 'journey' | 'services' | 'articles' | 'contact';

const LINKS: Array<{ id: string; key: NavKey }> = [
  { id: 'home', key: 'home' },
  { id: 'about', key: 'about' },
  { id: 'skills', key: 'skills' },
  { id: 'projects', key: 'projects' },
  { id: 'github', key: 'github' },
  { id: 'journey', key: 'journey' },
  { id: 'services', key: 'services' },
  { id: 'articles', key: 'articles' },
  { id: 'contact', key: 'contact' },
];

/** Sticky navigation with language switch, theme toggle and mobile menu. */
export default function Navbar() {
  const { t, locale, setLocale } = useLocale();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState('home');

  /* Shadow/blur once the page is scrolled. */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* Highlight the section currently in view (home page only). */
  useEffect(() => {
    if (location.pathname !== '/') return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: '-40% 0px -55% 0px' },
    );
    LINKS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [location.pathname]);

  /** Navigate home (if needed) and smooth-scroll to a section. */
  const goTo = (id: string) => {
    setOpen(false);
    const scroll = () =>
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

    if (location.pathname !== '/') {
      navigate('/');
      // Wait for the home page to mount before scrolling.
      window.setTimeout(scroll, 80);
    } else {
      scroll();
    }
  };

  const isHome = location.pathname === '/';

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-all duration-300',
        scrolled
          ? 'border-b border-slate-200/70 bg-white/80 backdrop-blur-xl dark:border-white/5 dark:bg-ink-950/80'
          : 'border-b border-transparent bg-transparent',
      )}
    >
      <nav aria-label="Main" className="container-x flex h-16 items-center justify-between gap-4">
        {/* Brand */}
        <button
          type="button"
          onClick={() => goTo('home')}
          className="group flex items-center gap-2.5"
          aria-label={SITE.name}
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 text-sm font-bold text-white shadow-md shadow-indigo-500/25">
            J
          </span>
          <span className="text-sm font-semibold tracking-tight text-slate-900 dark:text-white">
            {SITE.name}
          </span>
        </button>

        {/* Desktop links */}
        <ul className="hidden items-center gap-1 xl:flex">
          {LINKS.map(({ id, key }) => (
            <li key={id}>
              <button
                type="button"
                onClick={() => goTo(id)}
                aria-current={isHome && active === id ? 'true' : undefined}
                className={cn(
                  'rounded-full px-3 py-1.5 text-[13px] font-medium transition-colors',
                  isHome && active === id
                    ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white',
                )}
              >
                {t.nav[key]}
              </button>
            </li>
          ))}
        </ul>

        {/* Right controls */}
        <div className="flex items-center gap-2">
          {/* Language */}
          <div
            className="hidden items-center rounded-full border border-slate-200 p-0.5 sm:flex dark:border-white/10"
            role="group"
            aria-label={t.common.language}
          >
            {(['ru', 'en'] as const).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLocale(l)}
                aria-pressed={locale === l}
                className={cn(
                  'rounded-full px-2.5 py-1 text-xs font-semibold uppercase transition-colors',
                  locale === l
                    ? 'bg-indigo-500 text-white'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white',
                )}
              >
                {l}
              </button>
            ))}
          </div>

          {/* Theme */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={t.common.theme}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition-colors hover:bg-slate-100 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          {/* GitHub */}
          <a
            href={SITE.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            className="hidden h-9 items-center gap-2 rounded-full bg-slate-900 px-4 text-xs font-semibold text-white transition-transform hover:scale-105 sm:flex dark:bg-white dark:text-ink-950"
          >
            <Github className="h-4 w-4" />
            {t.nav.openGithub}
          </a>

          {/* Mobile language + menu */}
          <button
            type="button"
            onClick={() => setLocale(locale === 'ru' ? 'en' : 'ru')}
            className="rounded-full border border-slate-200 px-2.5 py-1.5 text-xs font-bold uppercase text-slate-600 sm:hidden dark:border-white/10 dark:text-slate-300"
            aria-label={t.common.language}
          >
            {locale}
          </button>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={open ? t.nav.close : t.nav.menu}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-700 xl:hidden dark:border-white/10 dark:text-slate-200"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-slate-200 bg-white/95 backdrop-blur-xl xl:hidden dark:border-white/5 dark:bg-ink-950/95">
          <ul className="container-x flex flex-col gap-1 py-4">
            {LINKS.map(({ id, key }) => (
              <li key={id}>
                <button
                  type="button"
                  onClick={() => goTo(id)}
                  className="w-full rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/5"
                >
                  {t.nav[key]}
                </button>
              </li>
            ))}
            <li className="mt-2 flex gap-2 border-t border-slate-200 pt-3 dark:border-white/10">
              <Link
                to="/profile"
                onClick={() => setOpen(false)}
                className="btn-ghost flex-1 !py-2.5 text-xs"
              >
                {t.nav.profile}
              </Link>
              <a
                href={SITE.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary flex-1 !py-2.5 text-xs"
              >
                GitHub
              </a>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
