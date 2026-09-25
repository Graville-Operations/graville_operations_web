export type ExternalWorkType = 'vehicle' | 'heavy_machinery';

export type BillingMethod = 'per_trip' | 'hourly' | 'daily' | 'weekly' | 'monthly';

export const BILLING_METHOD_OPTIONS: { value: BillingMethod; label: string }[] = [
  { value: 'per_trip', label: 'Per Trip' },
  { value: 'hourly', label: 'Hourly' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
];

export const VEHICLE_BILLING_METHOD_OPTIONS: { value: BillingMethod; label: string }[] = [
  { value: 'per_trip', label: 'Per Trip' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
];

const BILLING_METHOD_LABELS: Record<BillingMethod, string> = {
  per_trip: 'Per Trip',
  hourly: 'Hourly',
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
};

const DURATION_UNIT_LABELS: Record<BillingMethod, string> = {
  per_trip: 'trip(s)',
  hourly: 'hr(s)',
  daily: 'day(s)',
  weekly: 'wk(s)',
  monthly: 'mo(s)',
};

export interface ExternalWorkMaterialResponse {
  id: number;
  material: { id: number; name: string; unit: { id: number; name: string; symbol: string } };
  quantity: number;
}

export interface ExternalWorkApiResponse {
  id: number;
  status: string;
  work_type: ExternalWorkType;
  driver_id: number;
  transport_id: number;
  number_plate: string | null;
  machine: string | null;
  pickup_location: string | null;
  destination: string | null;
  materials: ExternalWorkMaterialResponse[];
  location: string | null;
  service: string | null;
  billing_method: BillingMethod | null;
  duration: number | null;
  unit_amount: number | null;
  total_amount: number | null;
  client_name: string | null;
  client_contact: string | null;
  description: string | null;
  notes: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
}

export interface CreateExternalWorkMaterialItem {
  material_id: number;
  quantity: number;
}

export interface CreateExternalWorkPayload {
  transport_id: number;
  pickup_location?: string;
  destination?: string;
  materials?: CreateExternalWorkMaterialItem[];
  location?: string;
  service?: string;
  billing_method?: BillingMethod;
  duration?: number;
  unit_amount?: number;
  total_amount?: number;
  client_name?: string;
  client_contact?: string;
  description?: string;
  notes?: string;
}

export interface MaterialLine {
  name: string;
  quantity: string;
}

export interface MotorVehicleDelivery {
  id: number;
  transportId: number;
  numberPlate: string;
  materials: MaterialLine[];
  pickupPoint: string;
  destination: string;
  billingMethodLabel: string;
  duration: string;
  unitAmount: string;
  totalAmount: string;
  clientName: string;
  clientPhone: string;
  status: string;
}

export interface HeavyMachineryService {
  id: number;
  transportId: number;
  numberPlate: string;
  machine: string;
  location: string;
  service: string;
  billingMethodLabel: string;
  duration: string;
  unitAmount: string;
  totalAmount: string;
  clientName: string;
  clientPhone: string;
  status: string;
}

export interface MaterialFormRow {
  rowId: string;
  materialId: string;
  quantity: string;
}

export function emptyMaterialRow(): MaterialFormRow {
  return { rowId: crypto.randomUUID(), materialId: '', quantity: '' };
}

export interface AddMotorVehicleForm {
  transportId: string;
  materials: MaterialFormRow[];
  pickupPoint: string;
  destination: string;
  billingMethod: BillingMethod | '';
  duration: string;
  unitAmount: string;
  totalAmount: string;
  clientName: string;
  clientPhone: string;
}

export function emptyMotorVehicleForm(): AddMotorVehicleForm {
  return {
    transportId: '',
    materials: [emptyMaterialRow()],
    pickupPoint: '',
    destination: '',
    billingMethod: '',
    duration: '',
    unitAmount: '',
    totalAmount: '',
    clientName: '',
    clientPhone: '',
  };
}

export interface AddHeavyMachineryForm {
  transportId: string;
  location: string;
  service: string;
  billingMethod: BillingMethod | '';
  duration: string;
  unitAmount: string;
  totalAmount: string;
  clientName: string;
  clientPhone: string;
}

export function emptyHeavyMachineryForm(): AddHeavyMachineryForm {
  return {
    transportId: '',
    location: '',
    service: '',
    billingMethod: '',
    duration: '',
    unitAmount: '',
    totalAmount: '',
    clientName: '',
    clientPhone: '',
  };
}

export const EXTERNAL_WORKS_SECTION_LIMIT = 5;

function parseAmount(input: string): number | undefined {
  const cleaned = input.replace(/[^0-9.]/g, '');
  if (!cleaned) return undefined;
  const n = Number(cleaned);
  return Number.isFinite(n) && n > 0 ? n : undefined;
}

function formatAmount(n: number | null | undefined): string {
  if (n === null || n === undefined || Number.isNaN(n)) return '—';
  return `KES ${n.toLocaleString('en-KE', { minimumFractionDigits: 0 })}`;
}

export function toCreateMotorVehiclePayload(form: AddMotorVehicleForm): CreateExternalWorkPayload {
  const materials = form.materials
    .filter((row) => row.materialId && row.quantity)
    .map((row) => ({ material_id: Number(row.materialId), quantity: Number(row.quantity) }));

  return {
    transport_id: Number(form.transportId),
    pickup_location: form.pickupPoint.trim() || undefined,
    destination: form.destination.trim(),
    materials,
    billing_method: (form.billingMethod || undefined) as BillingMethod | undefined,
    duration: parseAmount(form.duration),
    unit_amount: parseAmount(form.unitAmount),
    total_amount: form.totalAmount.trim() ? parseAmount(form.totalAmount) : undefined,
    client_name: form.clientName.trim() || undefined,
    client_contact: form.clientPhone.trim() || undefined,
  };
}

export function toCreateHeavyMachineryPayload(form: AddHeavyMachineryForm): CreateExternalWorkPayload {
  return {
    transport_id: Number(form.transportId),
    location: form.location.trim(),
    service: form.service.trim(),
    billing_method: (form.billingMethod || undefined) as BillingMethod | undefined,
    duration: parseAmount(form.duration),
    unit_amount: parseAmount(form.unitAmount),
    total_amount: form.totalAmount.trim() ? parseAmount(form.totalAmount) : undefined,
    client_name: form.clientName.trim(),
    client_contact: form.clientPhone.trim(),
  };
}

export function toMotorVehicleDelivery(r: ExternalWorkApiResponse): MotorVehicleDelivery {
  const materials: MaterialLine[] = r.materials.length
    ? r.materials.map((m) => ({ name: m.material.name, quantity: `${m.quantity} ${m.material.unit.name}` }))
    : [{ name: '—', quantity: '—' }];

  const unitLabel = r.billing_method ? DURATION_UNIT_LABELS[r.billing_method] : '';

  return {
    id: r.id,
    transportId: r.transport_id,
    numberPlate: r.number_plate || '—',
    materials,
    pickupPoint: r.pickup_location || '—',
    destination: r.destination || '—',
    billingMethodLabel: r.billing_method ? BILLING_METHOD_LABELS[r.billing_method] : '—',
    duration: r.duration !== null && r.duration !== undefined ? `${r.duration} ${unitLabel}` : '—',
    unitAmount: formatAmount(r.unit_amount),
    totalAmount: formatAmount(r.total_amount),
    clientName: r.client_name || '—',
    clientPhone: r.client_contact || '—',
    status: r.status,
  };
}

export function toHeavyMachineryService(r: ExternalWorkApiResponse): HeavyMachineryService {
  const unitLabel = r.billing_method ? DURATION_UNIT_LABELS[r.billing_method] : '';
  return {
    id: r.id,
    transportId: r.transport_id,
    numberPlate: r.number_plate || '—',
    machine: r.machine || '—',
    location: r.location || '—',
    service: r.service || '—',
    billingMethodLabel: r.billing_method ? BILLING_METHOD_LABELS[r.billing_method] : '—',
    duration: r.duration !== null && r.duration !== undefined ? `${r.duration} ${unitLabel}` : '—',
    unitAmount: formatAmount(r.unit_amount),
    totalAmount: formatAmount(r.total_amount),
    clientName: r.client_name || '—',
    clientPhone: r.client_contact || '—',
    status: r.status,
  };
}

export function splitExternalWork(items: ExternalWorkApiResponse[]): {
  motorVehicles: MotorVehicleDelivery[];
  heavyMachinery: HeavyMachineryService[];
} {
  const motorVehicles: MotorVehicleDelivery[] = [];
  const heavyMachinery: HeavyMachineryService[] = [];

  for (const r of items) {
    if (r.work_type === 'heavy_machinery') {
      heavyMachinery.push(toHeavyMachineryService(r));
    } else {
      motorVehicles.push(toMotorVehicleDelivery(r));
    }
  }

  return { motorVehicles, heavyMachinery };
}