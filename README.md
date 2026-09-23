# JengasAdmin Portfolio

Personal portfolio site of **Вячеслав (JengasAdmin)** — Full Stack Developer.

> Один разработчик → реальные проекты → GitHub → технологии → опыт → портфолио.

The site is a single-page portfolio (plus a GitHub Profile page and per-project
detail pages) that pulls **real, public data from the GitHub REST API** —
no fake projects, no invented experience, no hardcoded repository list.
New public repositories appear automatically after the cache expires or after
pressing **Refresh GitHub Data**.

🔗 **Live:** <https://jengasadmin.github.io/>

---

## Features

- **GitHub integration** — profile, repositories, languages, README, statistics
  fetched live from the GitHub REST API (no token required for public data)
- **Automatic project discovery** — every public repository is analysed
  (languages, `package.json`, manifests, `.github/workflows`)
- **Transparent "Featured" selection** — rule-based scoring
  (description, README, demo, stars, activity). Explicitly *not* a quality rating
- **Visual project previews** — official GitHub Open Graph images per repository,
  GitHub Pages demo links, optional iframe preview on project pages
- **Project detail pages** — README (rendered safely), stack, topics, languages,
  stats, creation/update dates, GitHub + Live Demo buttons
- **GitHub statistics** — repos, followers, following, stars, forks,
  language share bar, recently updated projects
- **GitHub Profile page** — avatar, stats, technologies, activity, big CTA
- **Automatic tech detection** — skills are derived from real repository data only
- **Search, filters, sorting** — filters are generated from the actual project data
- **RU / EN localization** — `src/locales/{ru,en}.ts`, instant switch, no reload
- **Dark / Light theme** — persisted, dark-first
- **Caching + rate-limit handling** — localStorage TTL cache, stale fallback,
  explicit rate-limit message, manual refresh button
- **Interactive UI** — scroll reveals, animated counters, cursor glow, hover
  effects; heavy effects auto-disable on mobile & `prefers-reduced-motion`
- **Responsive** — mobile, tablet, laptop, desktop, ultrawide
- **Accessibility** — semantic HTML, ARIA labels, keyboard navigation, focus
  states, reduced-motion support
- **SEO** — title/description, Open Graph, Twitter card, canonical,
  `robots.txt`, `sitemap.xml`, favicon
- **Honest contact form** — ready for a backend endpoint; it never fakes success

---

## Tech Stack

| Layer      | Technology                                  |
|------------|---------------------------------------------|
| UI         | React 18, TypeScript, Tailwind CSS          |
| Build      | Vite 5                                      |
| Motion     | Framer Motion (+ CSS transitions)           |
| Icons      | Lucide React                                |
| Routing    | React Router (HashRouter → GitHub Pages safe) |
| Data       | GitHub REST API (`api.github.com`)          |
| Quality    | ESLint (flat config), `tsc --noEmit`        |
| Deploy     | GitHub Actions → GitHub Pages               |

---

## GitHub Integration

All API access lives in one isolated layer — UI never calls `fetch` directly:

```
src/services/
├── githubApi.ts   # transport: caching, retries, rate-limit, stale fallback
├── github.ts      # domain: getProfile, getProjects, getStats, getReadme…
└── tech.ts        # analysis: languages, libraries, category, featured score
```

Key functions:

| Function | Purpose |
|---|---|
| `getProfile()` | avatar, bio, counters |
| `getRepositories()` | all public repositories |
| `getLanguages(repo)` | byte counts per language |
| `getReadme(repo)` | raw README markdown |
| `analyzeRepo(repo)` | full stack analysis of one repository |
| `getProjects()` | analysed list of all projects |
| `getFeatured(projects)` | transparent featured selection |
| `getStats()` | aggregated profile statistics |

**Data that is intentionally NOT shown** (GitHub requires authenticated GraphQL):
pinned repositories, contribution calendar, exact commit counts.
The reason is documented in `src/services/github.ts`.

### Caching

Responses are cached in `localStorage` (10–60 min TTL depending on the data
type). On rate limit or network errors the stale cache is served instead of
failing. **Refresh GitHub Data** clears the cache and refetches.

---

## Project Structure

```
JengasAdmin.github.io/
├── .github/workflows/deploy.yml   # build + deploy to GitHub Pages
├── public/
│   ├── favicon.svg
│   ├── robots.txt
│   └── sitemap.xml
└── src/
    ├── components/                # Navbar, Footer, ProjectCard, SkillCard…
    ├── sections/                  # Hero, About, Skills, Projects, GitHub…
    ├── pages/                     # HomePage, ProfilePage, ProjectPage
    ├── services/                  # GitHub API layer (github.ts …)
    ├── context/                   # LocaleContext, ThemeContext
    ├── hooks/                     # useGithub, useReveal, useMediaQuery
    ├── data/content.ts            # editable text, contacts, articles
    ├── locales/                   # ru.ts, en.ts
    ├── types/                     # shared TypeScript types
    ├── utils/                     # cache, format, language, markdown
    ├── App.tsx
    ├── main.tsx
    └── index.css
```

---

## Local Development

```bash
npm install
npm run dev       # http://localhost:5173
```

### Scripts

| Script | Purpose |
|---|---|
| `npm run dev` | dev server with HMR |
| `npm run build` | TypeScript check + production build |
| `npm run preview` | preview the production build |
| `npm run lint` | ESLint (zero warnings allowed) |

---

## Environment Variables

Copy `.env.example` → `.env` and adjust:

| Variable | Default | Purpose |
|---|---|---|
| `VITE_GITHUB_USERNAME` | `JengasAdmin` | whose repositories are shown |
| `VITE_BASE_PATH` | `/` | build base path (sub-path repos) |
| `VITE_CONTACT_ENDPOINT` | *(empty)* | backend endpoint for the contact form |

### Security

**Never put a GitHub PAT, API keys or passwords in frontend env vars** —
everything prefixed with `VITE_` is embedded into the public bundle.
Public GitHub data works without authorization (60 requests/h per IP).
If you need more, add a serverless proxy that holds `GITHUB_TOKEN`
server-side (e.g. `/api/github-proxy` on Vercel/Cloudflare Workers) and point
the service layer at it.

### Contact form

Without `VITE_CONTACT_ENDPOINT` the form **explicitly tells the user** that
sending is not connected yet — it never pretends to succeed. Once the endpoint
is set, the form POSTs JSON `{ name, email, message, locale, page }`.

---

## Build

```bash
npm run build     # tsc --noEmit + vite build → dist/
npm run preview
```

---

## Deployment — GitHub Pages

1. Push to `main` of the `JengasAdmin.github.io` repository.
2. `.github/workflows/deploy.yml` runs `npm ci` → `npm run build` →
   deploys `dist/` with `actions/deploy-pages`.
3. In **Settings → Pages** set *Source: GitHub Actions*.
4. The site is published at <https://jengasadmin.github.io/>.

If you deploy into a *project* repository instead, rebuild with:

```bash
VITE_BASE_PATH=/<repo-name>/ npm run build
```

---

## Editing Content

| What | Where |
|---|---|
| Hero/About/Journey/Services texts | `src/locales/ru.ts`, `src/locales/en.ts` |
| Contacts (Telegram, Discord, Email) | `src/data/content.ts` → `CONTACTS` |
| Articles | `src/data/content.ts` → `ARTICLES` |
| Status badge text | `src/locales/*` → `hero.status` |

---

## License

MIT — do not reuse the personal content (name, bio, contacts) of the author.
