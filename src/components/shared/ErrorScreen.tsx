"use client";

import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import { WifiOff, AlertTriangle, RefreshCw } from "lucide-react";

type ErrorType = "network" | "generic" | null;
type State = { type: ErrorType; message?: string };

let state: State = { type: null };
const listeners = new Set<(s: State) => void>();

function setState(next: State) {
  state = next;
  listeners.forEach((l) => l(state));
}

export function showNetworkError(message?: string) {
  setState({ type: "network", message });
}

export function showGenericError(message?: string) {
  setState({ type: "generic", message });
}

export function clearGlobalError() {
  setState({ type: null });
}

function useGlobalErrorState() {
  const [s, setS] = useState(state);
  useEffect(() => {
    listeners.add(setS);
    return () => {
      listeners.delete(setS);
    };
  }, []);
  return s;
}

interface ScreenProps {
  title: string;
  message?: string;
  defaultMessage: string;
  icon: React.ReactNode;
  onRetry: () => void;
}

function FullScreenError({ title, message, defaultMessage, icon, onRetry }: ScreenProps) {
  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center px-6"
      style={{ background: "var(--gv-bg-gradient)" }}
    >
      <div className="gv-card flex max-w-sm flex-col items-center gap-4 text-center">
        <div className="gv-icon-box">{icon}</div>

        <h2 className="gv-title-sm">{title}</h2>
        <p className="gv-body-sm">{message || defaultMessage}</p>

        <button onClick={onRetry} className="gv-btn-brand mt-2 gap-2">
          <RefreshCw className="h-4 w-4" />
          Try again
        </button>
      </div>
    </div>
  );
}

function GlobalErrorOverlay() {
  const { type, message } = useGlobalErrorState();

  if (type === "network") {
    return (
      <FullScreenError
        title="No internet connection"
        message={message}
        defaultMessage="We couldn't reach Graville Ops. Check your connection and try again."
        icon={<WifiOff className="h-5 w-5" style={{ color: "var(--gv-brand)" }} />}
        onRetry={clearGlobalError}
      />
    );
  }

  if (type === "generic") {
    return (
      <FullScreenError
        title="Something went wrong"
        message={message}
        defaultMessage="An unexpected error occurred. Please try again, and contact support if it keeps happening."
        icon={<AlertTriangle className="h-5 w-5" style={{ color: "var(--gv-brand)" }} />}
        onRetry={clearGlobalError}
      />
    );
  }

  return null;
}
let mounted = false;

function GlobalErrorMount() {
  const [container, setContainer] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (mounted) return;
    mounted = true;
    const el = document.createElement("div");
    el.id = "gv-global-error-root";
    document.body.appendChild(el);
    setContainer(el);
  }, []);

  if (!container) return null;
  return createPortal(<GlobalErrorOverlay />, container);
}
if (typeof window !== "undefined") {
  import("react-dom/client").then(({ createRoot }) => {
    if (document.getElementById("gv-global-error-bootstrap")) return;
    const bootstrapEl = document.createElement("div");
    bootstrapEl.id = "gv-global-error-bootstrap";
    document.body.appendChild(bootstrapEl);
    createRoot(bootstrapEl).render(<GlobalErrorMount />);
  });
}