export enum TransferStatus {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
  IN_REVIEW = 'IN_REVIEW',
  APPROVED = 'APPROVED',
  IN_TRANSIT = 'IN_TRANSIT',
  REJECTED = 'REJECTED',
  RECEIVED = 'RECEIVED',
}

export enum TransferApprovalStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export const TRANSFER_STATUS_META: Record<TransferStatus, { label: string; bg: string; color: string }> = {
  [TransferStatus.DRAFT]:      { label: 'Draft',      bg: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)' },
  [TransferStatus.PENDING]:    { label: 'Pending',    bg: 'rgba(96,165,250,0.15)',  color: '#60a5fa' },
  [TransferStatus.IN_REVIEW]:  { label: 'In Review',  bg: 'rgba(251,191,36,0.15)',  color: '#fbbf24' },
  [TransferStatus.APPROVED]:   { label: 'Approved',   bg: 'rgba(51,144,124,0.15)',  color: '#33907c' },
  [TransferStatus.IN_TRANSIT]: { label: 'In Transit', bg: 'rgba(168,85,247,0.15)',  color: '#a855f7' },
  [TransferStatus.REJECTED]:   { label: 'Rejected',   bg: 'rgba(248,113,113,0.15)', color: '#f87171' },
  [TransferStatus.RECEIVED]:   { label: 'Received',   bg: 'rgba(34,197,94,0.15)',   color: '#22c55e' },
};

export const ACTIONABLE_STATUSES: TransferStatus[] = [
  TransferStatus.PENDING,
  TransferStatus.IN_REVIEW,
];

export interface TransferListItem {
  id: number;
  status: TransferStatus;
  currentStep: number;
  sourceSiteId: number;
  destinationSiteId: number;
  pickUpPoint: string;
  dropOffPoint: string;
  requestedBy: number | null;
  transportId: number | null;
  createdAt: string;
  updatedAt: string | null;
  materialItemCount: number;
  toolItemCount: number;
}

export interface TransferListItemDTO {
  id: number;
  status?: string;
  current_step?: number;
  source_site_id?: number;
  destination_site_id?: number;
  pick_up_point?: string;
  drop_off_point?: string;
  requested_by?: number | null;
  transport_id?: number | null;
  created_at?: string;
  updated_at?: string | null;
  material_item_count?: number;
  tool_item_count?: number;
}

export interface TransferApproval {
  id: number;
  transferId: number;
  approverId: number;
  stepOrder: number;
  status: TransferApprovalStatus;
  comment: string | null;
  actionedAt: string | null;
  createdAt: string;
}

export interface TransferApprovalDTO {
  id: number;
  transfer_id?: number;
  approver_id?: number;
  step_order?: number;
  status?: string;
  comment?: string | null;
  actioned_at?: string | null;
  created_at?: string;
}

export interface SiteBrief {
  id: number;
  name: string;
  location: string | null;
}

export interface SiteBriefDTO {
  id: number;
  name?: string;
  location?: string | null;
}

export interface TransportBrief {
  id: number;
  name: string;
  numberPlate: string;
  driverId: number | null;
}

export interface TransportBriefDTO {
  id: number;
  name?: string;
  number_plate?: string;
  driver_id?: number | null;
}

export interface TransferItem {
  id: number;
  materialId: number;
  materialName: string;
  quantity: number;
  releasedQuantity: number | null;
  receivedQuantity: number | null;
}

export interface TransferItemDTO {
  id: number;
  material_id?: number;
  material_name?: string;
  quantity?: number;
  released_quantity?: number | null;
  received_quantity?: number | null;
  created_at?: string;
}

export interface TransferToolItem {
  id: number;
  toolId: number;
  toolName: string;
  quantity: number;
  releasedQuantity: number | null;
  receivedQuantity: number | null;
}

export interface TransferToolItemDTO {
  id: number;
  tool_id?: number;
  tool_name?: string;
  quantity?: number;
  released_quantity?: number | null;
  received_quantity?: number | null;
  created_at?: string;
}

export interface TransferDetail {
  id: number;
  status: TransferStatus;
  currentStep: number;
  notes: string | null;
  companyId: number;
  sourceSiteId: number;
  destinationSiteId: number;
  pickUpPoint: SiteBrief | null;
  dropOffPoint: SiteBrief | null;
  requestedBy: number | null;
  transport: TransportBrief | null;
  receivedAt: string | null;
  receivedBy: number | null;
  releasedAt: string | null;
  releasedBy: number | null;
  createdAt: string;
  updatedAt: string | null;
  items: TransferItem[];
  toolItems: TransferToolItem[];
  approvals: TransferApproval[];
}

export interface TransferDetailDTO {
  id: number;
  status?: string;
  current_step?: number;
  notes?: string | null;
  company_id?: number;
  source_site_id?: number;
  destination_site_id?: number;
  pick_up_point?: SiteBriefDTO | null;
  drop_off_point?: SiteBriefDTO | null;
  requested_by?: number | null;
  transport?: TransportBriefDTO | null;
  received_at?: string | null;
  received_by?: number | null;
  released_at?: string | null;
  released_by?: number | null;
  created_at?: string;
  updated_at?: string | null;
  items?: TransferItemDTO[];
  tool_items?: TransferToolItemDTO[];
  approvals?: TransferApprovalDTO[];
}

export type TransferLineKind = 'MATERIAL' | 'TOOL';

export interface TransferLine {
  name: string;
  quantity: number;
  kind: TransferLineKind;
}

export interface TransferRow extends TransferListItem {
  canApprove: boolean;
  approvals: TransferApproval[];
  lineItems: TransferLine[];
  vehicleLabel: string;
}

export interface TransferActionPayload {
  status: TransferApprovalStatus.APPROVED | TransferApprovalStatus.REJECTED;
  comment?: string | null;
}