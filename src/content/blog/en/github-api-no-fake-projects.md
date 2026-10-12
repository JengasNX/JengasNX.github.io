---
title: "No fake projects: how the GitHub integration works"
description: "Every project on this site comes from the GitHub REST API — here is exactly how it is analysed and displayed."
pubDate: 2026-10-11
tags: ["GitHub API", "TypeScript", "open source"]
---

Portfolios are full of invented case studies. This one is not: the list of
projects, the stack chips, the language statistics and the "featured" row are all
derived from public GitHub data.

## The pipeline

```
/users/JengasAdmin            → profile (avatar, counters)
/users/JengasAdmin/repos      → repositories (forks are dropped)
/repos/…/languages            → byte counts per language
/repos/…/contents/            → root files: manifests, .github/, README
/repos/…/contents/package.json→ dependencies → frameworks & libraries
```

From those five calls the site derives, for every repository:

1. **Category** — `frontend`, `backend`, `fullstack`, `python` or `other`,
   detected from dependencies and languages.
2. **Stack chips** — only libraries that actually appear in `package.json`.
3. **Tools** — only what is observable, e.g. a `.github/workflows` directory
   means GitHub Actions. Nothing is guessed.
4. **Featured score** — a transparent formula: description, README, topics, demo
   link, stars, forks, size, recency. It measures *how much information GitHub
   shows*, not how good the code is.

## Caching and rate limits

Unauthenticated GitHub API requests are limited to 60 per hour per IP. The site
handles this in three layers:

- at **build time** a disk cache (`.cache/github.json`) keeps the snapshot fresh
  for 10 minutes and usable for up to a week;
- in the **browser** responses are cached in `localStorage` with per-type TTLs;
- on a **rate-limit error** the stale cache is served instead of an empty page,
  and the UI says so explicitly.

## What is intentionally missing

Pinned repositories and the contribution calendar need GitHub's GraphQL API,
which requires authentication. Rather than fake them, the site shows real
numbers: stars, forks, followers and the last push date of each repository.
