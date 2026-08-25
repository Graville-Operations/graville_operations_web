export enum DeliveryStatus {
  PENDING = 'PENDING',
  IN_TRANSIT = 'IN_TRANSIT',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

export const DELIVERY_STATUS_META: Record<DeliveryStatus, { label: string; bg: string; color: string }> = {
  [DeliveryStatus.PENDING]:    { label: 'Pending',    bg: 'rgba(251,191,36,0.15)',  color: '#fbbf24' },
  [DeliveryStatus.IN_TRANSIT]: { label: 'In Transit',  bg: 'rgba(96,165,250,0.15)', color: '#60a5fa' },
  [DeliveryStatus.DELIVERED]:  { label: 'Delivered',   bg: 'rgba(51,144,124,0.15)', color: '#33907c' },
  [DeliveryStatus.CANCELLED]:  { label: 'Cancelled',   bg: 'rgba(248,113,113,0.15)', color: '#f87171' },
};

export interface MaterialDelivery {
  id: number;
  material: string;
  quantity: string;
  pickupPoint: string;
  destination: string;
  status: DeliveryStatus;
  date: string;
  driver: string | null;
  purpose: string;
}

export interface InitiateDeliveryForm {
  destination: string;
  driver: string;
  purpose: string;
}

export const emptyInitiateDeliveryForm = (): InitiateDeliveryForm => ({
  driver: '',
  purpose: '',
  destination: '',
});

// --- DUMMY DATA ---
// This module has no backend yet. Everything below is a static, in-memory
// stand-in so the Internal Works (and later External Works) screens have
// something to render and interact with. Swap this out for a real
// `lib/api/material-delivery.ts` + mapper once the endpoints exist —
// nothing else on the page should need to change beyond the data source.

export function getDummyInternalDeliveries(): MaterialDelivery[] {
  return [
    {
      id: 1, material: 'Portland Cement (50kg bags)', quantity: '120 bags',
      pickupPoint: 'Central Store — Industrial Area', destination: 'Mishi Mboko Site',
      status: DeliveryStatus.IN_TRANSIT, date: '2026-08-18',
      driver: 'James Otieno', purpose: 'Foundation works — Block C',
    },
    {
      id: 2, material: 'Reinforcement Steel Bars (Y12)', quantity: '4.5 tonnes',
      pickupPoint: 'Central Store — Industrial Area', destination: 'Kware Primary Site',
      status: DeliveryStatus.DELIVERED, date: '2026-08-17',
      driver: 'Peter Mwangi', purpose: 'Column reinforcement, ground floor',
    },
    {
      id: 3, material: 'Building Sand', quantity: '18 tonnes',
      pickupPoint: 'Huruma Yard', destination: 'Huruma Site',
      status: DeliveryStatus.PENDING, date: '2026-08-19',
      driver: null, purpose: 'Plastering works',
    },
    {
      id: 4, material: 'Machine Cut Stones', quantity: '2,000 pieces',
      pickupPoint: 'Central Store — Industrial Area', destination: 'Mishi Mboko Site',
      status: DeliveryStatus.DELIVERED, date: '2026-08-15',
      driver: 'James Otieno', purpose: 'Perimeter wall',
    },
    {
      id: 5, material: 'Timber (2x4)', quantity: '300 pieces',
      pickupPoint: 'Central Store — Industrial Area', destination: 'Kware Primary Site',
      status: DeliveryStatus.CANCELLED, date: '2026-08-14',
      driver: null, purpose: 'Formwork — cancelled, site not ready',
    },
    {
      id: 6, material: 'Ballast', quantity: '12 tonnes',
      pickupPoint: 'Huruma Yard', destination: 'Huruma Site',
      status: DeliveryStatus.IN_TRANSIT, date: '2026-08-18',
      driver: 'Samuel Kiptoo', purpose: 'Concrete works — slab casting',
    },
    {
      id: 7, material: 'Roofing Sheets (Gauge 30)', quantity: '85 sheets',
      pickupPoint: 'Central Store — Industrial Area', destination: 'Mishi Mboko Site',
      status: DeliveryStatus.PENDING, date: '2026-08-20',
      driver: null, purpose: 'Roofing — main block',
    },
  ];
}