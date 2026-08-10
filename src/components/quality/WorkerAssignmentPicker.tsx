'use client';

import { Loader2, AlertCircle, UserCircle2, Search, Check, Users } from 'lucide-react';
import type { SiteWorker } from '@/types/site';
import { getWorkerName, getWorkerSubtitle } from '@/lib/utils/worker-helpers';

interface WorkerAssignmentPickerProps {
  workers: SiteWorker[];
  loading: boolean;
  error: string | null;
  selectedWorkers: number[];
  onToggleWorker: (id: number) => void;
  search: string;
  onSearchChange: (value: string) => void;
}

export default function WorkerAssignmentPicker({
  workers,
  loading,
  error,
  selectedWorkers,
  onToggleWorker,
  search,
  onSearchChange,
}: WorkerAssignmentPickerProps) {
  return (
    <div>
      <label className="gv-label flex items-center gap-1.5">
        <Users size={12} />
        Assign Workers
        <span className="text-(--gv-text-faint) normal-case tracking-normal font-normal">(optional)</span>
      </label>

      <div className="gv-card overflow-hidden p-0">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-(--gv-glass-border)">
          <Search size={14} className="text-(--gv-text-faint) shrink-0" />
          <input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search workers…"
            className="flex-1 bg-transparent text-sm text-(--gv-text-primary) placeholder-(--gv-text-faint) outline-none"
          />
          {selectedWorkers.length > 0 && (
            <span className="text-xs text-(--gv-brand) font-medium shrink-0">
              {selectedWorkers.length} selected
            </span>
          )}
        </div>

        <div className="max-h-64 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-10 text-(--gv-text-subtle) gap-2 text-sm">
              <Loader2 size={16} className="animate-spin" /> Loading workers…
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-10 text-red-400 gap-2 text-sm px-4 text-center">
              <AlertCircle size={20} />
              {error}
            </div>
          ) : workers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-(--gv-text-faint) gap-2 text-sm">
              <UserCircle2 size={28} strokeWidth={1} />
              {search ? 'No workers match' : 'No workers found for this site'}
            </div>
          ) : (
            workers.map((worker) => {
              const selected = selectedWorkers.includes(worker.id);
              const workerName = getWorkerName(worker);
              const subtitle = getWorkerSubtitle(worker);
              return (
                <button
                  key={worker.id}
                  type="button"
                  onClick={() => onToggleWorker(worker.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-white/4 ${
                    selected ? 'bg-(--gv-brand)/10' : ''
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${
                      selected ? 'bg-(--gv-brand) text-white' : 'bg-white/10 text-(--gv-text-muted)'
                    }`}
                  >
                    {selected ? <Check size={14} /> : workerName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${selected ? 'text-(--gv-brand)' : 'text-(--gv-text-primary)'}`}>
                      {workerName}
                    </p>
                    {subtitle && (
                      <p className="text-xs text-(--gv-text-faint) truncate">{subtitle}</p>
                    )}
                  </div>
                  <div
                    className={`w-4 h-4 rounded-md border shrink-0 flex items-center justify-center transition-all ${
                      selected ? 'bg-(--gv-brand) border-(--gv-brand)' : 'border-(--gv-glass-border)'
                    }`}
                  >
                    {selected && <Check size={10} strokeWidth={3} />}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}