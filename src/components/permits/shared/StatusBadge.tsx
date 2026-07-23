import { STATUS_STYLES } from "@/types/permits";

export function StatusBadge({ status }: { status: string }) {
  const st = STATUS_STYLES[status] ?? { bg: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)" };
  return (
    <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: st.bg, color: st.color }}>
      {status}
    </span>
  );
}