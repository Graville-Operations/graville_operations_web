'use client';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { SiteWorkersList } from '@/components/workers/SiteWorkersList';
import { useSiteWorkers } from '@/hooks/workers/useSiteWorkers';
import { useConstructionSites } from '@/hooks/sites/useConstructionSites';

export default function SiteWorkersPage() {
  const params = useParams<{ siteId: string }>();
  const router = useRouter();
  const siteId = Number(params.siteId);

  const { workers, loading } = useSiteWorkers(siteId);
  const { sites } = useConstructionSites();
  const site = sites.find(s => s.id === siteId);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()}
          className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors cursor-pointer">
          <ArrowLeft size={18} />
        </button>
        <div>
          <p className="gv-eyebrow">Workers</p>
          <h1 className="text-2xl font-bold mt-1">{site?.name ?? `Site ${siteId}`}</h1>
        </div>
      </div>

      {loading ? (
        <div className="gv-card p-4 space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 rounded-lg animate-pulse" style={{ background: 'var(--gv-glass-bg-strong)' }} />
          ))}
        </div>
      ) : (
        <SiteWorkersList workers={workers} />
      )}
    </div>
  );
}