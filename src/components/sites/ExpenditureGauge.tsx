import { fmtKes } from '@/lib/utils/site-helpers';

export function ExpenditureGauge({
  totalExpenditure,
  estimatedValue,
  timePct,
}: {
  totalExpenditure: number;
  estimatedValue: number;
  timePct: number;
}) {
  const CX = 110, CY = 110, R_outer = 88, R_inner = 64, SW = 13;
  const outerCirc = 2 * Math.PI * R_outer;
  const innerCirc = 2 * Math.PI * R_inner;

  const expendPct = estimatedValue > 0
    ? Math.min(100, Math.round((totalExpenditure / estimatedValue) * 100))
    : 0;

  return (
    <div className="flex flex-col items-center w-full">
      <svg viewBox="0 0 220 220" style={{ width: '100%', maxWidth: 220, height: 'auto' }}>
        <circle cx={CX} cy={CY} r={R_outer} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={SW} />
        <circle cx={CX} cy={CY} r={R_outer} fill="none" stroke="#f97316" strokeWidth={SW}
          strokeDasharray={`${(timePct / 100) * outerCirc} ${outerCirc}`}
          strokeLinecap="round" transform={`rotate(-90 ${CX} ${CY})`} />
        <circle cx={CX} cy={CY} r={R_inner} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={SW} />
        <circle cx={CX} cy={CY} r={R_inner} fill="none" stroke="#3b82f6" strokeWidth={SW}
          strokeDasharray={`${(expendPct / 100) * innerCirc} ${innerCirc}`}
          strokeLinecap="round" transform={`rotate(-90 ${CX} ${CY})`} />
        <text x={CX} y={CY - 6}  textAnchor="middle" fontSize="26" fontWeight="700" fill="white">{expendPct}%</text>
        <text x={CX} y={CY + 16} textAnchor="middle" fontSize="13" fill="rgba(255,255,255,0.4)">spent</text>
      </svg>
      <div className="flex flex-col gap-1.5 mt-3 w-full">
        <span className="flex items-center gap-2 text-sm" style={{ color: 'var(--gv-text-subtle)' }}>
          <span className="w-3 h-3 rounded-full flex-shrink-0 bg-blue-500" />Expenditure ({fmtKes(totalExpenditure)})
        </span>
        <span className="flex items-center gap-2 text-sm" style={{ color: 'var(--gv-text-subtle)' }}>
          <span className="w-3 h-3 rounded-full flex-shrink-0 bg-orange-500" />% to deadline day ({timePct}%)
        </span>
      </div>
      <p className="text-base font-semibold text-white mt-3 text-center">Expenditure</p>
    </div>
  );
}