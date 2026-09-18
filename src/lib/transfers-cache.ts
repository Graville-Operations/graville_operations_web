import type { TransferRow } from '@/types/transfer';

const _rowsById: Record<number, TransferRow> = {};

export function setTransferRows(rows: TransferRow[]): void {
  rows.forEach((r) => { _rowsById[r.id] = r; });
}

export function patchTransferRow(id: number, patch: Partial<TransferRow>): void {
  const existing = _rowsById[id];
  if (existing) _rowsById[id] = { ...existing, ...patch };
}

export function getTransferRow(id: number): TransferRow | undefined {
  return _rowsById[id];
}

export function clearTransferRowCache(): void {
  Object.keys(_rowsById).forEach((key) => { delete _rowsById[Number(key)]; });
}