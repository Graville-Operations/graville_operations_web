import { create } from 'zustand';
import { fetchSites as fetchSitesApi } from '@/lib/api/sites';
import { ENTITY_CACHE_KEYS, readEntityCache } from '@/lib/api/cache';
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

function indexById(list: Site[]): Record<number, Site> {
  const byId: Record<number, Site> = {};
  list.forEach((s) => { byId[s.id] = s; });
  return byId;
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
    if (isLoading) return;

    // The shared cache (lib/api/cache.ts) is the only cache. While it still
    // holds the list there's no need to fetch — just make sure this store
    // is populated from it. Once a create/update clears that entry, the next
    // call goes back to the API.
    if (!force) {
      const cached = readEntityCache<Site[]>(ENTITY_CACHE_KEYS.sites);
      if (cached !== null) {
        if (!hasFetched) {
          set({
            sites: cached,
            sitesById: indexById(cached),
            hasFetched: true,
            isOffline: false,
            error: null,
          });
        }
        return;
      }
    }

    set({ isLoading: true, error: null });
    try {
      const data = await withRetry(() => fetchSitesApi(), {
        retries: 3,
        delayMs: 5000,
        onRetry,
      });
      set({
        sites: data,
        sitesById: indexById(data),
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