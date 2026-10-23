'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import Sidebar from '@/components/layout/sidebar';
import { ROUTES } from '@/lib/routes';

/**
 * Responsive dashboard frame.
 *  - md and up: identical to before (fixed 16rem sidebar beside the content).
 *  - below md : sidebar becomes an off-canvas drawer opened from a top bar.
 */
export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Close the drawer after navigating
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Escape closes it; lock page scroll while it is open
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <div className="flex h-dvh">
      {/* Backdrop (mobile only) */}
      {open && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/60"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar: drawer on mobile, `display: contents` on md+ so layout is unchanged */}
      <div
        id="dashboard-sidebar"
        className={`fixed inset-y-0 left-0 z-50 w-64 max-w-[85vw] bg-[#0d1528] transition-transform duration-200 ease-out md:contents ${
          open ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0`}
      >
        <Sidebar />
      </div>

      <div className="flex-1 min-w-0 flex flex-col">
        {/* Mobile top bar */}
        <header className="md:hidden shrink-0 h-14 flex items-center gap-3 px-4 border-b border-white/10 bg-[#0d1528]/90 backdrop-blur-md">
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            aria-controls="dashboard-sidebar"
            className="inline-flex items-center justify-center w-10 h-10 -ml-2 rounded-lg text-white/80 hover:bg-white/10"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
          <Link href={ROUTES.home} className="flex items-center gap-2 min-w-0">
            <span className="w-7 h-7 bg-[#33907C] rounded-lg flex items-center justify-center shrink-0 text-white text-sm font-bold">
              G
            </span>
            <span className="font-bold text-white text-sm truncate">Graville Operations</span>
          </Link>
        </header>

        <main className="flex-1 min-w-0 overflow-y-auto p-4 sm:p-6 md:p-8 relative">
          {children}
        </main>
      </div>
    </div>
  );
}
