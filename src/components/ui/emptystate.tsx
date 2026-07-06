"use client";

interface EmptyStateProps {
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  fullScreen?: boolean;
}
export default function EmptyState({
  title,
  description,
  action,
  fullScreen = true,
}: EmptyStateProps) {
  return (
    <div
      className={`flex w-full flex-col items-center justify-center gap-5 px-6 py-12 text-center ${
        fullScreen ? "min-h-screen" : "h-full"
      }`}
    >
      {/* Hardcoded glassmorphic avatar */}
      <svg
        width="220"
        height="180"
        viewBox="0 0 320 260"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="es-boxFront" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#2a4a6e" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#0d1528" stopOpacity="0.9" />
          </linearGradient>
          <linearGradient id="es-boxRight" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#1a3a60" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#0a1020" stopOpacity="0.95" />
          </linearGradient>
          <linearGradient id="es-boxTop" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3a6a8a" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#1a3050" stopOpacity="0.85" />
          </linearGradient>
          <linearGradient id="es-docWhite" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#c8ddf0" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#8ab0d0" stopOpacity="0.15" />
          </linearGradient>
          <linearGradient id="es-docGreen" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#33907c" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#1a5040" stopOpacity="0.2" />
          </linearGradient>
          <linearGradient id="es-shineH" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.25" />
            <stop offset="60%" stopColor="#ffffff" stopOpacity="0.05" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="es-shineV" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
        </defs>
        <ellipse cx="160" cy="242" rx="95" ry="10" fill="#33907c" fillOpacity="0.1" />
        <path d="M68 148 L160 172 L252 148 L160 124 Z"
          fill="url(#es-boxTop)" stroke="#5ab8a0" strokeWidth="1" strokeOpacity="0.6" />
        <path d="M68 148 L68 210 L160 234 L160 172 Z"
          fill="url(#es-boxFront)" stroke="#3a7a8a" strokeWidth="0.8" strokeOpacity="0.5" />
        <path d="M252 148 L252 210 L160 234 L160 172 Z"
          fill="url(#es-boxRight)" stroke="#2a5a6a" strokeWidth="0.8" strokeOpacity="0.4" />
        <path d="M70 149 L70 202 L84 209 L84 155 Z"
          fill="url(#es-shineH)" fillOpacity="0.5" />
        <path d="M70 149 L130 130 L160 125 L98 144 Z"
          fill="url(#es-shineV)" fillOpacity="0.45" />
        <path d="M68 148 L160 124 L252 148"
          fill="none" stroke="#33907c" strokeWidth="1.5" strokeOpacity="0.75"
          strokeLinecap="round" strokeLinejoin="round" />
        <path d="M68 210 L160 234 L252 210"
          fill="none" stroke="#33907c" strokeWidth="1" strokeOpacity="0.35"
          strokeLinecap="round" strokeLinejoin="round" />
        <path d="M90 162 Q160 152 230 162"
          fill="none" stroke="#33907c" strokeWidth="1.2" strokeOpacity="0.4" strokeLinecap="round" />
        <path d="M96 178 Q160 170 224 178"
          fill="none" stroke="#ffffff" strokeWidth="0.6" strokeOpacity="0.1" strokeLinecap="round" />
        <path d="M100 193 Q160 186 220 193"
          fill="none" stroke="#ffffff" strokeWidth="0.5" strokeOpacity="0.07" strokeLinecap="round" />
        <g transform="translate(28 76) rotate(-20)">
          <rect width="72" height="58" rx="4"
            fill="url(#es-docWhite)" stroke="#a0c8e8" strokeWidth="0.9" strokeOpacity="0.6" />
          <rect width="15" height="58" rx="4"
            fill="#ffffff" fillOpacity="0.07" />
          <line x1="20" y1="14" x2="64" y2="14"
            stroke="#c8ddf0" strokeWidth="1.3" strokeOpacity="0.7" strokeLinecap="round" />
          <line x1="20" y1="24" x2="60" y2="24"
            stroke="#c8ddf0" strokeWidth="1.1" strokeOpacity="0.5" strokeLinecap="round" />
          <line x1="20" y1="34" x2="62" y2="34"
            stroke="#c8ddf0" strokeWidth="0.9" strokeOpacity="0.38" strokeLinecap="round" />
          <line x1="20" y1="44" x2="57" y2="44"
            stroke="#c8ddf0" strokeWidth="0.8" strokeOpacity="0.25" strokeLinecap="round" />
          <rect width="72" height="58" rx="4"
            fill="none" stroke="#ffffff" strokeWidth="0.5" strokeOpacity="0.18" />
        </g>
        <g transform="translate(222 68) rotate(16)">
          <rect width="66" height="54" rx="4"
            fill="url(#es-docGreen)" stroke="#33907c" strokeWidth="0.9" strokeOpacity="0.6" />
          <rect width="14" height="54" rx="4"
            fill="#33907c" fillOpacity="0.18" />
          <line x1="18" y1="13" x2="58" y2="13"
            stroke="#5ab8a0" strokeWidth="1.3" strokeOpacity="0.7" strokeLinecap="round" />
          <line x1="18" y1="23" x2="55" y2="23"
            stroke="#5ab8a0" strokeWidth="1.1" strokeOpacity="0.5" strokeLinecap="round" />
          <line x1="18" y1="33" x2="57" y2="33"
            stroke="#5ab8a0" strokeWidth="0.9" strokeOpacity="0.35" strokeLinecap="round" />
          <line x1="18" y1="43" x2="52" y2="43"
            stroke="#5ab8a0" strokeWidth="0.8" strokeOpacity="0.22" strokeLinecap="round" />
          <rect width="66" height="54" rx="4"
            fill="none" stroke="#33907c" strokeWidth="0.5" strokeOpacity="0.3" />
        </g>
        <circle cx="228" cy="138" r="4.5" fill="#33907c" fillOpacity="0.75" />
        <circle cx="226" cy="136" r="1.8" fill="#ffffff" fillOpacity="0.4" />
        <circle cx="90"  cy="145" r="3"   fill="#7ab8d0" fillOpacity="0.5" />
        <circle cx="89"  cy="144" r="1.1" fill="#ffffff" fillOpacity="0.5" />
        <circle cx="242" cy="195" r="2"   fill="#ffffff" fillOpacity="0.15" />
        <circle cx="56"  cy="108" r="1.5" fill="#33907c" fillOpacity="0.45" />
        <circle cx="258" cy="114" r="1.2" fill="#a0c8e8" fillOpacity="0.35" />
      </svg>

      <h2 className="gv-title-sm">{title}</h2>
      <p className="gv-body-sm max-w-sm">{description}</p>

      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="gv-btn-brand mt-1"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}