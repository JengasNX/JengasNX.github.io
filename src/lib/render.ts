/**
 * Pure HTML templates for the live-GitHub sections.
 *
 * The exact same functions run:
 *  - at build time → static HTML (fast first paint, works without JS)
 *  - in the browser → re-render after filtering / sorting / "Refresh GitHub data"
 *
 * Everything dynamic is escaped: repository data comes from the network.
 */

import type { Dict, Locale } from '../i18n';
import { getSkills } from './github/service';
import type { GithubProfile, GithubStats, Project, SortKey } from './github/types';
import { escapeHtml, fill, formatMonthYear, formatNumber } from './format';

export interface RenderCtx {
  lang: Locale;
  t: Dict;
  username: string;
}

const esc = escapeHtml;

/** GitHub language colours (official fallback palette). */
const LANG_COLORS: Record<string, string> = {
  TypeScript: '#3178c6',
  JavaScript: '#f1e05a',
  HTML: '#e34c26',
  CSS: '#563d7c',
  SCSS: '#c6538c',
  Python: '#3572A5',
  Shell: '#89e051',
  Rust: '#dea584',
  Go: '#00ADD8',
  Vue: '#41b883',
  PHP: '#4F5D95',
  Java: '#b07219',
  'C++': '#f34b7d',
  C: '#555555',
  Ruby: '#701516',
  Swift: '#F05138',
  Kotlin: '#A97BFF',
  Dockerfile: '#384d54',
  JSON: '#292929',
  Markdown: '#083fa1',
};

export function langColor(name: string | null): string {
  if (!name) return 'var(--c-faint)';
  return LANG_COLORS[name] ?? '#8b949e';
}

export function langDot(name: string | null): string {
  return `<span class="inline-block h-2 w-2 rounded-full" style="background:${langColor(
    name,
  )}"></span>`;
}

/* ---------------------------------------------------------------- filters */

export interface ProjectFilter {
  query?: string;
  category?: string;
  sort?: SortKey;
}

export function filterSortProjects(projects: Project[], f: ProjectFilter = {}): Project[] {
  const q = (f.query ?? '').trim().toLowerCase();
  const category = f.category && f.category !== 'all' ? f.category : null;

  let list = projects.filter((p) => {
    if (category && p.tech.category !== category) return false;
    if (!q) return true;
    const haystack = [
      p.name,
      p.description ?? '',
      p.language ?? '',
      ...p.topics,
      ...p.tech.libraries,
      ...Object.keys(p.tech.languages),
    ]
      .join(' ')
      .toLowerCase();
    return haystack.includes(q);
  });

  const sort: SortKey = f.sort ?? 'updated';
  list = [...list].sort((a, b) => {
    switch (sort) {
      case 'stars':
        return b.stargazers_count - a.stargazers_count;
      case 'name':
        return a.name.localeCompare(b.name);
      case 'created':
        return +new Date(b.created_at) - +new Date(a.created_at);
      default:
        return +new Date(b.pushed_at) - +new Date(a.pushed_at);
    }
  });

  return list;
}

/* ------------------------------------------------------------------ badges */

function badges(p: Project, ctx: RenderCtx): string {
  const { t } = ctx;
  const out: string[] = [];
  if (p.archived) {
    out.push(
      `<span class="chip" style="border-color:var(--c-line)">${esc(t.projects.badgeArchived)}</span>`,
    );
  }
  if (p.demoUrl) {
    out.push(
      `<span class="chip" data-active="true">${esc(t.projects.badgePages)}</span>`,
    );
  }
  return out.join('');
}

/* ------------------------------------------------------------ project card */

function techChips(p: Project): string {
  const items = [...new Set([...p.tech.libraries, ...Object.keys(p.tech.languages)])]
    .filter((name) => (p.tech.languages[name] ?? 0) > 0 || p.tech.libraries.includes(name))
    .slice(0, 6);
  return items
    .map((name) => `<span class="chip">${esc(name)}</span>`)
    .join('');
}

