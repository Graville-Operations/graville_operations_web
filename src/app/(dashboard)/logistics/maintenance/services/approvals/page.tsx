'use client';

import { useServiceApprovals } from '@/hooks/logistics/useServiceApprovals';
import SearchInput from '@/components/finance/shared/SearchInput';
import ServiceApprovalsTable from '@/components/logistics/maintenance/ServiceApprovalsTable';
import ServiceApprovalOverlay from '@/components/logistics/maintenance/ServiceApprovalOverlay';
import { ServiceApprovalForm, ServiceRequestActionType } from '@/types/vehicle-service';

export default function ServiceApprovalsPage() {
  const {
    requests, loading, search, setSearch,
    selected, openDetail, closeDetail,
    submitAction, hasFilter,
  } = useServiceApprovals();

  const handleApprove = async (form: ServiceApprovalForm) => {
    if (!selected) return;
    await submitAction(selected.id, {
      action: ServiceRequestActionType.APPROVE,
      approved_service_type: form.approvedServiceType,
      approved_cost: Number(form.approvedCost),
      comment: form.comment || null,
    });
  };

  const handleReject = async (comment: string) => {
    if (!selected) return;
    await submitAction(selected.id, {
      action: ServiceRequestActionType.REJECT,
      comment: comment || null,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="gv-eyebrow">Logistics · Maintenance · Services</p>
        <h1 className="text-2xl font-bold mt-1">Awaiting Approval</h1>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <SearchInput value={search} onChange={setSearch} placeholder="Search by vehicle…" />
      </div>

      <ServiceApprovalsTable
        requests={requests}
        loading={loading}
        hasFilter={hasFilter}
        onRowClick={openDetail}
      />

      <ServiceApprovalOverlay
        service={selected}
        onClose={closeDetail}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </div>
  );
}