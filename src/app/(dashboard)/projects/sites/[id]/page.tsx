'use client';

import { useParams } from 'next/navigation';
import { SiteDetailView } from '@/components/sites/SiteDetailView';

export default function SiteDetailPage() {
  const params = useParams<{ id: string }>();
  const siteId = Number(params.id);

  return <SiteDetailView siteId={siteId} />;
}