export const ShimmerStyle = () => (
  <style>{`
    @keyframes gv-shimmer {
      0%   { background-position: -600px 0; }
      100% { background-position:  600px 0; }
    }
    .gv-bone {
      background: linear-gradient(
        90deg,
        rgba(255,255,255,0.05) 25%,
        rgba(255,255,255,0.12) 50%,
        rgba(255,255,255,0.05) 75%
      );
      background-size: 600px 100%;
      animation: gv-shimmer 1.6s infinite linear;
      border-radius: 0.375rem;
    }
  `}</style>
);

export const Bone = ({ w = '100%', h = '0.85rem', style = {} }: {
  w?: string; h?: string; style?: React.CSSProperties;
}) => (
  <div className="gv-bone" style={{ width: w, height: h, flexShrink: 0, ...style }} />
);
export const PulseBox = ({ w, h }: { w: string; h: string }) => (
  <div className="rounded animate-pulse" style={{ width: w, height: h, background: 'rgba(255,255,255,0.07)' }} />
);
export const PulseLine = ({ w, h }: { w: string; h: string }) => (
  <div className="rounded animate-pulse bg-white/10" style={{ width: w, height: h }} />
);

export const InvoiceCardSkeleton = () => (
  <div className="gv-card space-y-3" style={{ padding: '14px 16px' }}>
    <div className="flex justify-between">
      <PulseBox w="6rem" h="0.875rem" />
      <PulseBox w="4rem" h="0.875rem" />
    </div>
    <PulseBox w="8rem" h="0.75rem" />
    <PulseBox w="5rem" h="0.75rem" />
  </div>
);
export const ShimmerBar = ({
  w = 'w-[80%]',
  h = 'h-4',
  delayMs = 0,
}: {
  w?: string;
  h?: string;
  delayMs?: number;
}) => (
  <div className={`relative overflow-hidden ${h} bg-muted rounded ${w}`}>
    <div
      className="absolute inset-0 -translate-x-full animate-[shimmer_1.4s_infinite]
                 bg-linear-to-r from-transparent via-white/5 to-transparent"
      style={delayMs ? { animationDelay: `${delayMs}ms` } : undefined}
    />
  </div>
);