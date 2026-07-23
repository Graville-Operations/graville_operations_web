'use client';
import { useState, useCallback, useRef } from 'react';
import { Wallet, Plus, X } from 'lucide-react';
import { useWorkersDashboard } from '@/hooks/workers/useWorkersDashboard';
import { useSiteWorkers } from '@/hooks/workers/useSiteWorkers';
import { useConstructionSites } from '@/hooks/sites/useConstructionSites';
import { WorkerTypesList } from '@/components/workers/WorkerTypesList';
import { AddWorkerTypeOverlay } from '@/components/workers/AddWorkerTypeOverlay';
import { SiteWorkersList } from '@/components/workers/SiteWorkersList';
import { DarkSelect } from '@/components/shared/DarkSelect';

type ToastType = 'success' | 'error';
interface ToastState { message: string; type: ToastType; id: number; }

function Toast({ toast, onDismiss }: { toast: ToastState; onDismiss: () => void }) {
  return (
    <div className={`fixed bottom-6 right-6 z-80 flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl border text-sm font-medium transition-all ${toast.type === 'success' ? 'bg-[color:var(--gv-glass-bg,#1a1a2e)] border-[color:var(--gv-border-success)] text-[color:var(--gv-text-success)]' : 'bg-[color:var(--gv-glass-bg,#1a1a2e)] border-[color:var(--gv-border-danger)] text-[color:var(--destructive)]'}`}>
      {toast.message}
      <button onClick={onDismiss} className="ml-1 opacity-60 hover:opacity-100 cursor-pointer"><X size={13} /></button>
    </div>
  );
}

export default function WorkersDashboardPage() {
  const { workerTypes, totalWorkerTypes, loading, addWorkerType } = useWorkersDashboard();
  const { sites, loadingSites } = useConstructionSites();
  const [selectedSiteId, setSelectedSiteId] = useState<number | null>(null);
  const { workers: siteWorkers, loading: siteWorkersLoading } = useSiteWorkers(selectedSiteId);

  const [showAdd, setShowAdd] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);
  const toastId = useRef(0);
  const showToast = useCallback((message: string, type: ToastType) => {
    setToast({ message, type, id: ++toastId.current });
  }, []);

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="gv-eyebrow">Workers</p>
            <h1 className="text-2xl font-bold mt-1">Dashboard</h1>
          </div>
          <button onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:opacity-90 transition-all active:scale-[0.98] cursor-pointer">
            <Plus size={15} />Add Worker Type
          </button>
        </div>

        <div className="gv-card flex flex-col gap-4 border-border w-fit min-w-50">
          <div className="gv-icon-box"><span className="text-primary"><Wallet size={18} /></span></div>
          <div>
            <p className="gv-label">Worker Types</p>
            {loading
              ? <div className="h-6 w-10 rounded-lg animate-pulse" style={{ background: 'var(--gv-glass-bg-strong)' }} />
              : <p className="text-2xl font-bold tracking-tight text-foreground">{totalWorkerTypes}</p>}
          </div>
        </div>

        <h2 className="text-lg font-semibold text-foreground">All Worker Types</h2>
        {loading ? (
          <div className="gv-card h-40 animate-pulse" style={{ background: 'var(--gv-glass-bg-strong)' }} />
        ) : (
          <WorkerTypesList workerTypes={workerTypes} />
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          <h2 className="text-lg font-semibold text-foreground">All Workers</h2>
          <div className="w-full sm:w-56">
            <DarkSelect
              value={selectedSiteId ?? ''}
              onChange={e => setSelectedSiteId(e.target.value ? Number(e.target.value) : null)}
            >
              <option value="">{loadingSites ? 'Loading sites…' : 'Select a site'}</option>
              {sites.map(site => (
                <option key={site.id} value={site.id}>{site.name}</option>
              ))}
            </DarkSelect>
          </div>
        </div>

        {selectedSiteId == null ? (
          <div className="gv-card flex items-center justify-center py-10">
            <p className="text-sm text-muted-foreground">Select a site to view its workers.</p>
          </div>
        ) : siteWorkersLoading ? (
          <div className="gv-card h-28 animate-pulse" style={{ background: 'var(--gv-glass-bg-strong)' }} />
        ) : (
          <SiteWorkersList workers={siteWorkers} />
        )}
      </div>

      <AddWorkerTypeOverlay
        open={showAdd}
        onClose={() => setShowAdd(false)}
        onSubmit={async (payload) => {
          await addWorkerType(payload);
          showToast('Worker type created successfully.', 'success');
        }}
      />
      {toast && <Toast toast={toast} onDismiss={() => setToast(null)} />}
    </>
  );
}