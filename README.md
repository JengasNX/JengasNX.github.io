# JengasAdmin Portfolio

Personal portfolio site of **Вячеслав (JengasAdmin)** — Full Stack Developer.

> One developer → real projects → GitHub → skills → services → writing → contact.

Built with **Astro + Tailwind CSS 4**: static HTML first, JavaScript only where
the page is genuinely interactive (project filters, live refresh, theme).

🔗 **Live:** <https://jengasadmin.github.io/>

---

## Highlights

- **Static-first** — the whole page is rendered at build time; it works without
  JavaScript and paints instantly.
- **Real GitHub data** — profile, repositories, languages, stack and statistics
  come from the GitHub REST API. No hand-written project list.
- **Automatic tech detection** — languages from `/languages`, frameworks from
  `package.json`, tooling from observable files (`.github/workflows` → Actions).
- **Transparent "Featured" selection** — rule-based scoring (description, README,
  demo, stars, activity). Explicitly *not* a quality rating.
- **Inline project details** — search, category filters, sorting, stack, topics,
  stats and a lazily loaded README right on the page (no separate detail routes).
- **Live refresh** — the *Refresh GitHub data* button refetches and repaints
  projects, skills and statistics in the browser.
- **Blog on Markdown** — posts live in `src/content/blog/{en,ru}` and generate
  `/blog/…` and `/ru/blog/…`.
- **RU / EN** — English is the default locale at the root, Russian under `/ru/`,
  with `hreflang` alternates, canonical URLs and localized dates/numbers.
- **Dark / light theme** — dark-first, persisted, no flash on load.
- **Caching & rate limits** — build-time disk cache + browser `localStorage`
  cache with stale fallback, so the site never renders empty when the GitHub API
  is limited.
- **SEO & a11y** — Open Graph, Twitter card, sitemap, `robots.txt`, JSON-LD
  `Person`, semantic markup, skip link, focus states, reduced-motion support.

---

## Tech stack

| Layer     | Technology                                   |
|-----------|----------------------------------------------|
| Framework | Astro 7 (static output)                      |
| Styling   | Tailwind CSS 4 (CSS-first config)            |
| Fonts     | Inter Variable + JetBrains Mono (self-hosted)|
| Content   | Astro content collections (Markdown)         |
| Data      | GitHub REST API (`api.github.com`)           |
| Quality   | `astro check` (TypeScript strict)            |
| Deploy    | GitHub Actions → GitHub Pages                |

---

## Project structure

```
JengasAdmin.github.io/
├── .github/workflows/deploy.yml   # check + build + deploy to GitHub Pages
├── public/                        # favicon, robots.txt
├── src/
│   ├── components/                # Nav, Footer, Hero, About, section blocks
│   │   └── pages/                 # HomePage, BlogIndexPage, BlogPostPage
│   ├── content/blog/              # Markdown posts: en/*.md, ru/*.md
│   ├── content.config.ts          # blog collection schema
│   ├── data/site.ts               # SITE + CONTACTS (edit here)
│   ├── i18n/                      # en.ts, ru.ts dictionaries (typed)
│   ├── layouts/BaseLayout.astro   # head, SEO, theme, nav, footer
│   ├── lib/
│   │   ├── github/                # API transport, cache, analysis, build loader
│   │   ├── blog.ts                # post queries, URLs, reading time
│   │   ├── render.ts              # shared HTML templates (build + browser)
│   │   ├── markdown.ts            # safe README renderer
│   │   └── format.ts              # dates, numbers, helpers
│   ├── pages/                     # /, /ru/, /blog/…, 404
│   └── styles/global.css          # design tokens + components
├── astro.config.mjs
└── tsconfig.json
```

### How the GitHub integration works

```
src/lib/github/
├── api.ts       transport: caching, rate-limit handling, stale fallback,
│                optional build-time GITHUB_TOKEN
├── service.ts   domain: profile, repositories, analysis, skills, stats
├── tech.ts      detection: categories, libraries, featured score
├── cache.ts     localStorage in the browser, memory during the build
└── data.ts      BUILD-ONLY loader with a disk cache (.cache/github.json)
```

The same analysis runs at build time (static HTML) and in the browser
(*Refresh* button). Requests per build: roughly `3 × repositories` — the disk
cache keeps them at zero for 10 minutes and the optional `GITHUB_TOKEN` raises
the hourly limit from 60 to 1000+.

Data GitHub does **not** expose without authentication (pinned repositories,
contribution calendar) is intentionally not shown — see the comment in
`src/lib/github/service.ts`.

---

## Local development

```bash
npm install
npm run dev       # http://localhost:4321
```

| Script            | Purpose                                  |
|-------------------|------------------------------------------|
| `npm run dev`     | dev server with HMR                      |
| `npm run build`   | production build → `dist/`               |
| `npm run preview` | preview the production build             |
| `npm run check`   | TypeScript + Astro diagnostics           |

---

## Environment variables

Copy `.env.example` → `.env`:

| Variable | Where | Default | Purpose |
|---|---|---|---|
| `GITHUB_USERNAME` | build | `JengasAdmin` | whose repositories are shown |
| `GITHUB_TOKEN` | build | *(empty)* | optional, raises build-time API limit |
| `PUBLIC_CONTACT_ENDPOINT` | build → client | *(empty)* | contact form backend endpoint |

> Never put a token in a `PUBLIC_`/client variable — everything exposed to the
> browser is embedded into the public bundle. `GITHUB_TOKEN` is read only while
> Astro renders on the server.

Without `PUBLIC_CONTACT_ENDPOINT` the contact form **explicitly tells the
visitor** that sending is not connected — it never pretends to succeed.

---

## Writing a blog post

1. Create `src/content/blog/en/my-post.md` (and optionally `src/content/blog/ru/my-post.md`
   with the same file name to get a language switch on the post page):

   ```md
   ---
   title: "Post title"
   description: "One-line summary used in listings and meta description."
   pubDate: 2026-10-12
   tags: ["Astro", "TypeScript"]
   draft: false
   ---
   ```

2. Write Markdown below the frontmatter.
3. `npm run dev` → `/blog/my-post`.

The homepage shows the three newest posts; `/blog/` lists everything.

---

## Editing content

| What | Where |
|---|---|
| Name, role, site URL | `src/data/site.ts` → `SITE` |
| Contacts (Telegram, Discord, Email) | `src/data/site.ts` → `CONTACTS` |
| All UI texts (EN) | `src/i18n/en.ts` |
| All UI texts (RU) | `src/i18n/ru.ts` |
| Services / journey / hero copy | `src/i18n/{en,ru}.ts` |
| Blog posts | `src/content/blog/**` |

---

## Deployment — GitHub Pages

1. Push to `main`.
2. `.github/workflows/deploy.yml` runs `npm run check` → `npm run build` and
   publishes `dist/` with `actions/deploy-pages`.
3. **Settings → Pages → Source: GitHub Actions**.
4. The site is live at <https://jengasadmin.github.io/>.

The workflow caches `.cache/github.json` between runs so builds stay within the
GitHub API limits.

---

## Design notes

Dark editorial theme with glass surfaces and terminal accents:

- tokens live in `src/styles/global.css` (`:root` dark, `[data-theme='light']`
  override) and are exposed to Tailwind through `@theme inline`;
- glass = `backdrop-blur` + 1 px border + inner highlight;
- section labels use JetBrains Mono (`01 —`, `label`);
- motion: IntersectionObserver reveals + a typewriter terminal in the hero, both
  disabled under `prefers-reduced-motion`.

---

## License

MIT — do not reuse the personal content (name, bio, contacts) of the author.
