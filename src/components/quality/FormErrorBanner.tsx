'use client';

import { AlertCircle } from 'lucide-react';

interface FormErrorBannerProps {
  message: string;
}

export default function FormErrorBanner({ message }: FormErrorBannerProps) {
  return (
    <div className="gv-card flex items-center gap-2 text-sm text-red-400 border-red-500/20 bg-red-500/10 p-4">
      <AlertCircle size={15} className="shrink-0" /> {message}
    </div>
  );
}