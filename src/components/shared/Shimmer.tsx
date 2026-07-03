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