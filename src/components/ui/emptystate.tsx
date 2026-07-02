"use client";

import { Inbox, LucideIcon } from "lucide-react";
import { ReactNode } from "react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  children?: ReactNode;
}

export default function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center gap-4 px-6 text-center">
      <div
        className="flex items-center justify-center"
        style={{
          width: "4rem",
          height: "4rem",
          borderRadius: "9999px",
          background: "var(--gv-glass-bg)",
          border: "1px solid var(--gv-glass-border)",
        }}
      >
        <Icon size={28} strokeWidth={1.75} color="var(--gv-text-muted)" />
      </div>

      <h2 className="gv-title-sm">{title}</h2>
      <p className="gv-body-sm max-w-sm">{description}</p>

      {action && (
        <button type="button" onClick={action.onClick} className="gv-btn-brand mt-2">
          {action.label}
        </button>
      )}
    </div>
  );
}