// src/types/vehicle-service.ts

import { VehicleServiceType, VehicleServiceStatus } from './enums/vehicle-service';

export { VehicleServiceType, VehicleServiceStatus };

export enum ServiceRequestActionType {
  APPROVE = 'APPROVE',
  REJECT = 'REJECT',
}

// Matches ServiceRequestResponse exactly (src/logistics/dto/response/service_request_response.py).
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

// Matches ServiceRequestAction exactly.
export interface ServiceRequestActionPayload {
  action: ServiceRequestActionType;
  approved_service_type?: VehicleServiceType | null;
  approved_cost?: number | null;
  comment?: string | null;
}

// Matches ServiceRequestComplete exactly.
export interface ServiceRequestCompletePayload {
  comment?: string | null;
}

export interface ServiceApprovalForm {
  approvedServiceType: VehicleServiceType;
  approvedCost: string;
  comment: string;
}

export const emptyServiceApprovalForm = (): ServiceApprovalForm => ({
  approvedServiceType: VehicleServiceType.MINOR,
  approvedCost: '',
  comment: '',
});

export interface ServiceRequestForm {
  transportId: string;
  requestedServiceType: VehicleServiceType | '';
  mileage: string;
  requestedCost: string;
}

export const emptyServiceRequestForm = (): ServiceRequestForm => ({
  transportId: '',
  requestedServiceType: '',
  mileage: '',
  requestedCost: '',
});

export const SERVICE_TYPE_LABELS: Record<VehicleServiceType, string> = {
  [VehicleServiceType.MAJOR]: 'Major Service',
  [VehicleServiceType.MEDIUM]: 'Medium Service',
  [VehicleServiceType.MINOR]: 'Minor Service',
};

export const SERVICE_STATUS_META: Record<VehicleServiceStatus, { label: string; bg: string; color: string }> = {
  [VehicleServiceStatus.AWAITING_APPROVAL]: { label: 'Awaiting Approval', bg: 'rgba(251,191,36,0.15)',  color: '#fbbf24' },
  [VehicleServiceStatus.APPROVED]:          { label: 'Approved',          bg: 'rgba(96,165,250,0.15)',  color: '#60a5fa' },
  [VehicleServiceStatus.REJECTED]:          { label: 'Rejected',          bg: 'rgba(248,113,113,0.15)', color: '#f87171' },
  [VehicleServiceStatus.AWAITING_SERVICE]:  { label: 'Awaiting Service',  bg: 'rgba(167,139,250,0.15)', color: '#a78bfa' },
  [VehicleServiceStatus.COMPLETED]:         { label: 'Completed',         bg: 'rgba(51,144,124,0.15)',  color: '#33907c' },
};