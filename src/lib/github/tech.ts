/**
 * Technology analysis.
 *
 * Every technology shown on the site must be backed by real repository data:
 *   - programming languages  → GitHub /languages endpoint (byte counts)
 *   - frameworks/libraries   → package.json (or other manifest) contents
 *   - category for filters   → derived from the detected stack
 * Nothing here is hand-written per project.
 */

import type { RepoCategory } from './types';

/** Manifests we recognise in a repository root. */
export const MANIFESTS = [
  'package.json',
  'requirements.txt',
  'pyproject.toml',
  'Pipfile',
  'composer.json',
  'go.mod',
  'Cargo.toml',
] as const;

/** Human-readable names for dependency keys we care about. */
const LIBRARY_NAMES: Record<string, string> = {
  react: 'React',
  'react-dom': 'React DOM',
  'react-router-dom': 'React Router',
  next: 'Next.js',
  astro: 'Astro',
  vite: 'Vite',
  tailwindcss: 'Tailwind CSS',
  'lucide-react': 'Lucide',
  leaflet: 'Leaflet',
  express: 'Express',
  vue: 'Vue',
  '@angular/core': 'Angular',
  'framer-motion': 'Framer Motion',
  typescript: 'TypeScript',
  prisma: 'Prisma',
  '@prisma/client': 'Prisma',
  'class-variance-authority': 'CVA',
  clsx: 'clsx',
  'tailwind-merge': 'Tailwind Merge',
};

/** Dependencies we deliberately do NOT list as "skills" (build plumbing). */
const IGNORED_DEPS = new Set([
  '@types/react',
  '@types/react-dom',
  '@types/node',
  '@types/leaflet',
  '@vitejs/plugin-react',
  'react-refresh',
  'typescript',
  'eslint',
  'eslint-config-next',
  'postcss',
  'autoprefixer',
  'tailwindcss',
  'vite',
  'scheduler',
  'source-map-js',
  'nanoid',
  'picocolors',
]);

export interface ManifestInfo {
  /** File names found in the repository root. */
  files: string[];
  /** package.json parsed (when present). */
  pkg: PackageJson | null;
}

export interface PackageJson {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  scripts?: Record<string, string>;
}

/** Detect the category used by project filters. */
export function detectCategory(languages: Record<string, number>, info: ManifestInfo): RepoCategory {
  const deps = { ...(info.pkg?.dependencies ?? {}), ...(info.pkg?.devDependencies ?? {}) };
  const files = info.files;
  const hasPython =
    files.some((f) => f === 'requirements.txt' || f === 'pyproject.toml' || f === 'Pipfile') ||
    'Python' in languages;

  if (hasPython) return 'python';

  if (deps.express || deps.fastify || deps.koa || deps['@nestjs/core']) return 'backend';

  // Next.js ships a server runtime and API routes → full stack.
  if (deps.next) return 'fullstack';

  if (deps.react || deps.vue || deps['@angular/core'] || deps.vite) return 'frontend';

  if ('TypeScript' in languages || 'JavaScript' in languages || 'HTML' in languages) {
    return 'frontend';
  }

  return 'other';
}

/** Extract a clean, deduplicated list of libraries from package.json. */
export function detectLibraries(info: ManifestInfo): string[] {
  const found = new Set<string>();
  const deps = { ...(info.pkg?.dependencies ?? {}), ...(info.pkg?.devDependencies ?? {}) };

  for (const key of Object.keys(deps)) {
    if (IGNORED_DEPS.has(key)) continue;
    const name = LIBRARY_NAMES[key];
    if (name) found.add(name);
  }

  if (info.files.includes('requirements.txt') || info.files.includes('pyproject.toml')) {
    found.add('Python');
  }

  return [...found].sort();
}

/** Verified tooling — only what is observable in the repository root. */
export function detectTools(files: string[]): string[] {
  const tools: string[] = [];
  if (files.includes('.github')) tools.push('GitHub Actions');
  return tools;
}

/** Languages with at least 1 byte → sorted names (biggest first). */
export function languageNames(languages: Record<string, number>): string[] {
  return Object.entries(languages)
    .filter(([, bytes]) => bytes > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([name]) => name);
}

/**
 * "Featured" score — a TRANSPARENT, rule-based selection signal.
 * It is NOT a quality rating: it only measures how much information and
 * activity GitHub shows for a repository.
 *
 *  +2  description present
 *  +2  README present
 *  +1  per topic (max +3)
 *  +2  live demo (homepage or GitHub Pages)
 *  +1  per star (max +3)
 *  +1  per fork  (max +2)
 *  +1  repository size > 100 KB
 *  +1  pushed within the last 30 days
 */
export function featuredScore(repo: {
  description: string | null;
  topics: string[];
  homepage: string | null;
  has_pages: boolean;
  stargazers_count: number;
  forks_count: number;
  size: number;
  pushed_at: string;
  hasReadme: boolean;
}): number {
  let score = 0;
  if (repo.description) score += 2;
  if (repo.hasReadme) score += 2;
  score += Math.min(repo.topics.length, 3);
  if (repo.homepage || repo.has_pages) score += 2;
  score += Math.min(repo.stargazers_count, 3);
  score += Math.min(repo.forks_count, 2);
  if (repo.size > 100) score += 1;
  const days = (Date.now() - new Date(repo.pushed_at).getTime()) / 86_400_000;
  if (days <= 30) score += 1;
  return score;
}
