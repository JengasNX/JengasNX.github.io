---
title: "Rewriting my portfolio: from React to Astro"
description: "Why I rebuilt this site on Astro instead of keeping a React SPA — and what stayed the same."
pubDate: 2026-10-10
tags: ["Astro", "React", "architecture"]
---

The first version of this portfolio was a React 18 + Vite single-page application.
It worked, but every visit downloaded a router, an animation library and a full
client runtime before a single line of text appeared. For a site whose main job
is to *show* content, that was the wrong trade.

## Why Astro

Astro inverts the default: **HTML ships first, JavaScript is opt-in**. The
navigation, typography, article pages and most sections are now rendered at build
time and cost zero kilobytes of JavaScript.

- **Static-first** — the whole page is pre-rendered during `astro build`, so the
  first paint does not wait for an API call.
- **Islands where it matters** — only the interactive parts (project search,
  filters, the "Refresh GitHub data" button) ship as a small script.
- **Content collections** — blog posts are plain Markdown files with typed
  frontmatter instead of a hand-maintained array in a TypeScript file.
- **Tailwind CSS 4** — a CSS-first config with design tokens, so the light theme
  is an override of the same variables instead of a second set of classes.

## What stayed the same

The GitHub integration was not rewritten from scratch — the service layer
(`profile → repositories → languages + manifests → analysis`) is the same code,
it just runs at build time now instead of on every visit.

Rate limiting, caching and stale fallbacks still exist, they simply moved from
`localStorage` to a small disk cache used during the build.

## Honest trade-offs

New repositories appear when the site is rebuilt, not the second I push a
repository. The **Refresh** button in the Projects section still fetches live
data for visitors, so the site stays current between deployments.