function metaRow(p: Project, ctx: RenderCtx): string {
  const { t, lang } = ctx;
  const cell = (label: string, value: string) => `
    <div>
      <div class="label-dim">${esc(label)}</div>
      <div class="mt-1 mono text-[0.8rem] text-ink">${value}</div>
    </div>`;
  return `<div class="grid grid-cols-2 gap-4">
      ${cell(t.projects.category, esc(t.projects.categories[p.tech.category]))}
      ${cell(t.projects.created, esc(formatMonthYear(p.created_at, lang)))}
      ${cell(t.projects.lastPush, esc(formatMonthYear(p.pushed_at, lang)))}
      ${cell(
        t.projects.stack,
        esc([...new Set([...p.tech.libraries, ...Object.keys(p.tech.languages)])].slice(0, 4).join(' · ') || '—'),
      )}
    </div>`;
}

export function projectCard(p: Project, ctx: RenderCtx): string {
  const { t } = ctx;
  const repo = esc(p.name);
  const description = p.description
    ? `<p class="mt-2 text-sm leading-relaxed text-dim">${esc(p.description)}</p>`
    : '';

  const actions = `
    <div class="mt-4 flex flex-wrap items-center gap-2">
      <a class="btn btn-ghost btn-sm" href="${esc(p.html_url)}" target="_blank" rel="noopener noreferrer">
        ${esc(t.projects.github)} ↗
      </a>
      ${
        p.demoUrl
          ? `<a class="btn btn-primary btn-sm" href="${esc(p.demoUrl)}" target="_blank" rel="noopener noreferrer">${esc(
              t.projects.demo,
            )} ↗</a>`
          : ''
      }
      <button type="button" class="btn btn-ghost btn-sm" data-toggle="${repo}" aria-expanded="false">
        ${esc(t.projects.details)} +
      </button>
    </div>`;

  return `
  <article class="glass glass-hover flex h-full flex-col p-5" data-project="${repo}">
    <div class="flex items-start justify-between gap-3">
      <h3 class="mono text-[0.95rem] font-medium text-ink">
        <span class="text-accent">▸</span> ${repo}
      </h3>
      <div class="flex shrink-0 flex-wrap gap-1.5">${badges(p, ctx)}</div>
    </div>
    ${description}
    <div class="mt-3 flex flex-wrap gap-1.5">${techChips(p)}</div>

    <div class="mt-auto flex items-center justify-between pt-4 mono text-[0.72rem] text-faint">
      <span class="flex items-center gap-3">
        <span title="${esc(t.projects.stars)}">★ ${formatNumber(p.stargazers_count, ctx.lang)}</span>
        <span title="${esc(t.projects.forks)}">⑂ ${formatNumber(p.forks_count, ctx.lang)}</span>
      </span>
      <span class="flex items-center gap-1.5">${langDot(p.language)}${esc(p.language ?? '—')}</span>
    </div>

    ${actions}

    <div class="project-details" data-open="false">
      <div>
        <div class="mt-4 border-t border-line pt-4">
          ${metaRow(p, ctx)}
          ${
            p.topics.length
              ? `<div class="mt-4"><div class="label-dim">${esc(t.projects.topics)}</div>
                 <div class="mt-2 flex flex-wrap gap-1.5">${p.topics
                   .map((x) => `<span class="chip">#${esc(x)}</span>`)
                   .join('')}</div></div>`
              : ''
          }
          <div class="mt-4" data-readme="${repo}">
            ${
              p.hasReadme
                ? `<div class="label-dim">${esc(t.projects.readmeLoading)}</div>`
                : `<div class="label-dim">${esc(t.projects.readmeMissing)}</div>`
            }
          </div>
        </div>
      </div>
    </div>
  </article>`;
}

/** Grid (or empty state) for the currently filtered list. */
export function renderProjectsGrid(projects: Project[], ctx: RenderCtx): string {
  if (!projects.length) {
    return `<div class="glass col-span-full p-10 text-center">
      <p class="mono text-sm text-dim">${esc(ctx.t.projects.empty)}</p>
    </div>`;
  }
  return projects.map((p) => projectCard(p, ctx)).join('');
}

/** Top-3 featured strip. */
export function renderFeatured(projects: Project[], ctx: RenderCtx): string {
  return projects.map((p) => projectCard(p, ctx)).join('');
}

/* ------------------------------------------------------------------ skills */

