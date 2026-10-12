/** Shared domain types (GitHub + derived project model). */

/** Subset of the GitHub user object we actually use. */
export interface GithubProfile {
  login: string;
  avatar_url: string;
  html_url: string;
  name: string | null;
  bio: string | null;
  blog: string | null;
  public_repos: number;
  followers: number;
  following: number;
  created_at: string;
  updated_at: string;
}

/** Subset of the GitHub repository object we actually use. */
export interface GithubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  language: string | null;
  topics: string[];
  stargazers_count: number;
  forks_count: number;
  size: number;
  has_pages: boolean;
  archived: boolean;
  fork: boolean;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  default_branch: string;
  license: { spdx_id: string | null } | null;
}

/** Aggregated technology analysis derived from real repository data. */
export interface RepoTech {
  languages: Record<string, number>;
  libraries: string[];
  manifests: string[];
  tools: string[];
  category: RepoCategory;
}

export type RepoCategory = 'frontend' | 'backend' | 'fullstack' | 'python' | 'other';

/** Repository enriched with everything the UI needs. */
export interface Project extends GithubRepo {
  tech: RepoTech;
  demoUrl: string | null;
  previewUrl: string;
  featuredScore: number;
  hasReadme: boolean;
}

export type SortKey = 'updated' | 'created' | 'stars' | 'name';

export interface GithubStats {
  publicRepos: number;
  followers: number;
  following: number;
  totalStars: number;
  totalForks: number;
  /** Language name → total bytes across all repositories. */
  languages: Record<string, number>;
  /** Repos sorted by last push (real activity from GitHub). */
  recent: Project[];
}

/** Everything the home page needs, frozen at build time. */
export interface GithubSnapshot {
  fetchedAt: number;
  profile: GithubProfile | null;
  projects: Project[];
  stats: GithubStats | null;
  /** True when neither the network nor the cache could provide data. */
  unavailable: boolean;
}
