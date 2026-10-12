/**
 * GitHub domain service — the single source of project data for the site.
 *
 * Nothing in the UI calls the API directly; everything goes through these
 * functions. The code is isomorphic: the same module runs at build time
 * (static HTML) and in the browser ("Refresh GitHub data").
 */

import type {
  GithubProfile,
  GithubRepo,
  GithubStats,
  Project,
  RepoTech,
} from './types';
import { getJson, getRaw, GithubError, TTL } from './api';
import {
  MANIFESTS,
  detectCategory,
  detectLibraries,
  detectTools,
  featuredScore,
  type ManifestInfo,
} from './tech';

/** Username: build-time env first, safe default second. */
export const USERNAME: string =
  (typeof process !== 'undefined' && process.env?.GITHUB_USERNAME) || 'JengasAdmin';

/** GitHub Pages base for demos. */
const PAGES_BASE = `https://${USERNAME.toLowerCase()}.github.io`;

/** Official GitHub Open Graph image — safe, public visual preview per repo. */
const OG_IMAGE = (repo: string) =>
  `https://opengraph.githubassets.com/1/${USERNAME}/${repo}`;

export { GithubError };

/** Public profile (avatar, bio, counters). */
export function getProfile(): Promise<GithubProfile> {
  return getJson<GithubProfile>(`/users/${USERNAME}`, { ttl: TTL.profile });
}

/** All public repositories owned by the user. */
export function getRepositories(): Promise<GithubRepo[]> {
  return getJson<GithubRepo[]>(`/users/${USERNAME}/repos?per_page=100&type=owner&sort=updated`, {
    ttl: TTL.repos,
  });
}

/** Languages with byte counts for one repository. */
export function getLanguages(repo: string): Promise<Record<string, number>> {
  return getJson<Record<string, number>>(`/repos/${USERNAME}/${repo}/languages`, {
    ttl: TTL.tech,
  });
}

/** README markdown (raw) — rendered lazily inside the project details. */
export function getReadme(repo: string): Promise<string> {
  return getRaw(`/repos/${USERNAME}/${repo}/readme`, { ttl: TTL.readme });
}

/** Root file listing + package.json → basis for stack detection. */
async function getManifestInfo(repo: string): Promise<ManifestInfo> {
  const root = await getJson<Array<{ name: string; type: string }>>(
    `/repos/${USERNAME}/${repo}/contents/`,
    { ttl: TTL.tech },
  );
  const files = root.map((f) => f.name);
  let pkg: ManifestInfo['pkg'] = null;

  if (files.includes('package.json')) {
    try {
      pkg = await getJson<NonNullable<ManifestInfo['pkg']>>(
        `/repos/${USERNAME}/${repo}/contents/package.json`,
        { ttl: TTL.tech, accept: 'application/vnd.github.raw+json' },
      );
    } catch {
      // Malformed / unreadable package.json — analysis continues without it.
    }
  }

  return { files, pkg };
}

/** Fields of a GitHub repository object the site actually uses. */
export function pickRepo(repo: GithubRepo): GithubRepo {
  return {
    id: repo.id,
    name: repo.name,
    full_name: repo.full_name,
    description: repo.description,
    html_url: repo.html_url,
    homepage: repo.homepage,
    language: repo.language,
    topics: repo.topics ?? [],
    stargazers_count: repo.stargazers_count,
    forks_count: repo.forks_count,
    size: repo.size,
    has_pages: repo.has_pages,
    archived: repo.archived,
    fork: repo.fork,
    created_at: repo.created_at,
    updated_at: repo.updated_at,
    pushed_at: repo.pushed_at,
    default_branch: repo.default_branch,
    license: repo.license,
  };
}

/** Same trimming for an already analysed project (used for cached snapshots). */
export function slimProject(project: Project): Project {
  return {
    ...pickRepo(project),
    tech: project.tech,
    demoUrl: project.demoUrl,
    previewUrl: project.previewUrl,
    featuredScore: project.featuredScore,
    hasReadme: project.hasReadme,
  };
}

