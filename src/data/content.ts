/**
 * Editable site content. Only real / explicitly-placeholder values live here.
 *
 * Contacts: GitHub is real (from the profile). Telegram, Discord and Email
 * are placeholders until real links are provided — replace the values below.
 */

export const SITE = {
  name: 'JengasAdmin',
  firstName: 'Вячеслав',
  role: 'Full Stack Developer',
  githubUrl: 'https://github.com/JengasAdmin',
  /** Built site URL (used for canonical/OG). */
  siteUrl: 'https://jengasadmin.github.io/',
} as const;

/**
 * Contact channels.
 * ⚠️ Replace YOUR_TELEGRAM / YOUR_DISCORD / YOUR_EMAIL with real values.
 */
export const CONTACTS = {
  github: 'https://github.com/JengasAdmin',
  telegram: 'YOUR_TELEGRAM', // example: https://t.me/your_nickname
  discord: 'YOUR_DISCORD', // example: your_nickname#0000
  email: 'YOUR_EMAIL', // example: you@example.com
  /** Placeholders are not turned into links automatically. */
  isPlaceholder: (value: string) => value.startsWith('YOUR_'),
} as const;

export interface Article {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  tags: string[];
  url?: string;
}

/**
 * Article storage. Intentionally empty — no articles are invented.
 * Add entries here later, e.g.:
 * { slug: 'my-note', title: '...', excerpt: '...', date: '2026-10-01', tags: ['React'] }
 */
export const ARTICLES: Article[] = [];
