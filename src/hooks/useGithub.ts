import { useCallback, useEffect, useRef, useState } from 'react';
import {
  getProfile,
  getProjects,
  getStats,
  GithubError,
} from '../services/github';
import { cacheClear } from '../utils/cache';
import type { GithubProfile, GithubStats, Project } from '../types';

interface GithubState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  rateLimited: boolean;
}

/**
 * Central GitHub data hook.
 *
 * - loads profile + projects once and shares the result across sections
 * - exposes retry and "Refresh GitHub Data" (busts the cache)
 */
export function useGithub() {
  const [profile, setProfile] = useState<GithubState<GithubProfile>>({
    data: null,
    loading: true,
    error: null,
    rateLimited: false,
  });
  const [projects, setProjects] = useState<GithubState<Project[]>>({
    data: null,
    loading: true,
    error: null,
    rateLimited: false,
  });
  const [stats, setStats] = useState<GithubState<GithubStats>>({
    data: null,
    loading: true,
    error: null,
    rateLimited: false,
  });
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const handleError = useCallback((err: unknown) => {
    const message =
      err instanceof GithubError ? err.message : 'Failed to load GitHub data';
    const rateLimited = err instanceof GithubError && err.rateLimited;
    return { error: message, rateLimited };
  }, []);

  const load = useCallback(async () => {
    setProfile((s) => ({ ...s, loading: true, error: null }));
    setProjects((s) => ({ ...s, loading: true, error: null }));
    setStats((s) => ({ ...s, loading: true, error: null }));

    const [pRes, projRes, stRes] = await Promise.allSettled([
      getProfile(),
      getProjects(),
      getStats(),
    ]);

    if (!mounted.current) return;

    if (pRes.status === 'fulfilled') {
      setProfile({ data: pRes.value, loading: false, error: null, rateLimited: false });
    } else {
      const e = handleError(pRes.reason);
      setProfile({ data: null, loading: false, ...e, rateLimited: e.rateLimited });
    }

    if (projRes.status === 'fulfilled') {
      setProjects({ data: projRes.value, loading: false, error: null, rateLimited: false });
      setLastUpdated(Date.now());
    } else {
      const e = handleError(projRes.reason);
      setProjects({ data: null, loading: false, ...e, rateLimited: e.rateLimited });
    }

    if (stRes.status === 'fulfilled') {
      setStats({ data: stRes.value, loading: false, error: null, rateLimited: false });
    } else {
      const e = handleError(stRes.reason);
      setStats({ data: null, loading: false, ...e, rateLimited: e.rateLimited });
    }
  }, [handleError]);

  useEffect(() => {
    void load();
  }, [load]);

  /** Bust the cache and reload everything from GitHub. */
  const refresh = useCallback(async () => {
    setRefreshing(true);
    cacheClear();
    try {
      await load();
    } finally {
      if (mounted.current) setRefreshing(false);
    }
  }, [load]);

  const retry = useCallback(() => void load(), [load]);

  return {
    profile: profile.data,
    projects: projects.data,
    stats: stats.data,
    loading: profile.loading || projects.loading,
    error: projects.error ?? profile.error,
    rateLimited: projects.rateLimited || profile.rateLimited,
    refresh,
    retry,
    refreshing,
    lastUpdated,
  };
}