/** Build the full analysis for one repository (parallel API calls). */
export async function analyzeRepo(repo: GithubRepo): Promise<Project> {
  const [languages, info] = await Promise.all([
    getLanguages(repo.name).catch(() => ({}) as Record<string, number>),
    getManifestInfo(repo.name).catch(() => ({ files: [], pkg: null }) as ManifestInfo),
  ]);

  const tech: RepoTech = {
    languages,
    libraries: detectLibraries(info),
    manifests: info.files.filter((f) => (MANIFESTS as readonly string[]).includes(f)),
    tools: detectTools(info.files),
    category: detectCategory(languages, info),
  };

  const hasReadme = info.files.some((f) => /^readme\.md$/i.test(f));

  // Keep only the fields the UI needs — the full GitHub object is ~4× larger
  // and ends up inlined into the page as JSON.
  const base: GithubRepo = pickRepo(repo);

  return {
    ...base,
    tech,
    hasReadme,
    demoUrl: resolveDemoUrl(base),
    previewUrl: OG_IMAGE(base.name),
    featuredScore: featuredScore({ ...base, hasReadme }),
  };
}

/** Live demo URL: homepage wins, otherwise GitHub Pages (if enabled). */
function resolveDemoUrl(repo: GithubRepo): string | null {
  if (repo.homepage && /^https?:\/\//.test(repo.homepage)) return repo.homepage;
  if (repo.has_pages) return `${PAGES_BASE}/${repo.name}`;
  return null;
}

/** Analyze every repository in parallel and return projects. */
export async function getProjects(): Promise<Project[]> {
  const repos = (await getRepositories()).filter((r) => !r.fork);
  return Promise.all(repos.map(analyzeRepo));
}

/**
 * Featured selection — top repositories by the transparent rules from
 * tech.ts (information richness + activity), never a quality judgement.
 */
export function getFeatured(projects: Project[], limit = 3): Project[] {
  return [...projects]
    .sort(
      (a, b) =>
        b.featuredScore - a.featuredScore || b.stargazers_count - a.stargazers_count,
    )
    .slice(0, limit);
}

/** Aggregate profile statistics from data we already have (no extra requests). */
export function buildStats(profile: GithubProfile, projects: Project[]): GithubStats {
  const languages: Record<string, number> = {};
  for (const p of projects) {
    for (const [lang, bytes] of Object.entries(p.tech.languages)) {
      languages[lang] = (languages[lang] ?? 0) + bytes;
    }
  }

  return {
    publicRepos: profile.public_repos,
    followers: profile.followers,
    following: profile.following,
    totalStars: projects.reduce((sum, p) => sum + p.stargazers_count, 0),
    totalForks: projects.reduce((sum, p) => sum + p.forks_count, 0),
    languages,
    recent: [...projects]
      .sort((a, b) => +new Date(b.pushed_at) - +new Date(a.pushed_at))
      .slice(0, 5),
  };
}

export interface SkillItem {
  name: string;
  /** Number of repositories this technology appears in. */
  count: number;
}

export interface Skills {
  languages: SkillItem[];
  frameworks: SkillItem[];
  tools: SkillItem[];
}

/** Skills derived exclusively from analysed repositories. */
export function getSkills(projects: Project[]): Skills {
  const languages = new Map<string, { count: number; bytes: number }>();
  const frameworks = new Map<string, number>();
  const tools = new Map<string, number>();

  for (const p of projects) {
    for (const [name, bytes] of Object.entries(p.tech.languages)) {
      if (bytes <= 0) continue;
      const prev = languages.get(name) ?? { count: 0, bytes: 0 };
      languages.set(name, { count: prev.count + 1, bytes: prev.bytes + bytes });
    }
    for (const lib of p.tech.libraries) frameworks.set(lib, (frameworks.get(lib) ?? 0) + 1);
    for (const tool of p.tech.tools) tools.set(tool, (tools.get(tool) ?? 0) + 1);
  }

  const byCountThenBytes = <T extends { count: number }>(a: T, b: T) => b.count - a.count;

  return {
    languages: [...languages.entries()]
      .map(([name, v]) => ({ name, count: v.count, bytes: v.bytes }))
      .sort((a, b) => b.bytes - a.bytes || b.count - a.count)
      .map(({ name, count }) => ({ name, count })),
    frameworks: [...frameworks.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort(byCountThenBytes),
    tools: [...tools.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort(byCountThenBytes),
  };
}

/**
 * NOTE on data that GitHub's public REST API does NOT provide without
 * authentication, so it is intentionally NOT shown on the site:
 *  - pinned/featured profile repositories (GraphQL only)
 *  - contribution calendar (GraphQL only)
 *  - exact commit counts (requires additional per-repo requests)
 * Instead we show real "recent activity" derived from pushed_at dates.
 */
export const UNAVAILABLE_WITHOUT_TOKEN = [
  'pinnedRepositories',
  'contributionCalendar',
] as const;
