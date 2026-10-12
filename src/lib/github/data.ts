/**
 * BUILD-TIME ONLY. Loads the GitHub snapshot for static rendering.
 *
 * Not imported by any client script — it uses `node:fs`.
 *
 * Strategy:
 *   1. fresh disk cache (.cache/github.json, < 10 min) → no requests at all
 *   2. otherwise fetch profile + repositories and persist the snapshot
 *   3. on any failure → serve the stale disk cache (up to 7 days)
 *   4. with no cache at all → mark the snapshot `unavailable` and let the UI
 *      show a graceful placeholder instead of crashing the build
 *
 * Optional GITHUB_TOKEN (CI secret) is picked up by ./api.ts and raises the
 * build-time rate limit from 60 to 5000 requests/hour.
 */

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { GithubSnapshot } from './types';
import { buildStats, getProfile, getProjects, slimProject } from './service';

const CACHE_DIR = path.join(process.cwd(), '.cache');
const CACHE_FILE = path.join(CACHE_DIR, 'github.json');

const FRESH_MS = 10 * 60_000;
const STALE_MS = 7 * 24 * 60 * 60_000;

const EMPTY: GithubSnapshot = {
  fetchedAt: 0,
  profile: null,
  projects: [],
  stats: null,
  unavailable: true,
};

let memo: Promise<GithubSnapshot> | null = null;

/** Memoised so all pages of one build share a single set of API calls. */
export function loadGithubSnapshot(): Promise<GithubSnapshot> {
  memo ??= load();
  return memo;
}

async function readDisk(): Promise<GithubSnapshot | null> {
  try {
    const raw = await readFile(CACHE_FILE, 'utf8');
    const snap = JSON.parse(raw) as GithubSnapshot;
    if (Date.now() - snap.fetchedAt > STALE_MS) return null;
    // Older snapshots may carry the full GitHub repository object — trim it.
    const projects = (snap.projects ?? []).map(slimProject);
    const stats = snap.profile ? buildStats(snap.profile, projects) : snap.stats;
    return { ...snap, projects, stats };
  } catch {
    return null;
  }
}

async function writeDisk(snap: GithubSnapshot): Promise<void> {
  try {
    await mkdir(CACHE_DIR, { recursive: true });
    await writeFile(CACHE_FILE, JSON.stringify(snap), 'utf8');
  } catch {
    /* read-only checkout or no permission — the build still works */
  }
}

async function load(): Promise<GithubSnapshot> {
  const disk = await readDisk();
  if (disk && Date.now() - disk.fetchedAt < FRESH_MS) return disk;

  try {
    const [profile, projects] = await Promise.all([getProfile(), getProjects()]);
    const snap: GithubSnapshot = {
      fetchedAt: Date.now(),
      profile,
      projects,
      stats: buildStats(profile, projects),
      unavailable: false,
    };
    await writeDisk(snap);
    return snap;
  } catch (err) {
    console.warn('[github] build-time fetch failed:', err);
    if (disk) return { ...disk, unavailable: true };
    return EMPTY;
  }
}
