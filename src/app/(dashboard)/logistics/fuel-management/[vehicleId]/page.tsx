'use client';

import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Fuel, Calendar } from 'lucide-react';
import { Title, Label } from '@/components/ui/typography';
import { Bone, ShimmerStyle } from '@/components/shared/Shimmer';
import { useFuelVehicleDetail } from '@/hooks/logistics/useFuelVehicleDetail';
import { ROUTES } from '@/lib/routes';

function fmtKes(n: number): string {
  return n.toLocaleString('en-KE', { minimumFractionDigits: 0 });
}

function fmtDate(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' });
}

function DetailSkeleton() {
  return (
    <div className="w-full lg:w-[75%] max-w-5xl mx-auto space-y-6">
      <Bone w="6rem" h="1rem" />
      <div className="gv-card space-y-4 p-6">
        <Bone w="12rem" h="1.5rem" />
        <Bone w="8rem" h="1rem" />
      </div>
      <div className="gv-card space-y-3 p-6">
        <Bone w="100%" h="3rem" />
        <Bone w="100%" h="3rem" />
        <Bone w="100%" h="3rem" />
      </div>
    </div>
  );
}

export default function FuelVehicleDetailPage() {
  const params = useParams<{ vehicleId: string }>();
  const vehicleId = Number(params.vehicleId);
  const router = useRouter();

  const { vehicle, isLoading, loadError } = useFuelVehicleDetail(vehicleId);

  return (
    <div className="w-full lg:w-[75%] max-w-5xl mx-auto space-y-6">
      <ShimmerStyle />

      <button
        onClick={() => router.push(ROUTES.logistics.transport.fuelManagement)}
        className="flex items-center gap-2 text-sm"
        style={{ color: 'var(--gv-text-muted)' }}
      >
        <ArrowLeft size={15} /> Back to Fuel Management
      </button>

      {isLoading ? (
        <DetailSkeleton />
      ) : loadError || !vehicle ? (
        <div className="gv-card flex flex-col items-center justify-center py-16 text-center gap-2">
          <Fuel size={28} className="text-white/20" />
          <p className="text-sm" style={{ color: 'var(--gv-text-muted)' }}>{loadError ?? 'Vehicle not found.'}</p>
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="gv-icon-box"><Fuel size={18} className="text-[#33907c]" /></div>
              <div>
                <Label size="sm" as="p" className="gv-eyebrow mb-1">Logistics · Fuel Management</Label>
                <Title size="lg" as="h1">{vehicle.vehicle}</Title>
              </div>
            </div>
            <span
              className="gv-tag"
              style={{
                color: vehicle.fuelType === 'diesel' ? '#f59e0b' : '#33907c',
                background: vehicle.fuelType === 'diesel' ? 'rgba(245,158,11,0.12)' : 'rgba(51,144,124,0.15)',
                border: `1px solid ${vehicle.fuelType === 'diesel' ? 'rgba(245,158,11,0.3)' : 'rgba(51,144,124,0.35)'}`,
              }}
            >
              {vehicle.fuelType === 'diesel' ? 'Diesel' : 'Petrol'}
            </span>
          </div>

          {/* Total cost card */}
          <div className="gv-card flex items-center justify-between p-6">
            <div>
              <p className="text-xs mb-1" style={{ color: 'var(--gv-text-muted)' }}>Total Fuel Cost</p>
              <p className="text-2xl font-bold tracking-tight" style={{ color: 'var(--gv-text-primary)' }}>
                KES {fmtKes(vehicle.totalAmount)}
              </p>
            </div>
            <p className="text-xs" style={{ color: 'var(--gv-text-muted)' }}>
              {vehicle.logs.length} logged {vehicle.logs.length === 1 ? 'entry' : 'entries'}
            </p>
          </div>

          {/* Cost breakdown */}
          <div className="space-y-4">
            <Label size="sm" as="p" className="gv-eyebrow">Cost Breakdown</Label>

            <div className="gv-card overflow-x-auto p-0">
              {vehicle.logs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center gap-2">
                  <Calendar size={22} className="text-white/20" />
                  <p className="text-sm" style={{ color: 'var(--gv-text-muted)' }}>No fuel entries logged for this vehicle yet.</p>
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr style={{ background: 'rgba(51,144,124,0.08)', borderBottom: '1px solid var(--gv-glass-border)' }}>
                      {['Date', 'Purpose', 'Amount'].map((h) => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap" style={{ color: '#33907c' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {vehicle.logs.map((log, idx) => (
                      <tr key={log.id} style={{ borderBottom: idx < vehicle.logs.length - 1 ? '1px solid var(--gv-glass-border)' : 'none' }}>
                        <td className="px-4 py-3 text-sm whitespace-nowrap" style={{ color: 'var(--gv-text-primary)' }}>
                          <span className="flex items-center gap-1.5">
                            <Calendar size={12} className="text-white/30 shrink-0" /> {fmtDate(log.date)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm" style={{ color: 'var(--gv-text-muted)' }}>{log.purpose}</td>
                        <td className="px-4 py-3 text-sm font-semibold whitespace-nowrap" style={{ color: 'var(--gv-text-primary)' }}>
                          KES {fmtKes(log.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}