import { VehicleServiceType, VehicleServiceStatus } from './enums/vehicle-service';

export { VehicleServiceType, VehicleServiceStatus };

export const SERVICE_TYPE_LABELS: Record<VehicleServiceType, string> = {
  [VehicleServiceType.MAJOR]: 'Major',
  [VehicleServiceType.MINOR]: 'Minor',
  [VehicleServiceType.MEDIUM]: 'Medium',
};

export const SERVICE_STATUS_META: Record<VehicleServiceStatus, { label: string; bg: string; color: string }> = {
  [VehicleServiceStatus.AWAITING_APPROVAL]: { label: 'Awaiting Approval', bg: 'rgba(251,191,36,0.15)',  color: '#fbbf24' },
  [VehicleServiceStatus.APPROVED]:          { label: 'Approved',          bg: 'rgba(96,165,250,0.15)',  color: '#60a5fa' },
  [VehicleServiceStatus.REJECTED]:          { label: 'Rejected',          bg: 'rgba(248,113,113,0.15)', color: '#f87171' },
  [VehicleServiceStatus.AWAITING_SERVICE]:  { label: 'Awaiting Service',  bg: 'rgba(167,139,250,0.15)', color: '#a78bfa' },
  [VehicleServiceStatus.COMPLETED]:         { label: 'Completed',         bg: 'rgba(51,144,124,0.15)',  color: '#33907c' },
};

// Matches ServiceRequestResponse exactly.
export interface VehicleService {
  id: number;
  vehicle: string;
  number_plate: string;
  requested_service_type: VehicleServiceType;
  approved_service_type: VehicleServiceType | null;
  mileage: number;
  requested_cost: number;
  approved_cost: number | null;
  status: VehicleServiceStatus;
  date: string;
  comment: string | null;
}

// Matches ServiceRequestCreate exactly.
export interface CreateServiceRequestPayload {
  transport_id: number;
  requested_service_type: VehicleServiceType;
  mileage: number;
  requested_cost: number;
}

export interface ServiceRequestForm {
  transportId: string;
  requestedServiceType: VehicleServiceType;
  mileage: string;
  requestedCost: string;
}

export const emptyServiceRequestForm = (): ServiceRequestForm => ({
  transportId: '',
  requestedServiceType: VehicleServiceType.MINOR,
  mileage: '',
  requestedCost: '',
});