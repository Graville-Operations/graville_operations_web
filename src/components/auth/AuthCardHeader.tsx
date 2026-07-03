interface AuthCardHeaderProps {
  title: string;
  subtitle: string;
}

export function AuthCardHeader({ title, subtitle }: AuthCardHeaderProps) {
  return (
    <div className="text-center mb-8">
      <div className="w-16 h-16 bg-[#173990]/80 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/30">
        <span className="text-white text-2xl font-bold">G</span>
      </div>
      <h1 className="text-2xl font-bold text-white">{title}</h1>
      <p className="text-blue-200/70 mt-1">{subtitle}</p>
    </div>
  );
}