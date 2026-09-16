"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Check } from "lucide-react";
import { ApiUser } from "@/types/users";
import { SelectedApprover } from "@/lib/utils/approvers";

interface ApproverSelectProps {
  users: ApiUser[];
  selected: SelectedApprover[];
  onToggle: (user: ApiUser) => void;
  loading?: boolean;
  buttonClassName?: string;
}

interface PanelPosition {
  top?: number;
  bottom?: number;
  left: number;
  width: number;
}

const PANEL_MAX_HEIGHT = 280; // list (220px) + footer + borders, approx

export function ApproverSelect({ users, selected, onToggle, loading, buttonClassName = "" }: ApproverSelectProps) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<PanelPosition | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      const insideTrigger = triggerRef.current?.contains(target);
      const insidePanel = panelRef.current?.contains(target);
      if (!insideTrigger && !insidePanel) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);
  useLayoutEffect(() => {
    if (!open || !triggerRef.current) return;

    const updatePosition = () => {
      const rect = triggerRef.current!.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      const openUp = spaceBelow < PANEL_MAX_HEIGHT && spaceAbove > spaceBelow;

      setPosition({
        left: rect.left,
        width: rect.width,
        ...(openUp
          ? { bottom: window.innerHeight - rect.top + 4 }
          : { top: rect.bottom + 4 }),
      });
    };

    updatePosition();
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);
    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [open]);

  return (
    <div className="relative">
      <label className="gv-eyebrow mb-1 block">Approvers *</label>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((p) => !p)}
        className={`gv-input w-full text-sm flex items-center justify-between ${buttonClassName}`}
        style={{ color: selected.length ? "white" : "var(--gv-text-faint)" }}
      >
        <span className="truncate">
          {selected.length === 0 ? "Select approvers" : selected.map((a) => a.name).join(", ")}
        </span>
        <ChevronDown size={15} className={`ml-2 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && position && typeof document !== "undefined" && createPortal(
        <div
          ref={panelRef}
          className="fixed z-[100] rounded-xl shadow-xl flex flex-col"
          style={{
            background: "#0d1528",
            border: "1px solid var(--gv-glass-border)",
            left: position.left,
            width: position.width,
            top: position.top,
            bottom: position.bottom,
          }}
        >
          <div style={{ maxHeight: "220px", overflowY: "auto" }}>
            {loading ? (
              <p className="px-4 py-3 text-sm" style={{ color: "var(--gv-text-muted)" }}>Loading users…</p>
            ) : users.length === 0 ? (
              <p className="px-4 py-3 text-sm" style={{ color: "var(--gv-text-muted)" }}>No users available</p>
            ) : (
              users.map((u) => {
                const sel = selected.find((a) => a.userId === u.id);
                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => onToggle(u)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-white/5 transition-colors"
                    style={{ color: sel ? "#33907c" : "white" }}
                  >
                    <span
                      className="w-4 h-4 rounded flex items-center justify-center shrink-0"
                      style={sel ? { background: "#33907c" } : { border: "1px solid rgba(255,255,255,0.25)" }}
                    >
                      {sel && <Check size={10} color="white" />}
                    </span>
                    <span>{u.firstName} {u.lastName}</span>
                  </button>
                );
              })
            )}
          </div>
          <div className="p-3" style={{ borderTop: "1px solid var(--gv-glass-border)" }}>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="w-full py-2 rounded-xl text-sm font-semibold"
              style={{ background: "#33907c", color: "white" }}
            >
              Done {selected.length > 0 && `(${selected.length} selected)`}
            </button>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}