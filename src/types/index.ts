/** Shared domain types. */

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
  /** Detected programming languages (bytes from GitHub /languages). */
  languages: Record<string, number>;
  /** Frameworks/libraries detected from package.json / manifest files. */
  libraries: string[];
  /** Manifest files found in the repository root. */
  manifests: string[];
  /** Verified tooling (e.g. GitHub Actions workflow directory). */
  tools: string[];
  /** Coarse category used by project filters. */
  category: RepoCategory;
}

export type RepoCategory =
  | 'frontend'
  | 'backend'
  | 'fullstack'
  | 'python'
  | 'other';

/** Repository enriched with everything the UI needs. */
export interface Project extends GithubRepo {
  tech: RepoTech;
  /** Absolute URL of the GitHub Pages demo when Pages is enabled. */
  demoUrl: string | null;
  /** GitHub-generated Open Graph image — used as safe visual preview. */
  previewUrl: string;
  /** Transparent featured score (NOT a quality rating — see docs/featured). */
  featuredScore: number;
  hasReadme: boolean;
}

export type SortKey = 'updated' | 'created' | 'stars' | 'name';
export type FilterKey = 'all' | string;

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

export interface Article {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  tags: string[];
  url?: string;
}
