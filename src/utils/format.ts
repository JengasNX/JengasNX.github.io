/** Merge conditional class names. */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

/** Format an ISO date for a given locale (ru / en). */
export function formatDate(iso: string, lang: string): string {
  try {
    return new Intl.DateTimeFormat(lang === 'ru' ? 'ru-RU' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(iso));
  } catch {
    return iso.slice(0, 10);
  }
}

/** Human-friendly "N years ago / N дней назад" style label. */
export function relativeTime(iso: string, lang: string): string {
  try {
    return new Intl.RelativeTimeFormat(lang === 'ru' ? 'ru-RU' : 'en-US', {
      numeric: 'auto',
    }).format(diffDays(Date.now(), new Date(iso).getTime()), 'day');
  } catch {
    return '';
  }
}

function diffDays(a: number, b: number): number {
  return Math.round((a - b) / 86_400_000);
}

/** Compact number formatting: 1234 → 1.2k */
export function compactNumber(n: number): string {
  return new Intl.NumberFormat('en', { notation: 'compact' }).format(n);
}