function skillGroup(title: string, items: { name: string; count: number }[], ctx: RenderCtx): string {
  const chips = items.length
    ? items
        .map(
          (item) => `<span class="chip" title="${esc(
            item.count === 1
              ? ctx.t.skills.detectedInOne
              : fill(ctx.t.skills.detectedIn, { n: item.count }),
          )}">${esc(item.name)}<span class="chip-count">×${item.count}</span></span>`,
        )
        .join('')
    : `<span class="mono text-xs text-faint">${esc(ctx.t.skills.empty)}</span>`;

  return `<div class="glass p-6">
    <div class="label">${esc(title)}</div>
    <div class="mt-4 flex flex-wrap gap-2">${chips}</div>
  </div>`;
}

export function renderSkills(projects: Project[], ctx: RenderCtx): string {
  const skills = getSkills(projects);
  return `<div class="grid gap-4 md:grid-cols-3">
    ${skillGroup(ctx.t.skills.languages, skills.languages, ctx)}
    ${skillGroup(ctx.t.skills.frameworks, skills.frameworks, ctx)}
    ${skillGroup(ctx.t.skills.tools, skills.tools, ctx)}
  </div>`;
}

/* ------------------------------------------------------------------ stats */

function statTile(label: string, value: string): string {
  return `<div class="glass p-5">
    <div class="mono text-2xl font-medium text-ink">${value}</div>
    <div class="label-dim mt-2">${esc(label)}</div>
  </div>`;
}

/** Top languages as a proportional share bar + legend. */
function languageBar(languages: Record<string, number>, ctx: RenderCtx): string {
  const entries = Object.entries(languages)
    .filter(([, bytes]) => bytes > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);
  const total = entries.reduce((sum, [, bytes]) => sum + bytes, 0);
  if (!total) return '';

  const bar = entries
    .map(
      ([name, bytes]) =>
        `<span style="width:${((bytes / total) * 100).toFixed(1)}%;background:${langColor(name)}" title="${esc(name)}"></span>`,
    )
    .join('');

  const legend = entries
    .map(
      ([name, bytes]) =>
        `<span class="flex items-center gap-2 mono text-[0.72rem] text-dim">
           ${langDot(name)}${esc(name)}
           <span class="text-faint">${Math.round((bytes / total) * 100)}%</span>
         </span>`,
    )
    .join('');

  return `<div class="glass p-6">
    <div class="label">${esc(ctx.t.githubSection.languages)}</div>
    <div class="lang-bar mt-4">${bar}</div>
    <div class="mt-4 flex flex-wrap gap-x-5 gap-y-2">${legend}</div>
  </div>`;
}

function recentList(stats: GithubStats, ctx: RenderCtx): string {
  const { t, lang } = ctx;
  const rows = stats.recent
    .map(
      (p) => `<li>
        <a class="group flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-glass" href="${esc(
          p.html_url,
        )}" target="_blank" rel="noopener noreferrer">
          <span class="flex min-w-0 items-center gap-2">
            ${langDot(p.language)}
            <span class="mono truncate text-[0.82rem] text-ink group-hover:text-accent">${esc(p.name)}</span>
          </span>
          <span class="mono shrink-0 text-[0.72rem] text-faint">${esc(
            formatMonthYear(p.pushed_at, lang),
          )}</span>
        </a>
      </li>`,
    )
    .join('');

  return `<div class="glass p-6">
    <div class="label">${esc(t.githubSection.recent)}</div>
    <ul class="mt-3 flex flex-col gap-0.5">${rows}</ul>
  </div>`;
}

export function renderStats(
  profile: GithubProfile | null,
  stats: GithubStats | null,
  ctx: RenderCtx,
): string {
  const { t, lang } = ctx;
  if (!stats || !profile) {
    return `<div class="glass p-8 text-center">
      <p class="mono text-sm text-dim">${esc(t.githubSection.unavailable)}</p>
    </div>`;
  }

  return `
    <div class="grid grid-cols-2 gap-4 md:grid-cols-5">
      ${statTile(t.githubSection.repos, formatNumber(stats.publicRepos, lang))}
      ${statTile(t.githubSection.followers, formatNumber(stats.followers, lang))}
      ${statTile(t.githubSection.following, formatNumber(stats.following, lang))}
      ${statTile(t.githubSection.stars, formatNumber(stats.totalStars, lang))}
      ${statTile(t.githubSection.forks, formatNumber(stats.totalForks, lang))}
    </div>
    <div class="mt-4 grid gap-4 lg:grid-cols-2">
      ${languageBar(stats.languages, ctx)}
      ${recentList(stats, ctx)}
    </div>`;
}
