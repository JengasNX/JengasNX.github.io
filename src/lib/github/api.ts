/**
 * Low-level GitHub REST API transport.
 *
 * - Unauthenticated public requests (60 req/h per IP) are enough for this
 *   portfolio: no PAT ever reaches the browser.
 * - During `astro build` an optional GITHUB_TOKEN (server-side only, read
 *   from process.env) raises the limit to 5000 req/h.
 * - Every response is cached (localStorage in the browser, memory in Node).
 * - On rate limit / network errors we fall back to stale cache when possible.
 */

import { cacheGet, cacheGetStale, cacheSet } from './cache';

const API = 'https://api.github.com';

/** Cache TTLs (ms). */
export const TTL = {
  profile: 15 * 60_000,
  repos: 10 * 60_000,
  tech: 30 * 60_000,
  readme: 60 * 60_000,
} as const;

/**
 * Build-time token. Guarded so the client bundle never touches `process`,
 * and only attached when rendering on the server (`window` is undefined).
 */
const BUILD_TOKEN: string | undefined =
  typeof process !== 'undefined' && typeof window === 'undefined'
    ? (process.env?.GITHUB_TOKEN || undefined)
    : undefined;

export class GithubError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly rateLimited = false,
  ) {
    super(message);
    this.name = 'GithubError';
  }
}

interface RequestOpts {
  /** Cache TTL; 0 disables caching. */
  ttl?: number;
  /** Custom Accept header (e.g. raw README). */
  accept?: string;
  /** Serve expired cache instead of failing (default: true). */
  staleFallback?: boolean;
}

function baseHeaders(accept: string): Record<string, string> {
  const headers: Record<string, string> = { Accept: accept };
  if (BUILD_TOKEN) headers.Authorization = `Bearer ${BUILD_TOKEN}`;
  return headers;
}

async function request<T>(path: string, opts: RequestOpts = {}): Promise<T> {
  const {
    ttl = TTL.repos,
    accept = 'application/vnd.github+json',
    staleFallback = true,
  } = opts;
  const key = `${path}|${accept}`;
  const cached = cacheGet<T>(key);
  if (cached !== null) return cached;

  let res: Response;
  try {
    res = await fetch(`${API}${path}`, { headers: baseHeaders(accept) });
  } catch (err) {
    const stale = staleFallback ? cacheGetStale<T>(key) : null;
    if (stale !== null) return stale;
    throw new GithubError(err instanceof Error ? err.message : 'Network error', 0);
  }

  if (res.ok) {
    const data = (await res.json()) as T;
    if (ttl > 0) cacheSet(key, data, ttl);
    return data;
  }

  // Rate limited (403/429) or missing resource (404).
  const remaining = res.headers.get('x-ratelimit-remaining');
  const rateLimited = res.status === 429 || (res.status === 403 && remaining === '0');

  if (rateLimited && staleFallback) {
    const stale = cacheGetStale<T>(key);
    if (stale !== null) return stale;
  }

  if (rateLimited) {
    const reset = res.headers.get('x-ratelimit-reset');
    const when = reset ? new Date(Number(reset) * 1000).toLocaleTimeString() : 'later';
    throw new GithubError(`GitHub API rate limit exceeded. Resets at ${when}.`, res.status, true);
  }

  if (res.status === 404) {
    throw new GithubError('Not found on GitHub', 404);
  }

  throw new GithubError(`GitHub API error (${res.status})`, res.status);
}

/** GET JSON with optional custom accept header. */
export function getJson<T>(path: string, opts?: RequestOpts): Promise<T> {
  return request<T>(path, opts);
}

/** GET raw text (used for README markdown). */
export async function getRaw(path: string, opts?: RequestOpts): Promise<string> {
  const key = `${path}|raw`;
  const cached = cacheGet<string>(key);
  if (cached !== null) return cached;

  try {
    const res = await fetch(`${API}${path}`, {
      headers: baseHeaders('application/vnd.github.raw+json'),
    });
    if (!res.ok) throw new GithubError(`GitHub API error (${res.status})`, res.status);
    const text = await res.text();
    const ttl = opts?.ttl ?? TTL.readme;
    if (ttl > 0) cacheSet(key, text, ttl);
    return text;
  } catch (err) {
    const stale = cacheGetStale<string>(key);
    if (stale !== null) return stale;
    if (err instanceof GithubError) throw err;
    throw new GithubError('Network error', 0);
  }
}
