import { getCollection, type CollectionEntry } from 'astro:content';
import type { Locale } from '../i18n';
import { readingTime } from './format';

export type BlogEntry = CollectionEntry<'blog'>;

/** Locale prefix used by the folder the post lives in (`en/…`, `ru/…`). */
function prefix(lang: Locale): string {
  return `${lang}/`;
}

/** All published posts for one language, newest first. */
export async function getPosts(lang: Locale): Promise<BlogEntry[]> {
  const posts = await getCollection(
    'blog',
    (entry) => entry.id.startsWith(prefix(lang)) && !entry.data.draft,
  );
  return posts.sort((a, b) => +b.data.pubDate - +a.data.pubDate);
}

/** `en/astro-notes` → `astro-notes`. */
export function postSlug(entry: BlogEntry): string {
  return entry.id.slice(entry.id.indexOf('/') + 1);
}

/** `/blog/<slug>` (en) or `/ru/blog/<slug>` (ru) — no trailing slash. */
export function postUrl(lang: Locale, slug: string): string {
  return lang === 'ru' ? `/ru/blog/${slug}` : `/blog/${slug}`;
}

/** Locale the post belongs to (derived from its folder). */
export function postLang(entry: BlogEntry): Locale {
  return entry.id.startsWith('ru/') ? 'ru' : 'en';
}

export interface PostMeta {
  entry: BlogEntry;
  slug: string;
  url: string;
  lang: Locale;
  minutes: number;
}

export async function getPostMeta(lang: Locale): Promise<PostMeta[]> {
  const posts = await getPosts(lang);
  return posts.map((entry) => {
    const slug = postSlug(entry);
    return {
      entry,
      slug,
      url: postUrl(lang, slug),
      lang,
      minutes: readingTime(entry.body ?? ''),
    };
  });
}

/** Does a post with the same slug exist in the other locale? */
export async function hasTranslation(slug: string, lang: Locale): Promise<boolean> {
  const other: Locale = lang === 'en' ? 'ru' : 'en';
  const posts = await getCollection('blog', (entry) =>
    entry.id.startsWith(prefix(other)) && postSlug(entry) === slug,
  );
  return posts.length > 0;
}
