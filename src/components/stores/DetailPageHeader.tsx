import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';

interface DetailPageHeaderProps {
  icon: React.ReactNode;
  title: string;
  siteName: string;
}

export function DetailPageHeader({ icon, title, siteName }: DetailPageHeaderProps) {
  const router = useRouter();
  return (
    <div className="flex items-center gap-3">
      <button
        onClick={() => router.back()}
        className="w-8 h-8 rounded-lg flex items-center justify-center
                   hover:bg-accent transition-colors shrink-0"
      >
        <ChevronLeft size={18} className="text-muted-foreground" />
      </button>
      <div className="gv-icon-box shrink-0">{icon}</div>
      <h1 className="text-xl font-bold leading-none">{title}</h1>
      <span className="text-sm text-muted-foreground leading-none">· {siteName}</span>
    </div>
  );
}