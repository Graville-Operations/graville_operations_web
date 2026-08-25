'use client';

import { Package, Truck } from 'lucide-react';

interface DeliveryStatCardsProps {
  total: number;
  inTransit: number;
}

export default function DeliveryStatCards({ total, inTransit }: DeliveryStatCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="gv-card flex items-center gap-4">
        <div className="gv-icon-box"><Package size={18} className="text-[color:var(--primary)]" /></div>
        <div>
          <p className="gv-label">Total Deliveries</p>
          <p className="text-2xl font-bold tracking-tight text-[color:var(--foreground)]">{total}</p>
        </div>
      </div>
      <div className="gv-card flex items-center gap-4">
        <div className="gv-icon-box"><Truck size={18} className="text-[color:var(--gv-text-info)]" /></div>
        <div>
          <p className="gv-label">Deliveries in Transit</p>
          <p className="text-2xl font-bold tracking-tight text-[color:var(--gv-text-info)]">{inTransit}</p>
        </div>
      </div>
    </div>
  );
}