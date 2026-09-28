import { clearSession } from '@/lib/auth';
import { clearAllEntityCache } from '@/lib/api/cache';
import { useSiteStore } from '@/store/site-store';
import { useMenuStore } from '@/store/menu-store';
import { useProfileStore } from '@/store/profile-store';

export function clearData(): void {
  clearSession();

  useSiteStore.getState().clear();
  useMenuStore.getState().clearMenus();
  useProfileStore.getState().clearProfile();

  if (typeof window !== 'undefined') {
    try {
      window.sessionStorage.clear();
    } catch {}
  }

  // Everything cached lives in lib/api/cache.ts — one call wipes it all.
  clearAllEntityCache();
}