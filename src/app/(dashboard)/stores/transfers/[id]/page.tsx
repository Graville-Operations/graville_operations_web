'use client';

import { useParams } from 'next/navigation';
import { TransferDetailView } from '@/components/stores/transfers/TransferDetailView';

export default function TransferDetailPage() {
  const params = useParams<{ id: string }>();
  const transferId = Number(params.id);

  return <TransferDetailView transferId={transferId} />;
}