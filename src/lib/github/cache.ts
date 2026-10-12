/**
 * Response cache with TTL + stale fallback.
 *
 * - In the browser this is localStorage (60 unauthenticated requests/hour).
 * - During the build (Node) localStorage does not exist, so we fall back to
 *   an in-memory Map — the build-level disk cache lives in ./data.ts.
 */

interface Entry<T> {
  data: T;
  /** Epoch ms when the entry expires. */
  expires: number;
}

const PREFIX = 'gh-cache:v2:';

const memory = new Map<string, string>();

function storage(): {
  get(k: string): string | null;
  set(k: string, v: string): void;
  del(k: string): void;
  keys(): string[];
} | null {
  try {
    // `window` guards against Node 26's experimental global localStorage.
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      return {
        get: (k) => localStorage.getItem(k),
        set: (k, v) => localStorage.setItem(k, v),
        del: (k) => localStorage.removeItem(k),
        keys: () => Object.keys(localStorage),
      };
    }
  } catch {
    /* private mode / disabled storage → memory fallback */
  }
  return {
    get: (k) => memory.get(k) ?? null,
    set: (k, v) => void memory.set(k, v),
    del: (k) => void memory.delete(k),
    keys: () => [...memory.keys()],
  };
}

export function cacheGet<T>(key: string): T | null {
  try {
    const raw = storage()?.get(PREFIX + key);
    if (!raw) return null;
    const entry = JSON.parse(raw) as Entry<T>;
    if (Date.now() > entry.expires) {
      storage()?.del(PREFIX + key);
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
    const raw = storage()?.get(PREFIX + key);
    if (!raw) return null;
    return (JSON.parse(raw) as Entry<T>).data;
  } catch {
    return null;
  }
}

export function cacheSet<T>(key: string, data: T, ttlMs: number): void {
  try {
    const entry: Entry<T> = { data, expires: Date.now() + ttlMs };
    storage()?.set(PREFIX + key, JSON.stringify(entry));
  } catch {
    /* storage full — degrade to no caching */
  }
}

export function cacheClear(): void {
  try {
    const s = storage();
    if (!s) return;
    s.keys()
      .filter((k) => k.startsWith(PREFIX))
      .forEach((k) => s.del(k));
  } catch {
    /* ignore */
  }
}
