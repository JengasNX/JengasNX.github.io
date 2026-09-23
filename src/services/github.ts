/**
 * GitHub domain service — the single source of project data for the site.
 *
 * UI components NEVER call the API directly; they consume these functions
 * (usually through hooks/useGithub). New public repositories appear in the
 * portfolio automatically after the cache expires or "Refresh GitHub Data"
 * is pressed.
 */

import type {
  GithubProfile,
  GithubRepo,
  GithubStats,
  Project,
  RepoTech,
} from '../types';
import { getJson, getRaw, GithubError, TTL } from './githubApi';
import {
  MANIFESTS,
  detectCategory,
  detectLibraries,
  detectTools,
  featuredScore,
  type ManifestInfo,
} from './tech';

/** Username is taken from env with a safe default (see .env.example). */
export const USERNAME = import.meta.env.VITE_GITHUB_USERNAME ?? 'JengasAdmin';

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
  return getJson<GithubRepo[]>(
    `/users/${USERNAME}/repos?per_page=100&type=owner&sort=updated`,
    { ttl: TTL.repos },
  );
}

/** Languages with byte counts for one repository. */
export function getLanguages(repo: string): Promise<Record<string, number>> {
  return getJson<Record<string, number>>(`/repos/${USERNAME}/${repo}/languages`, {
    ttl: TTL.tech,
  });
}

/** README markdown (raw) for the project detail page. */
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

/** Build the full analysis for one repository (parallel API calls). */
export async function analyzeRepo(repo: GithubRepo): Promise<Project> {
  const [languages, info] = await Promise.all([
    getLanguages(repo.name).catch(() => ({}) as Record<string, number>),
    getManifestInfo(repo.name).catch(() => ({ files: [], pkg: null }) as ManifestInfo),
  ]);

  const tech: RepoTech = {
    languages,
    libraries: detectLibraries(info),
    manifests: info.files.filter((f) =>
      (MANIFESTS as readonly string[]).includes(f),
    ),
    tools: detectTools(info.files),
    category: detectCategory(languages, info),
  };

  const hasReadme = info.files.some((f) => /^readme\.md$/i.test(f));

  return {
    ...repo,
    tech,
    hasReadme,
    demoUrl: resolveDemoUrl(repo),
    previewUrl: OG_IMAGE(repo.name),
    featuredScore: featuredScore({ ...repo, hasReadme }),
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
    .sort((a, b) => b.featuredScore - a.featuredScore || b.stargazers_count - a.stargazers_count)
    .slice(0, limit);
}

/** Aggregate profile statistics from real data. */
export async function getStats(): Promise<GithubStats> {
  const [profile, projects] = await Promise.all([getProfile(), getProjects()]);

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

/** Find one project by repository name. */
export async function getProject(name: string): Promise<Project | null> {
  const projects = await getProjects();
  return projects.find((p) => p.name === name) ?? null;
}

/**
 * NOTE on data that GitHub's public REST API does NOT provide without
 * authentication, so it is intentionally NOT shown on the site:
 *  - pinned/featured profile repositories (GraphQL only)
 *  - contribution calendar (GraphQL only)
 *  - exact commit counts (requires additional per-repo requests)
 * Instead we show real "recent activity" derived from pushed_at dates.
 */
export const UNAVAILABLE_WITHOUT_TOKEN =
  ['pinnedRepositories', 'contributionCalendar'] as const;
