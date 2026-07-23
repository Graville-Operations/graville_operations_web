'use client';

export function DarkSelect(props: React.SelectHTMLAttributes<HTMLSelectElement> & { children: React.ReactNode }) {
  const selectCls = 'w-full appearance-none px-3 py-2 pr-9 rounded-lg text-sm bg-[color:var(--gv-glass-bg)] border border-[color:var(--border)] text-[color:var(--foreground)] cursor-pointer outline-none transition-colors focus:border-[color:var(--primary)] focus:ring-1 focus:ring-[color:var(--primary)] hover:border-[color:var(--gv-glass-border)] [&>option]:bg-[#0d1528] [&>option]:text-white';
  return (
    <div className="relative">
      <select {...props} className={selectCls}>{props.children}</select>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="absolute right-3 top-1/2 -translate-y-1/2 text-[color:var(--gv-text-subtle)] pointer-events-none">
        <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}