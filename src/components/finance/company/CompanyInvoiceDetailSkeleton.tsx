'use client';

function Shimmer({ w, h }: { w: string; h: string }) {
  return <div className="rounded animate-pulse" style={{ width: w, height: h, background: 'rgba(255,255,255,0.07)' }} />;
}

export default function CompanyInvoiceDetailSkeleton() {
  return (
    <div className="space-y-6 w-full" style={{ maxWidth: '75vw', margin: '0 auto' }}>
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl animate-pulse" style={{ background: 'rgba(255,255,255,0.07)' }} />
        <div className="space-y-2"><Shimmer w="180px" h="20px" /><Shimmer w="120px" h="14px" /></div>
      </div>
      <div className="gv-card">
        <div className="grid grid-cols-4 gap-x-6 gap-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-2"><Shimmer w="60px" h="10px" /><Shimmer w="100px" h="14px" /></div>
          ))}
        </div>
      </div>
      <div className="gv-card p-0! overflow-hidden">
        <div className="px-5 py-3.5" style={{ borderBottom: '1px solid var(--gv-glass-border)' }}>
          <Shimmer w="80px" h="10px" />
        </div>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex gap-6 px-5 py-4" style={{ borderTop: '1px solid var(--gv-glass-border)' }}>
            <Shimmer w="20px" h="14px" /><Shimmer w="200px" h="14px" />
            <Shimmer w="40px" h="14px" /><Shimmer w="80px" h="14px" /><Shimmer w="80px" h="14px" />
          </div>
        ))}
      </div>
    </div>
  );
}