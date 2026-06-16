'use client';

interface InvoiceDetailSkeletonProps {
  invoiceNo?:  string;
  clientName?: string;
}

const ShimmerStyle = () => (
  <style>{`
    @keyframes gv-shimmer {
      0%   { background-position: -600px 0; }
      100% { background-position:  600px 0; }
    }
    .gv-bone {
      background: linear-gradient(
        90deg,
        rgba(255,255,255,0.05) 25%,
        rgba(255,255,255,0.11) 50%,
        rgba(255,255,255,0.05) 75%
      );
      background-size: 600px 100%;
      animation: gv-shimmer 1.6s infinite linear;
      border-radius: 0.3rem;
      flex-shrink: 0;
    }
  `}</style>
);

const Bone = ({
  w = '100%',
  h = '0.85rem',
  style = {},
}: {
  w?: string;
  h?: string;
  style?: React.CSSProperties;
}) => <div className="gv-bone" style={{ width: w, height: h, ...style }} />;

export default function InvoiceDetailSkeleton({ invoiceNo, clientName }: InvoiceDetailSkeletonProps) {
  return (
    <>
      <ShimmerStyle />
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div
            className="gv-bone"
            style={{ width: '2.25rem', height: '2.25rem', borderRadius: '0.5rem' }}
          />

          <div className="space-y-2">
            {invoiceNo ? (
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold" style={{ color: 'var(--gv-text-primary)' }}>

                  Invoice {invoiceNo}
                </h2>
                <span
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    color:      'var(--gv-text-faint)',
                    border:     '1px solid rgba(255,255,255,0.09)',
                  }}
                >
                  Loading…
                </span>
              </div>
            ) : (
              <Bone w="13rem" h="1.4rem" />
            )}

            {clientName ? (
              <p className="text-sm" style={{ color: 'var(--gv-text-muted)' }}>
                Client: {clientName}
              </p>
            ) : (
              <Bone w="9rem" h="0.8rem" />
            )}
          </div>
        </div>
        <div className="gv-card grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { label: 'Invoice No.',  w: '7rem'  },
            { label: 'Client',       w: '9rem'  },
            { label: 'Invoice Date', w: '6.5rem'},
            { label: 'Total (KES)',  w: '5rem'  },
            { label: 'Created By',   w: '8rem'  },
            { label: 'Created At',   w: '7.5rem'},
          ].map(({ label, w }) => (
            <div key={label}>
              <p className="gv-eyebrow mb-1">{label}</p>
              <Bone w={w} h="0.875rem" />
            </div>
          ))}
        </div>

        {/* ── Line items card — mirrors: header + table thead + rows + tfoot ── */}
        <div className="gv-card" style={{ padding: 0, overflow: 'hidden' }}>

          {/* Card title row */}
          <div className="px-6 py-4" style={{ borderBottom: '1px solid var(--gv-glass-border)' }}>
            <p className="text-sm font-semibold" style={{ color: 'var(--gv-text-primary)' }}>
              Line Items
            </p>
          </div>
          <div
            style={{
              display:             'grid',
              gridTemplateColumns: '3rem 1fr 5rem 10rem 9rem',
              padding:             '0.75rem 1.5rem',
              background:          'rgba(255,255,255,0.04)',
              borderBottom:        '1px solid var(--gv-glass-border)',
              gap:                 '1.5rem',
            }}
          >
            {['#', 'Particulars', 'Qty', 'Unit Price (KES)', 'Total (KES)'].map((h) => (
              <span
                key={h}
                className="text-xs font-semibold uppercase tracking-wider"
                style={{ color: 'var(--gv-text-subtle)' }}
              >
                {h}
              </span>
            ))}
          </div>
          {[
            ['2rem', '75%', '2rem', '5rem', '4.5rem'],
            ['2rem', '55%', '2rem', '5rem', '4.5rem'],
            ['2rem', '65%', '2rem', '5rem', '4.5rem'],
            ['2rem', '80%', '2rem', '5rem', '4.5rem'],
          ].map((cols, i) => (
            <div
              key={i}
              style={{
                display:             'grid',
                gridTemplateColumns: '3rem 1fr 5rem 10rem 9rem',
                padding:             '1rem 1.5rem',
                borderTop:           '1px solid var(--gv-glass-border)',
                gap:                 '1.5rem',
                alignItems:          'center',
              }}
            >
              {cols.map((w, j) => (
                <Bone key={j} w={w} h="0.8rem" />
              ))}
            </div>
          ))}
          <div
            style={{
              display:             'grid',
              gridTemplateColumns: '3rem 1fr 5rem 10rem 9rem',
              padding:             '1rem 1.5rem',
              background:          'rgba(255,255,255,0.04)',
              borderTop:           '1px solid var(--gv-glass-border)',
              gap:                 '1.5rem',
              alignItems:          'center',
            }}
          >
            <div /><div /><div />
            <span
              className="text-sm font-semibold text-right"
              style={{ color: 'var(--gv-text-muted)' }}
            >
              Grand Total
            </span>
            <Bone w="5rem" h="0.875rem" />
          </div>
        </div>

      </div>
    </>
  );
}