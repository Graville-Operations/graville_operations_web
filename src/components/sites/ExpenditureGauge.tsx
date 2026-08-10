import { fmtKes } from '@/lib/utils/site-helpers';
import { DualRingGauge } from '@/components/shared/DualRingGauge';

export function ExpenditureGauge({
  totalExpenditure,
  estimatedValue,
  timePct,
}: {
  totalExpenditure: number;
  estimatedValue: number;
  timePct: number;
}) {
  const expendPct = estimatedValue > 0
    ? Math.min(100, Math.round((totalExpenditure / estimatedValue) * 100))
    : 0;

  return (
    <DualRingGauge
      innerPct={expendPct}
      timePct={timePct}
      centerLabel="spent"
      title="Expenditure"
      legendTop={`Expenditure (${fmtKes(totalExpenditure)})`}
      legendBottom={`% to deadline day (${timePct}%)`}
    />
  );
}