import {
  TransferStatus,
  TransferApprovalStatus,
  TransferListItem,
  TransferListItemDTO,
  TransferApproval,
  TransferApprovalDTO,
  TransferDetail,
  TransferDetailDTO,
  TransferItem,
  TransferItemDTO,
  TransferToolItem,
  TransferToolItemDTO,
  SiteBrief,
  SiteBriefDTO,
  TransportBrief,
  TransportBriefDTO,
} from '@/types/transfer';

function toTransferStatus(status: string | undefined): TransferStatus {
  const upper = (status ?? '').toUpperCase();
  return (Object.values(TransferStatus) as string[]).includes(upper)
    ? (upper as TransferStatus)
    : TransferStatus.DRAFT;
}

function toApprovalStatus(status: string | undefined): TransferApprovalStatus {
  const upper = (status ?? '').toUpperCase();
  return (Object.values(TransferApprovalStatus) as string[]).includes(upper)
    ? (upper as TransferApprovalStatus)
    : TransferApprovalStatus.PENDING;
}

export function normaliseTransferListItem(dto: TransferListItemDTO): TransferListItem {
  return {
    id: dto.id,
    status: toTransferStatus(dto.status),
    currentStep: dto.current_step ?? 1,
    sourceSiteId: dto.source_site_id ?? 0,
    destinationSiteId: dto.destination_site_id ?? 0,
    pickUpPoint: dto.pick_up_point ?? '',
    dropOffPoint: dto.drop_off_point ?? '',
    requestedBy: dto.requested_by ?? null,
    transportId: dto.transport_id ?? null,
    createdAt: dto.created_at ?? '',
    updatedAt: dto.updated_at ?? null,
    materialItemCount: dto.material_item_count ?? 0,
    toolItemCount: dto.tool_item_count ?? 0,
  };
}

export function normaliseTransferListItems(dtos: TransferListItemDTO[]): TransferListItem[] {
  return dtos.map(normaliseTransferListItem);
}

export function normaliseTransferApproval(dto: TransferApprovalDTO): TransferApproval {
  return {
    id: dto.id,
    transferId: dto.transfer_id ?? 0,
    approverId: dto.approver_id ?? 0,
    stepOrder: dto.step_order ?? 0,
    status: toApprovalStatus(dto.status),
    comment: dto.comment ?? null,
    actionedAt: dto.actioned_at ?? null,
    createdAt: dto.created_at ?? '',
  };
}

function normaliseSiteBrief(dto: SiteBriefDTO | null | undefined): SiteBrief | null {
  if (!dto) return null;
  return { id: dto.id, name: dto.name ?? '', location: dto.location ?? null };
}

function normaliseTransportBrief(dto: TransportBriefDTO | null | undefined): TransportBrief | null {
  if (!dto) return null;
  return {
    id: dto.id,
    name: dto.name ?? '',
    numberPlate: dto.number_plate ?? '',
    driverId: dto.driver_id ?? null,
  };
}

function normaliseTransferItem(dto: TransferItemDTO): TransferItem {
  return {
    id: dto.id,
    materialId: dto.material_id ?? 0,
    materialName: dto.material_name ?? '',
    quantity: dto.quantity ?? 0,
    releasedQuantity: dto.released_quantity ?? null,
    receivedQuantity: dto.received_quantity ?? null,
  };
}

function normaliseTransferToolItem(dto: TransferToolItemDTO): TransferToolItem {
  return {
    id: dto.id,
    toolId: dto.tool_id ?? 0,
    toolName: dto.tool_name ?? '',
    quantity: dto.quantity ?? 0,
    releasedQuantity: dto.released_quantity ?? null,
    receivedQuantity: dto.received_quantity ?? null,
  };
}

export function normaliseTransferDetail(dto: TransferDetailDTO): TransferDetail {
  return {
    id: dto.id,
    status: toTransferStatus(dto.status),
    currentStep: dto.current_step ?? 1,
    notes: dto.notes ?? null,
    companyId: dto.company_id ?? 0,
    sourceSiteId: dto.source_site_id ?? 0,
    destinationSiteId: dto.destination_site_id ?? 0,
    pickUpPoint: normaliseSiteBrief(dto.pick_up_point),
    dropOffPoint: normaliseSiteBrief(dto.drop_off_point),
    requestedBy: dto.requested_by ?? null,
    transport: normaliseTransportBrief(dto.transport),
    receivedAt: dto.received_at ?? null,
    receivedBy: dto.received_by ?? null,
    releasedAt: dto.released_at ?? null,
    releasedBy: dto.released_by ?? null,
    createdAt: dto.created_at ?? '',
    updatedAt: dto.updated_at ?? null,
    items: (dto.items ?? []).map(normaliseTransferItem),
    toolItems: (dto.tool_items ?? []).map(normaliseTransferToolItem),
    approvals: (dto.approvals ?? []).map(normaliseTransferApproval),
  };
}