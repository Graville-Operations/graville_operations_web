import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hoverLift?: boolean;
}

export function GlassCard({ children, className, hoverLift = true }: GlassCardProps) {
  return (
    <div className={cn(
      "gv-card",                      
      hoverLift && "gv-card-hover",     
      className
    )}>
      {children}
    </div>
  );
}