import { DualRingGauge } from '@/components/shared/DualRingGauge';

export function ProjectCompletionGauge({ taskPct, timePct }: { taskPct: number; timePct: number }) {
  return (
    <DualRingGauge
      innerPct={taskPct}
      timePct={timePct}
      centerLabel="completion"
      title="Project Completion"
      legendTop={`Project completion (${taskPct}%)`}
      legendBottom={`% to deadline day (${timePct}%)`}
    />
  );
}