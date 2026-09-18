'use client';

import { useRepairApprovals } from '@/hooks/logistics/useRepairApprovals';
import SearchInput from '@/components/finance/shared/SearchInput';
import RepairApprovalsTable from '@/components/logistics/maintenance/RepairApprovalsTable';
import RepairApprovalOverlay from '@/components/logistics/maintenance/RepairApprovalOverlay';
import { RepairApprovalForm, RepairActionType } from '@/types/vehicle-repair';

export default function RepairApprovalsPage() {
  const {
    requests, loading,
    search, setSearch,
    selected, openDetail, closeDetail,
    submitAction, hasFilter,
  } = useRepairApprovals();

  const handleApprove = async (form: RepairApprovalForm) => {
    if (!selected) return;
    await submitAction(selected.id, {
      action: RepairActionType.APPROVE,
      approved_cost: Number(form.approvedCost),
      comment: form.comment || null,
    });
  };

  const handleReject = async (comment: string) => {
    if (!selected) return;
    await submitAction(selected.id, {
      action: RepairActionType.REJECT,
      comment: comment || null,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="gv-eyebrow">Logistics · Maintenance · Repairs</p>
        <h1 className="text-2xl font-bold mt-1">Awaiting Approval</h1>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <SearchInput value={search} onChange={setSearch} placeholder="Search by number plate…" />
      </div>

      <RepairApprovalsTable
        requests={requests}
        loading={loading}
        hasFilter={hasFilter}
        onRowClick={openDetail}
      />

      <RepairApprovalOverlay
        repair={selected}
        onClose={closeDetail}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </div>
  );
}