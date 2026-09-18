import type { TransportBrief } from '@/types/transfer';

export function formatVehicleLabel(transport: TransportBrief | null | undefined): string {
  if (!transport) return '';
  const name = (transport.name ?? '').trim();
  const plate = (transport.numberPlate ?? '').trim();
  if (name && plate && name.toLowerCase() !== plate.toLowerCase()) {
    return `${name} · ${plate}`;
  }
  return name || plate;
}