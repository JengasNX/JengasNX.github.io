import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

/**
 * Blog posts live as Markdown files:
 *   src/content/blog/en/*.md  → https://jengasadmin.github.io/blog/<slug>/
 *   src/content/blog/ru/*.md  → https://jengasadmin.github.io/ru/blog/<slug>/
 * The folder name becomes the locale prefix of the entry id.
 */
const blog = defineCollection({
  loader: glob({ pattern: ['en/*.md', 'ru/*.md'], base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog };
