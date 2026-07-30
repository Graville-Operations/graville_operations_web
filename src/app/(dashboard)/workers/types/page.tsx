'use client';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { useWorkersDashboard } from '@/hooks/workers/useWorkersDashboard';
import { WorkerTypesList } from '@/components/workers/WorkerTypesList';

export default function WorkerTypesPage() {
  const router = useRouter();
  const { workerTypes, loading } = useWorkersDashboard();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()}
          className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors cursor-pointer">
          <ArrowLeft size={18} />
        </button>
        <div>
          <p className="gv-eyebrow">Workers</p>
          <h1 className="text-2xl font-bold mt-1">Worker Types</h1>
        </div>
      </div>

      {loading ? (
        <div className="gv-card p-4 space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 rounded-lg animate-pulse" style={{ background: 'var(--gv-glass-bg-strong)' }} />
          ))}
        </div>
      ) : (
        <WorkerTypesList workerTypes={workerTypes} />
      )}
    </div>
  );
}