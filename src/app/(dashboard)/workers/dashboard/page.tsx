'use client';
import { useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, X } from 'lucide-react';
import { useWorkersDashboard } from '@/hooks/workers/useWorkersDashboard';
import { WorkerTypesList } from '@/components/workers/WorkerTypesList';
import { AddWorkerTypeOverlay } from '@/components/workers/AddWorkerTypeOverlay';
import { LabourSheetSection } from '@/components/workers/LabourSheetSection';
import { ROUTES } from '@/lib/routes';

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
  const router = useRouter();
  const { workerTypes, loading, addWorkerType } = useWorkersDashboard();

  const [showAdd, setShowAdd] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);
  const toastId = useRef(0);

  const showToast = useCallback((message: string, type: ToastType) => {
    setToast({ message, type, id: ++toastId.current });
  }, []);

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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          <div className="flex flex-col gap-3 h-full">
            <div className="h-9 flex items-center">
              <h2 className="text-lg font-semibold text-foreground">Worker Types</h2>
            </div>
            {loading ? (
              <div className="gv-card p-4 space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-12 rounded-lg animate-pulse" style={{ background: 'var(--gv-glass-bg-strong)' }} />
                ))}
              </div>
            ) : (
              <WorkerTypesList
                workerTypes={workerTypes}
                limit={5}
                onViewAll={() => router.push(ROUTES.workers.types)}
              />
            )}
          </div>
          <LabourSheetSection />
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