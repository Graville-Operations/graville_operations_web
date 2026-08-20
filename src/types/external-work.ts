export interface MotorVehicleDelivery {
  id: number;
  vehicle: string;
  material: string;
  quantity: string;
  pickupPoint: string;
  destination: string;
  amount: string;
  clientName: string;
  clientPhone: string;
}

export interface HeavyMachineryService {
  id: number;
  vehicle: string;
  location: string;
  service: string;
  amount: string;
  clientName: string;
  clientPhone: string;
}

export interface AddMotorVehicleForm {
  vehicle: string;
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
    vehicle: '',
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
  vehicle: string;
  location: string;
  service: string;
  amount: string;
  clientName: string;
  clientPhone: string;
}

export function emptyHeavyMachineryForm(): AddHeavyMachineryForm {
  return {
    vehicle: '',
    location: '',
    service: '',
    amount: '',
    clientName: '',
    clientPhone: '',
  };
}

export const EXTERNAL_WORKS_SECTION_LIMIT = 5;

// --- DUMMY DATA ---
// No backend yet — static in-memory data, same pattern as the Internal
// Works dummy data. Swap for real fetches once the endpoints exist.

export function getDummyMotorVehicleDeliveries(): MotorVehicleDelivery[] {
  return [
    {
      id: 1, vehicle: 'Tipper Truck — KDB 221A', material: 'Building Sand', quantity: '20 tonnes',
      pickupPoint: 'Machakos Quarry', destination: 'Athi River Site',
      amount: 'KES 45,000', clientName: 'Grace Wambui', clientPhone: '0712 345 678',
    },
    {
      id: 2, vehicle: 'Lowbed Trailer — KCF 118B', material: 'Precast Culverts', quantity: '12 pieces',
      pickupPoint: 'Nairobi Yard', destination: 'Kitengela Site',
      amount: 'KES 78,500', clientName: 'Daniel Mutiso', clientPhone: '0722 890 112',
    },
    {
      id: 3, vehicle: 'Flatbed Truck — KDG 402C', material: 'Steel Beams', quantity: '6 tonnes',
      pickupPoint: 'Mombasa Road Store', destination: 'Ruiru Site',
      amount: 'KES 63,200', clientName: 'Alice Njeri', clientPhone: '0700 456 789',
    },
    {
      id: 4, vehicle: 'Tipper Truck — KDB 221A', material: 'Ballast', quantity: '15 tonnes',
      pickupPoint: 'Machakos Quarry', destination: 'Kware Primary Site',
      amount: 'KES 38,000', clientName: 'Brian Otieno', clientPhone: '0733 221 004',
    },
    {
      id: 5, vehicle: 'Water Bowser — KCE 774D', material: 'Water', quantity: '10,000 litres',
      pickupPoint: 'Huruma Borehole', destination: 'Mishi Mboko Site',
      amount: 'KES 15,000', clientName: 'Faith Chebet', clientPhone: '0745 998 331',
    },
  ];
}

export function getDummyHeavyMachineryServices(): HeavyMachineryService[] {
  return [
    {
      id: 1, vehicle: 'Excavator — CAT 320', location: 'Athi River Site',
      service: 'Foundation excavation', amount: 'KES 120,000',
      clientName: 'Grace Wambui', clientPhone: '0712 345 678',
    },
    {
      id: 2, vehicle: 'Bulldozer — Komatsu D65', location: 'Kitengela Site',
      service: 'Site levelling', amount: 'KES 95,000',
      clientName: 'Daniel Mutiso', clientPhone: '0722 890 112',
    },
    {
      id: 3, vehicle: 'Backhoe Loader — JCB 3CX', location: 'Ruiru Site',
      service: 'Trenching for drainage', amount: 'KES 54,000',
      clientName: 'Alice Njeri', clientPhone: '0700 456 789',
    },
    {
      id: 4, vehicle: 'Crane — Tadano 25T', location: 'Kware Primary Site',
      service: 'Steel beam lifting', amount: 'KES 150,000',
      clientName: 'Brian Otieno', clientPhone: '0733 221 004',
    },
    {
      id: 5, vehicle: 'Roller Compactor — Bomag', location: 'Mishi Mboko Site',
      service: 'Access road compaction', amount: 'KES 42,500',
      clientName: 'Faith Chebet', clientPhone: '0745 998 331',
    },
  ];
}