'use client';

import { useEffect, useState, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import { Bar, AttendanceTab } from '@/types/dashboard';

export function AttendanceBarChart({
  bars, loading, tab, activeBarIdx, onBarClick,
}: {
  bars: Bar[];
  loading: boolean;
  tab: AttendanceTab;
  activeBarIdx: number | null;
  onBarClick: (idx: number | null) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [W, setW] = useState(400);
  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver(entries => {
      const w = entries[0]?.contentRect.width;
      if (w && w > 0) setW(Math.floor(w));
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  const maxData = Math.max(...bars.map(b => b.present), 1);

  function niceMax(v: number) {
    if (v === 0) return 5;
    if (v <= 5)  return 5;
    if (v <= 10) return 10;
    if (v <= 15) return 15;
    if (v <= 20) return 20;
    return Math.ceil(v / 5) * 5;
  }
  const yMax = niceMax(maxData);

  function getYTicks(max: number): number[] {
    if (max <= 5) return [0, 1, 2, 3, 4, 5].filter(t => t <= max);
    const step = max <= 10 ? 2 : max <= 20 ? 4 : 5;
    const ticks: number[] = [];
    for (let t = 0; t <= max; t += step) ticks.push(t);
    if (ticks[ticks.length - 1] !== max) ticks.push(max);
    return ticks;
  }
  const yTicks = getYTicks(yMax);

  const H = 185;
  const PL = 22, PB = 28, PT = 12, PR = 0;
  const cW = W - PL - PR;
  const cH = H - PB - PT;
  const count   = Math.max(bars.length, 1);
  const isWeek  = tab === 'Week';
  const isMonth = tab === 'Month';
  const gap  = cW / count;
  const barW = Math.max(3, Math.floor(gap) - (count > 20 ? 1 : count > 7 ? 4 : 10));

  if (loading) {
    return (
      <div ref={containerRef} className="flex items-center justify-center" style={{ height: H, width: '100%' }}>
        <Loader2 className="w-5 h-5 animate-spin" style={{ color: 'var(--gv-brand)' }} />
      </div>
    );
  }

  return (
    <div ref={containerRef} style={{ width: '100%' }}>
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{ display: 'block', width: '100%' }}
        onClick={() => { if (activeBarIdx !== null) onBarClick(null); }}>
        {yTicks.map((tick) => {
          const y = PT + cH - (tick / yMax) * cH;
          return (
            <g key={tick}>
              <line x1={PL} x2={W - PR} y1={y} y2={y} stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
              <text x={2} y={y} textAnchor="start" dominantBaseline="central"
                fontSize="12" fontWeight="500" fill="rgba(255,255,255,0.45)" fontFamily="inherit">{tick}</text>
            </g>
          );
        })}
        {bars.map((b, i) => {
          const cx   = PL + i * gap + gap / 2;
          const x    = cx - barW / 2;
          const pH   = b.present > 0 ? (b.present / yMax) * cH : 0;
          const pY   = PT + cH - pH;
          const open = isWeek && activeBarIdx === i;
          return (
            <g key={i} style={{ cursor: isWeek ? 'pointer' : 'default' }}
              onClick={(e) => {
                if (!isWeek) return;
                e.stopPropagation();
                onBarClick(open ? null : i);
              }}>
              <rect x={x - 4} y={PT} width={barW + 8} height={cH} fill="transparent" />
              {open && <rect x={x - 4} y={PT} width={barW + 8} height={cH} fill="rgba(255,255,255,0.06)" rx="3" />}
              {b.present > 0 && <rect x={x} y={pY} width={barW} height={pH} rx="2" fill="#3b82f6" opacity={open ? 1 : 0.85} />}
              <text x={cx} y={H - 6} textAnchor="middle"
                fontSize={isMonth ? 12 : 15}
                fontWeight={open ? '700' : '400'}
                fill={open ? '#fff' : 'rgba(255,255,255,0.55)'}
                fontFamily="inherit">{b.label}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}