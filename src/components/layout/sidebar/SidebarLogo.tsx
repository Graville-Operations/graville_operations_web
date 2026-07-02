import Link from 'next/link';

export function SidebarLogo() {
  return (
    <div className="p-5 border-b border-white/10">
      <Link href="/home" className="flex items-center gap-3">
        <div className="w-9 h-9 bg-[#33907C] rounded-xl flex items-center justify-center shrink-0">
          <span className="text-white font-bold text-base">G</span>
        </div>
        <div>
          <p className="font-bold text-white text-sm">Graville Operations</p>
          <p className="text-xs text-white/40">Management System</p>
        </div>
      </Link>
    </div>
  );
}