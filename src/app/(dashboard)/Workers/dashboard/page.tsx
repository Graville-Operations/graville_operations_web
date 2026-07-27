'use client';
import { useState, useCallback, useRef, useMemo } from 'react';
import { UserCheck, HardHat, Plus, X } from 'lucide-react';
import { useWorkersDashboard } from '@/hooks/workers/useWorkersDashboard';
import { WorkerTypesCard } from '@/components/workers/WorkerTypeCard';
import { AddWorkerTypeOverlay } from '@/components/workers/AddWorkerTypeOverlay';
import { WorkersBySiteSection } from '@/components/workers/WorkersBySiteSection';
import { SkillType } from '@/types/worker-dashboard';
import { useConstructionSites } from '@/hooks/sites/useConstructionSites';

type ToastType = 'success' | 'error';
interface ToastState { message: string; type: ToastType; id: number; }

function Toast({ toast, onDismiss }: { toast: ToastState; onDismiss: () => void }) {
  return (
    <div className={`fixed bottom-6 right-6 z-80 flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl border text-sm font-medium transition-all ${toast.type === 'success' ? 'bg-(--gv-glass-bg,#1a1a2e) border-(--gv-border-success) text-(--gv-text-success)' : 'bg-(--gv-glass-bg,#1a1a2e) border-(--gv-border-danger) text-destructive'}`}>
      {toast.message}
      <button onClick={onDismiss} className="ml-1 opacity-60 hover:opacity-100 cursor-pointer"><X size={13} /></button>
    </div>
  );
}

export default function WorkersDashboardPage() {
  const { workerTypes, loading, addWorkerType } = useWorkersDashboard();
  const { sites, loading: sitesLoading } = useConstructionSites();

  const [showAdd, setShowAdd] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);
  const toastId = useRef(0);

  const showToast = useCallback((message: string, type: ToastType) => {
    setToast({ message, type, id: ++toastId.current });
  }, []);

  const skilledCount = useMemo(
    () => workerTypes.filter(wt => wt.skill === SkillType.SKILLED).length,
    [workerTypes]
  );
  const unskilledCount = useMemo(
    () => workerTypes.filter(wt => wt.skill === SkillType.UNSKILLED).length,
    [workerTypes]
  );

  return (
    <>
      <div className="space-y-8">
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

        <div className="grid grid-cols-2 gap-4 max-w-md">
          <div className="gv-card flex flex-col gap-4 border-border">
            <div className="gv-icon-box"><span className="text-primary"><HardHat size={18} /></span></div>
            <div>
              <p className="gv-label">Skilled Types</p>
              {loading
                ? <div className="h-6 w-10 rounded-lg animate-pulse" style={{ background: 'var(--gv-glass-bg-strong)' }} />
                : <p className="text-2xl font-bold tracking-tight text-foreground">{skilledCount}</p>}
            </div>
          </div>
          <div className="gv-card flex flex-col gap-4 border-border">
            <div className="gv-icon-box"><span className="text-primary"><UserCheck size={18} /></span></div>
            <div>
              <p className="gv-label">Unskilled Types</p>
              {loading
                ? <div className="h-6 w-10 rounded-lg animate-pulse" style={{ background: 'var(--gv-glass-bg-strong)' }} />
                : <p className="text-2xl font-bold tracking-tight text-foreground">{unskilledCount}</p>}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <WorkerTypesCard workerTypes={workerTypes} loading={loading} onAdd={() => setShowAdd(true)} />
          <WorkersBySiteSection sites={sites} sitesLoading={sitesLoading} />
        </div>
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