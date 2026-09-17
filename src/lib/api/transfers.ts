import api from '@/lib/api';
import { API } from '@/lib/endpoints';
import { unwrapArray, unwrapObject } from '@/lib/api-response';
import {
  normaliseTransferListItems,
  normaliseTransferDetail,
} from '@/lib/mappers/transfer-mappers';
import type {
  TransferListItem,
  TransferListItemDTO,
  TransferDetail,
  TransferDetailDTO,
  TransferStatus,
  TransferActionPayload,
} from '@/types/transfer';

interface FetchTransfersParams {
  siteId?: number;
  status?: TransferStatus;
  skip?: number;
  limit?: number;
}

export async function fetchTransfers(
  { siteId, status, skip = 0, limit = 100 }: FetchTransfersParams = {},
): Promise<{ items: TransferListItem[]; total: number }> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const params: Record<string, any> = { skip, limit };
  if (siteId) params.site_id = siteId;
  if (status) params.status = status;

  const { data } = await api.get(API.transfers.all, { params });
  const items = normaliseTransferListItems(unwrapArray<TransferListItemDTO>(data));
  const inner = unwrapObject<{ total?: number }>(data);
  return { items, total: inner?.total ?? items.length };
}

export async function fetchTransferDetail(id: number): Promise<TransferDetail> {
  const { data } = await api.get(API.transfers.details(id));
  return normaliseTransferDetail(unwrapObject<TransferDetailDTO>(data));
}

export async function actionTransfer(
  id: number,
  payload: TransferActionPayload,
): Promise<TransferDetail> {
  const { data } = await api.post(API.transfers.action(id), payload);
  return normaliseTransferDetail(unwrapObject<TransferDetailDTO>(data));
}

export async function submitTransfer(id: number): Promise<TransferDetail> {
  const { data } = await api.post(API.transfers.submit(id), {});
  return normaliseTransferDetail(unwrapObject<TransferDetailDTO>(data));
}