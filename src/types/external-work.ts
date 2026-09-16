export interface ExternalWorkApiResponse {
  id: number;
  status: string;
  driver_id: number;
  transport_id: number | null;
  pickup_location: string;
  destination: string;
  client_name: string | null;
  client_contact: string | null;
  description: string | null;
  amount_charged: number | null;
  notes: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
}
export interface CreateExternalWorkPayload {
  pickup_location: string;
  destination: string;
  transport_id?: number;
  client_name?: string;
  client_contact?: string;
  description?: string;
  amount_charged?: number;
  notes?: string;
}
type DescriptionTag =
  | { kind: 'motor_vehicle'; vehicle?: string; material: string; quantity: string }
  | { kind: 'heavy_machinery'; vehicle?: string; service: string };

function encodeDescription(tag: DescriptionTag): string {
  return JSON.stringify(tag);
}

function decodeDescription(raw: string | null): Partial<DescriptionTag> {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && 'kind' in parsed) return parsed;
  } catch {  }
  return {};
}

export const EXTERNAL_WORKS_SECTION_LIMIT = 5;

export interface MotorVehicleDelivery {
  id: number;
  transportId: number | null;
  vehicle: string;
  material: string;
  quantity: string;
  pickupPoint: string;
  destination: string;
  amount: string;
  clientName: string;
  clientPhone: string;
  status: string;
}

export interface HeavyMachineryService {
  id: number;
  transportId: number | null;
  vehicle: string;
  location: string;
  service: string;
  amount: string;
  clientName: string;
  clientPhone: string;
  status: string;
}
export interface AddMotorVehicleForm {
  transportId: string;
  material: string;
  quantity: string;
  pickupPoint: string;
  destination: string;
  amount: string;
  clientName: string;
  clientPhone: string;
}

export function emptyMotorVehicleForm(): AddMotorVehicleForm {
  return {
    transportId: '',
    material: '',
    quantity: '',
    pickupPoint: '',
    destination: '',
    amount: '',
    clientName: '',
    clientPhone: '',
  };
}

export interface AddHeavyMachineryForm {
  transportId: string;
  location: string;
  service: string;
  amount: string;
  clientName: string;
  clientPhone: string;
}

export function emptyHeavyMachineryForm(): AddHeavyMachineryForm {
  return {
    transportId: '',
    location: '',
    service: '',
    amount: '',
    clientName: '',
    clientPhone: '',
  };
}

function parseAmount(input: string): number | undefined {
  const cleaned = input.replace(/[^0-9.]/g, '');
  if (!cleaned) return undefined;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : undefined;
}

function formatAmount(n: number | null): string {
  if (n === null || n === undefined || Number.isNaN(n)) return '—';
  return `KES ${n.toLocaleString('en-KE', { minimumFractionDigits: 0 })}`;
}
export function toCreateMotorVehiclePayload(form: AddMotorVehicleForm): CreateExternalWorkPayload {
  return {
    pickup_location: form.pickupPoint.trim(),
    destination: form.destination.trim(),
    transport_id: form.transportId ? Number(form.transportId) : undefined,
    client_name: form.clientName.trim() || undefined,
    client_contact: form.clientPhone.trim() || undefined,
    description: encodeDescription({
      kind: 'motor_vehicle',
      material: form.material.trim(),
      quantity: form.quantity.trim(),
    }),
    amount_charged: parseAmount(form.amount),
  };
}

export function toCreateHeavyMachineryPayload(form: AddHeavyMachineryForm): CreateExternalWorkPayload {
  return {
    pickup_location: form.location.trim(),
    destination: '',
    transport_id: form.transportId ? Number(form.transportId) : undefined,
    client_name: form.clientName.trim() || undefined,
    client_contact: form.clientPhone.trim() || undefined,
    description: encodeDescription({
      kind: 'heavy_machinery',
      service: form.service.trim(),
    }),
    amount_charged: parseAmount(form.amount),
  };
}
export type VehicleLookup = Map<number, { name: string; numberPlate: string }>;
function resolveVehicleLabel(
  transportId: number | null,
  vehicleById: VehicleLookup | undefined,
  legacyVehicle?: string,
): string {
  const match = transportId != null ? vehicleById?.get(transportId) : undefined;
  return match?.name || match?.numberPlate || legacyVehicle || '—';
}

export function splitExternalWork(
  items: ExternalWorkApiResponse[],
  vehicleById?: VehicleLookup,
): {
  motorVehicles: MotorVehicleDelivery[];
  heavyMachinery: HeavyMachineryService[];
} {
  const motorVehicles: MotorVehicleDelivery[] = [];
  const heavyMachinery: HeavyMachineryService[] = [];

  for (const r of items) {
    const tag = decodeDescription(r.description);
    const isMotorVehicle = tag.kind ? tag.kind === 'motor_vehicle' : !!r.destination;

    if (isMotorVehicle) {
      motorVehicles.push({
        id: r.id,
        transportId: r.transport_id,
        vehicle: resolveVehicleLabel(r.transport_id, vehicleById, (tag as { vehicle?: string }).vehicle),
        material: (tag as { material?: string }).material || '—',
        quantity: (tag as { quantity?: string }).quantity || '—',
        pickupPoint: r.pickup_location || '—',
        destination: r.destination || '—',
        amount: formatAmount(r.amount_charged),
        clientName: r.client_name || '—',
        clientPhone: r.client_contact || '—',
        status: r.status,
      });
    } else {
      heavyMachinery.push({
        id: r.id,
        transportId: r.transport_id,
        vehicle: resolveVehicleLabel(r.transport_id, vehicleById, (tag as { vehicle?: string }).vehicle),
        location: r.pickup_location || '—',
        service: (tag as { service?: string }).service || r.description || '—',
        amount: formatAmount(r.amount_charged),
        clientName: r.client_name || '—',
        clientPhone: r.client_contact || '—',
        status: r.status,
      });
    }
  }

  return { motorVehicles, heavyMachinery };
}