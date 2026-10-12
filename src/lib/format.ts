import type { Locale } from '../i18n';

const LOCALE_TAG: Record<Locale, string> = { en: 'en-GB', ru: 'ru-RU' };

export function formatNumber(value: number, lang: Locale): string {
  return new Intl.NumberFormat(LOCALE_TAG[lang]).format(value);
}

/** `2026-10-01T…` → `1 Oct 2026` / `1 окт 2026 г.` */
export function formatDate(iso: string, lang: Locale): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString(LOCALE_TAG[lang], {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/** Month + year only (compact cards). */
export function formatMonthYear(iso: string, lang: Locale): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString(LOCALE_TAG[lang], { month: 'short', year: 'numeric' });
}

export function formatYear(iso: string, lang: Locale): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString(LOCALE_TAG[lang], { year: 'numeric' });
}

/** `14:32` — used by the "data updated" note. */
export function formatClock(iso: string | number, lang: Locale): string {
  const d = typeof iso === 'number' ? new Date(iso) : new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleTimeString(LOCALE_TAG[lang], { hour: '2-digit', minute: '2-digit' });
}

/** Naive reading time: 200 wpm. */
export function readingTime(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

/** `{n} min read` with the locale-aware template from the dictionary. */
export function fill(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => String(vars[key] ?? ''));
}

export function escapeHtml(src: string): string {
  return src
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
