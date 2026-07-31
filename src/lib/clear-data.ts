import { clearSession } from '@/lib/auth';
import { cacheBust } from '@/lib/persistent-cache';
import { clearSiteCache } from '@/lib/sites-cache';
import { clearAllDeptCaches } from '@/lib/departments-cache';
import { useSiteStore } from '@/store/site-store';
import { useMenuStore } from '@/store/menu-store';
import { useUserStore } from '@/store/user-store';
import { useInvoiceStore } from '@/store/invoice-store';
import { useProfileStore } from '@/store/profile-store';

export function clearData(): void {
  clearSession();

  useSiteStore.getState().clear();
  useMenuStore.getState().clearMenus();
  useUserStore.getState().clearUsers();
  useInvoiceStore.getState().clearInvoices();
  useProfileStore.getState().clearProfile();

  clearSiteCache();
  clearAllDeptCaches();

  if (typeof window !== 'undefined') {
    try {
      window.sessionStorage.clear();
    } catch {}
  }

  cacheBust('gv:');
}