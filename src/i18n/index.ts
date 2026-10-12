import { en, type Dict } from './en';
import { ru } from './ru';

export type Locale = 'en' | 'ru';

export const LOCALES: Locale[] = ['en', 'ru'];
/** English is the default: it lives at the site root. */
export const DEFAULT_LOCALE: Locale = 'en';

const dictionaries: Record<Locale, Dict> = { en, ru };

export function getDict(lang: Locale): Dict {
  return dictionaries[lang];
}

export function isLocale(value: unknown): value is Locale {
  return value === 'en' || value === 'ru';
}

/** `'/ru/blog/x/'` → `'en'`, everything else → `'en'`. */
export function localeFromPath(pathname: string): Locale {
  return pathname.startsWith('/ru') ? 'ru' : 'en';
}

/** Strip the locale prefix: `/ru/blog/x/` → `/blog/x/`. */
export function baseFromPath(pathname: string, lang: Locale): string {
  const stripped = lang === 'ru' ? pathname.replace(/^\/ru(?=\/|$)/, '') : pathname;
  return stripped === '' ? '/' : stripped;
}

/** Opposite-locale version of the current path (used by the lang switch). */
export function switchLocaleUrl(pathname: string, from: Locale): string {
  const base = baseFromPath(pathname, from);
  if (from === 'en') return base === '/' ? '/ru/' : `/ru${base}`;
  return base;
}

/** `/ru/#about` → `/`, `/blog/x/` → `/ru/blog/x/` — home anchor for a section. */
export function sectionUrl(lang: Locale, hash: string): string {
  const prefix = lang === 'ru' ? '/ru/' : '/';
  return `${prefix}${hash}`;
}

export type { Dict };
export { en, ru };
