import { DriverTaskType, DriverTaskStatus } from './enums/driver-task';

export { DriverTaskType, DriverTaskStatus };

export interface DriverTaskItem {
  id: number;
  material_id: number;
  material_name: string;
  planned_quantity: number | null;
  actual_quantity: number | null;
  unit_price: number | null;
}

export interface DriverTaskToolItem {
  id: number;
  tool_id: number;
  tool_name: string;
  planned_quantity: number | null;
  actual_quantity: number | null;
  unit_price: number | null;
}

export interface TransferBrief {
  id: number;
  status: string;
  current_step: number;
  source_site_id: number;
  destination_site_id: number;
  pick_up_point: string;
  drop_off_point: string;
  requested_by: number;
  transport_id: number | null;
  created_at: string;
  updated_at: string;
  material_item_count: number;
  tool_item_count: number;
}

export interface DriverTask {
  id: number;
  task_type: DriverTaskType;
  status: DriverTaskStatus;
  title: string | null;
  driver_id: number;
  transport_id: number | null;
  destination_site_id: number | null;
  material_transfer_id: number | null;
  supplier_name: string | null;
  pickup_location: string | null;
  invoice_number: string | null;
  notes: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string | null;
  items: DriverTaskItem[];
  tool_items: DriverTaskToolItem[];
  transfer: TransferBrief | null;
}

export interface PlannedItemInput {
  material_id: number;
  planned_quantity: number;
}

export interface PlannedToolItemInput {
  tool_id: number;
  planned_quantity: number;
}

export interface CreateDriverTaskPayload {
  task_type: DriverTaskType;
  transport_id?: number | null;
  notes?: string | null;
  title?: string | null;
  destination_site_id?: number | null;
  items?: PlannedItemInput[];
  tool_items?: PlannedToolItemInput[];
  material_transfer_id?: number | null;
}

export interface DriverTaskItemFormRow {
  materialId: string;
  quantity: string;
}

export interface DriverTaskToolFormRow {
  toolId: string;
  quantity: string;
}

export interface InitiateDeliveryForm {
  taskType: DriverTaskType;
  transportId: string;
  siteId: string;
  title: string;
  notes: string;
  materialTransferId: string;
  items: DriverTaskItemFormRow[];
  toolItems: DriverTaskToolFormRow[];
}

export const emptyInitiateDeliveryForm = (): InitiateDeliveryForm => ({
  taskType: DriverTaskType.TRANSFER,
  transportId: '',
  siteId: '',
  title: '',
  notes: '',
  materialTransferId: '',
  items: [{ materialId: '', quantity: '' }],
  toolItems: [{ toolId: '', quantity: '' }],
});

export const DRIVER_TASK_TYPE_LABELS: Record<DriverTaskType, string> = {
  [DriverTaskType.SUPPLIER_PICKUP]: 'Supplier Pickup',
  [DriverTaskType.TRANSFER]: 'Transfer',
};

export const DRIVER_TASK_STATUS_META: Record<DriverTaskStatus, { label: string; bg: string; color: string }> = {
  [DriverTaskStatus.PENDING_ASSIGNMENT]: { label: 'Pending Assignment', bg: 'rgba(251,191,36,0.15)',  color: '#fbbf24' },
  [DriverTaskStatus.ASSIGNED]:           { label: 'Assigned',           bg: 'rgba(96,165,250,0.15)',  color: '#60a5fa' },
  [DriverTaskStatus.IN_PROGRESS]:        { label: 'In Progress',        bg: 'rgba(167,139,250,0.15)', color: '#a78bfa' },
  [DriverTaskStatus.COMPLETED]:          { label: 'Completed',          bg: 'rgba(51,144,124,0.15)',  color: '#33907c' },
  [DriverTaskStatus.CANCELLED]:          { label: 'Cancelled',          bg: 'rgba(248,113,113,0.15)', color: '#f87171' },
};