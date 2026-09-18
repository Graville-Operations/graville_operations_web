import { VehicleRepairStatus, RepairActionType } from './enums/vehicle-repair';

export { VehicleRepairStatus, RepairActionType };

export interface VehicleRepair {
  id: number;
  vehicle: string;
  number_plate: string;
  issue: string;
  requested_cost: number;
  approved_cost: number | null;
  status: VehicleRepairStatus;
  date: string;
  comment: string | null;
}

export interface CreateRepairPayload {
  transport_id: number;
  issue: string;
  requested_cost: number;
}

export interface RepairActionPayload {
  action: RepairActionType;
  approved_cost?: number | null;
  comment?: string | null;
}

export interface RepairCompletePayload {
  comment?: string | null;
}

export interface RepairApprovalForm {
  approvedCost: string;
  comment: string;
}

export const emptyRepairApprovalForm = (): RepairApprovalForm => ({
  approvedCost: '',
  comment: '',
});

export const REPAIR_STATUS_META: Record<VehicleRepairStatus, { label: string; bg: string; color: string }> = {
  [VehicleRepairStatus.AWAITING_APPROVAL]: { label: 'Awaiting Approval', bg: 'rgba(251,191,36,0.15)',  color: '#fbbf24' },
  [VehicleRepairStatus.APPROVED]:          { label: 'Approved',          bg: 'rgba(96,165,250,0.15)',  color: '#60a5fa' },
  [VehicleRepairStatus.REJECTED]:          { label: 'Rejected',          bg: 'rgba(248,113,113,0.15)', color: '#f87171' },
  [VehicleRepairStatus.AWAITING_REPAIR]:   { label: 'Awaiting Repair',   bg: 'rgba(167,139,250,0.15)', color: '#a78bfa' },
  [VehicleRepairStatus.COMPLETED]:         { label: 'Completed',         bg: 'rgba(51,144,124,0.15)',  color: '#33907c' },
};