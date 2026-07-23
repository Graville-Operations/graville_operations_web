'use client';

import { WifiOff } from 'lucide-react';
import { useNetworkStore } from '@/store/network-store';

export function GlobalNetworkBanner() {
  const isNetworkError = useNetworkStore((s) => s.isNetworkError);
  const message = useNetworkStore((s) => s.message);

  if (!isNetworkError) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium"
      style={{
        background: 'rgba(248,113,113,0.15)',
        borderBottom: '1px solid rgba(248,113,113,0.3)',
        color: '#f87171',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
    >
      <WifiOff className="w-4 h-4" />
      {message}
    </div>
  );
}