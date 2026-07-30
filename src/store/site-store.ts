import { create } from 'zustand';
import { fetchSites as fetchSitesApi } from '@/lib/api/sites';
import { withRetry } from '@/lib/retry';
import type { Site } from '@/types/site';

interface SiteStoreState {
  sites: Site[];
  sitesById: Record<number, Site>;
  isLoading: boolean;
  error: string | null;
  hasFetched: boolean;
  isOffline: boolean; 
  fetchSites: (force?: boolean, onRetry?: (attempt: number, max: number) => void) => Promise<void>;
  getSite: (id: number) => Site | undefined;
  clear: () => void;
}

export const useSiteStore = create<SiteStoreState>((set, get) => ({
  sites: [],
  sitesById: {},
  isLoading: false,
  error: null,
  hasFetched: false,
  isOffline: false,

  fetchSites: async (force = false, onRetry) => {
    const { hasFetched, isLoading, sites } = get();
    if ((hasFetched && !force) || isLoading) return;

    set({ isLoading: true, error: null });
    try {
      const data = await withRetry(() => fetchSitesApi(), {
        retries: 3,
        delayMs: 5000,
        onRetry,
      });
      const sitesById: Record<number, Site> = {};
      data.forEach((s) => { sitesById[s.id] = s; });
      set({
        sites: data,
        sitesById,
        isLoading: false,
        hasFetched: true,
        isOffline: false,
        error: null,
      });
    } catch (err) {
      set({
        isLoading: false,
        error: err instanceof Error ? err.message : 'Failed to load sites',
        isOffline: sites.length > 0,
      });
    }
  },

  getSite: (id) => get().sitesById[id],

  clear: () => set({ sites: [], sitesById: {}, hasFetched: false, error: null, isOffline: false }),
}));

export function getSiteById(id: number): Site | undefined {
  return useSiteStore.getState().sitesById[id];
}