import React from "react";

export interface ErrorScreenAction {
  label: string;
  onClick: () => void;
  variant?: "primary" | "secondary";
}

export interface ErrorScreenProps {
  icon: React.ReactNode;
  iconBgColor: string;
  title: string;
  subtitle: string;
  actions?: ErrorScreenAction[];
  children?: React.ReactNode;
  testId?: string;
}

const S = {
  screen: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    minHeight: "100vh",
    padding: "3rem 1.5rem",
    backgroundColor: "#ffffff",
    textAlign: "center",
    boxSizing: "border-box",
  } as React.CSSProperties,

  avatar: {
    width: 88,
    height: 88,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "1.5rem",
    flexShrink: 0,
  } as React.CSSProperties,

  title: {
    fontSize: 22,
    fontWeight: 500,
    color: "#111111",
    margin: "0 0 0.5rem",
    lineHeight: 1.3,
  } as React.CSSProperties,

  subtitle: {
    fontSize: 15,
    color: "#666666",
    maxWidth: 340,
    lineHeight: 1.65,
    margin: "0 0 2rem",
  } as React.CSSProperties,

  btnRow: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
    justifyContent: "center",
  } as React.CSSProperties,

  btnPrimary: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "10px 22px",
    fontSize: 14,
    fontWeight: 500,
    borderRadius: 8,
    border: "1px solid #111111",
    backgroundColor: "#111111",
    color: "#ffffff",
    cursor: "pointer",
  } as React.CSSProperties,

  btnSecondary: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "10px 22px",
    fontSize: 14,
    fontWeight: 500,
    borderRadius: 8,
    border: "1px solid #e0e0e0",
    backgroundColor: "#ffffff",
    color: "#111111",
    cursor: "pointer",
  } as React.CSSProperties,

  codeSnippet: {
    fontFamily: "monospace",
    fontSize: 12,
    color: "#666",
    backgroundColor: "#f5f5f5",
    padding: "12px 20px",
    borderRadius: 8,
    border: "1px solid #e0e0e0",
    marginBottom: "1.5rem",
    textAlign: "left",
    maxWidth: 360,
    width: "100%",
  } as React.CSSProperties,
};

