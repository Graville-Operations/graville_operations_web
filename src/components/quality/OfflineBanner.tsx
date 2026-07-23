'use client';

import { WifiOff, RefreshCw } from 'lucide-react';

interface OfflineBannerProps {
  message: string;
  onRetry?: () => void;
}

export default function OfflineBanner({ message, onRetry }: OfflineBannerProps) {
  return (
    <div className="gv-card flex items-center gap-3 text-sm text-amber-400 border-amber-500/20 bg-amber-500/10 p-3">
      <WifiOff size={15} className="shrink-0" />
      <span>{message}</span>
      {onRetry && (
        <button onClick={onRetry} className="ml-auto underline underline-offset-2 hover:text-amber-300">
          <RefreshCw size={13} className="inline mr-1" /> Retry
        </button>
      )}
    </div>
  );
}