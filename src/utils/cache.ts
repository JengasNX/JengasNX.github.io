/**
 * Tiny localStorage cache with TTL used by the GitHub service.
 * Prevents hammering the GitHub API (60 req/h unauthenticated) on every visit.
 */

interface Entry<T> {
  data: T;
  /** Epoch ms when the entry expires. */
  expires: number;
}

const PREFIX = 'gh-cache:v1:';

export function cacheGet<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (!raw) return null;
    const entry = JSON.parse(raw) as Entry<T>;
    if (Date.now() > entry.expires) {
      localStorage.removeItem(PREFIX + key);
      return null;
    }
    return entry.data;
  } catch {
    return null;
  }
}

/** Returns expired data (if any) so it can be served as stale fallback. */
export function cacheGetStale<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (!raw) return null;
    return (JSON.parse(raw) as Entry<T>).data;
  } catch {
    return null;
  }
}

export function cacheSet<T>(key: string, data: T, ttlMs: number): void {
  try {
    const entry: Entry<T> = { data, expires: Date.now() + ttlMs };
    localStorage.setItem(PREFIX + key, JSON.stringify(entry));
  } catch {
    // Storage full / private mode — degrade gracefully to no caching.
  }
}

export function cacheClear(): void {
  try {
    Object.keys(localStorage)
      .filter((k) => k.startsWith(PREFIX))
      .forEach((k) => localStorage.removeItem(k));
  } catch {
    /* ignore */
  }
}