const icon = { width: 44, height: 44 };
const stroke = { fill: "none", strokeWidth: 1.5, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

const MapOffIcon   = () => <svg {...icon} viewBox="0 0 24 24" stroke="#0C447C" {...stroke} aria-hidden="true"><path d="M3 7l6-3 6 3 6-3v13l-6 3-6-3-6 3V7"/><line x1="3" y1="3" x2="21" y2="21"/></svg>;
const InboxIcon    = () => <svg {...icon} viewBox="0 0 24 24" stroke="#27500A" {...stroke} aria-hidden="true"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z"/></svg>;
const WifiOffIcon  = () => <svg {...icon} viewBox="0 0 24 24" stroke="#633806" {...stroke} aria-hidden="true"><line x1="1" y1="1" x2="23" y2="23"/><path d="M16.72 11.06A10.94 10.94 0 0119 12.55"/><path d="M5 12.55a10.94 10.94 0 015.17-2.39"/><path d="M10.71 5.05A16 16 0 0122.56 9"/><path d="M1.42 9a15.91 15.91 0 014.7-2.88"/><path d="M8.53 16.11a6 6 0 016.95 0"/><line x1="12" y1="20" x2="12.01" y2="20" strokeWidth={2.5}/></svg>;
const ServerOffIcon= () => <svg {...icon} viewBox="0 0 24 24" stroke="#791F1F" {...stroke} aria-hidden="true"><rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/><line x1="6" y1="6" x2="6.01" y2="6" strokeWidth={2.5}/><line x1="6" y1="18" x2="6.01" y2="18" strokeWidth={2.5}/><line x1="3" y1="3" x2="21" y2="21"/></svg>;
const LockIcon     = () => <svg {...icon} viewBox="0 0 24 24" stroke="#72243E" {...stroke} aria-hidden="true"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>;
const ClockOffIcon = () => <svg {...icon} viewBox="0 0 24 24" stroke="#3C3489" {...stroke} aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/><line x1="3" y1="3" x2="21" y2="21"/></svg>;

const ErrorScreen: React.FC<ErrorScreenProps> = ({
  icon,
  iconBgColor,
  title,
  subtitle,
  actions = [],
  children,
  testId,
}) => (
  <div style={S.screen} data-testid={testId ?? "error-screen"}>
    <div style={{ ...S.avatar, backgroundColor: iconBgColor }}>{icon}</div>
    <h1 style={S.title}>{title}</h1>
    <p style={S.subtitle}>{subtitle}</p>
    {children}
    {actions.length > 0 && (
      <div style={S.btnRow}>
        {actions.map((a, i) => (
          <button key={i} onClick={a.onClick} style={a.variant === "primary" ? S.btnPrimary : S.btnSecondary}>
            {a.label}
          </button>
        ))}
      </div>
    )}
  </div>
);


interface NotFoundScreenProps {
  onGoHome?: () => void;
  onGoBack?: () => void;
  title?: string;
  subtitle?: string;
}

export const NotFoundScreen: React.FC<NotFoundScreenProps> = ({
  onGoHome = () => (window.location.href = "/"),
  onGoBack = () => window.history.back(),
  title = "Page not found",
  subtitle = "The page you're looking for doesn't exist or has been moved to a different location.",
}) => (
  <ErrorScreen
    icon={<MapOffIcon />}
    iconBgColor="#E6F1FB"
    title={title}
    subtitle={subtitle}
    testId="error-screen-404"
    actions={[
      { label: "Go home", onClick: onGoHome, variant: "primary" },
      { label: "Go back", onClick: onGoBack, variant: "secondary" },
    ]}
  />
);

interface EmptyListScreenProps {
  onAdd?: () => void;
  title?: string;
  subtitle?: string;
  addLabel?: string;
}

export const EmptyListScreen: React.FC<EmptyListScreenProps> = ({
  onAdd,
  title = "Nothing here yet",
  subtitle = "Your list is empty. Start by adding your first item and it'll show up right here.",
  addLabel = "Add item",
}) => (
  <ErrorScreen
    icon={<InboxIcon />}
    iconBgColor="#EAF3DE"
    title={title}
    subtitle={subtitle}
    testId="error-screen-empty"
    actions={onAdd ? [{ label: addLabel, onClick: onAdd, variant: "primary" }] : []}
  />
);

interface NetworkErrorScreenProps {
  onRetry?: () => void;
  title?: string;
  subtitle?: string;
}

export const NetworkErrorScreen: React.FC<NetworkErrorScreenProps> = ({
  onRetry,
  title = "No internet connection",
  subtitle = "It looks like you're offline. Check your connection and try again when you're back online.",
}) => (
  <ErrorScreen
    icon={<WifiOffIcon />}
    iconBgColor="#FAEEDA"
    title={title}
    subtitle={subtitle}
    testId="error-screen-network"
    actions={onRetry ? [{ label: "Retry", onClick: onRetry, variant: "primary" }] : []}
  />
);

interface ServerErrorScreenProps {
  onRetry?: () => void;
  onContactSupport?: () => void;
  requestId?: string;
  title?: string;
  subtitle?: string;
}

export const ServerErrorScreen: React.FC<ServerErrorScreenProps> = ({
  onRetry,
  onContactSupport,
  requestId,
  title = "Something went wrong",
  subtitle = "We're having trouble on our end. Our team has been notified. Please try again in a few minutes.",
}) => (
  <ErrorScreen
    icon={<ServerOffIcon />}
    iconBgColor="#FCEBEB"
    title={title}
    subtitle={subtitle}
    testId="error-screen-server"
    actions={[
      ...(onRetry ? [{ label: "Try again", onClick: onRetry, variant: "primary" as const }] : []),
      ...(onContactSupport ? [{ label: "Contact support", onClick: onContactSupport, variant: "secondary" as const }] : []),
    ]}
  >
    {requestId && (
      <div style={S.codeSnippet}>
        Error 500 · Internal server error<br />
        Request ID: <span style={{ opacity: 0.6 }}>{requestId}</span>
      </div>
    )}
  </ErrorScreen>
);

interface AccessDeniedScreenProps {
  onGoHome?: () => void;
  onRequestAccess?: () => void;
  title?: string;
  subtitle?: string;
}

export const AccessDeniedScreen: React.FC<AccessDeniedScreenProps> = ({
  onGoHome = () => (window.location.href = "/"),
  onRequestAccess,
  title = "Access denied",
  subtitle = "You don't have permission to view this page. Contact your administrator if you think this is a mistake.",
}) => (
  <ErrorScreen
    icon={<LockIcon />}
    iconBgColor="#FBEAF0"
    title={title}
    subtitle={subtitle}
    testId="error-screen-403"
    actions={[
      { label: "Go home", onClick: onGoHome, variant: "primary" },
      ...(onRequestAccess ? [{ label: "Request access", onClick: onRequestAccess, variant: "secondary" as const }] : []),
    ]}
  />
);

interface SessionExpiredScreenProps {
  onSignIn?: () => void;
  title?: string;
  subtitle?: string;
}

export const SessionExpiredScreen: React.FC<SessionExpiredScreenProps> = ({
  onSignIn = () => (window.location.href = "/login"),
  title = "Session expired",
  subtitle = "Your session has timed out for security. Please sign in again to continue where you left off.",
}) => (
  <ErrorScreen
    icon={<ClockOffIcon />}
    iconBgColor="#EEEDFE"
    title={title}
    subtitle={subtitle}
    testId="error-screen-session"
    actions={[{ label: "Sign in again", onClick: onSignIn, variant: "primary" }]}
  />
);

export default ErrorScreen;