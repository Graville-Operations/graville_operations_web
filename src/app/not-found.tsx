import Link from "next/link";

export default function NotFound() {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "radial-gradient(circle at center, #0f172a 0%, #0a0f1c 100%)",
        zIndex: 9999,
        padding: "1.5rem",
      }}
    >
      <div style={{ textAlign: "center", maxWidth: 420 }}>
        <span
          style={{
            display: "block",
            fontSize: "6rem",
            fontWeight: 800,
            lineHeight: 1,
            letterSpacing: "-0.03em",
            background: "linear-gradient(135deg, #60a5fa, #2563eb)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
            marginBottom: "1rem",
          }}
        >
          404
        </span>
        <h1
          style={{
            fontSize: "1.4rem",
            fontWeight: 600,
            color: "#f1f5f9",
            margin: "0 0 0.75rem",
          }}
        >
          This page wandered off site
        </h1>
        <p
          style={{
            fontSize: "0.95rem",
            color: "#94a3b8",
            lineHeight: 1.6,
            margin: "0 0 2rem",
          }}
        >
          The link you followed doesn&apos;t match any page in Graville Operations.
          It may have been moved, renamed, or never existed.
        </p>
        <Link
          href="/"
          style={{
            display: "inline-block",
            padding: "0.75rem 2rem",
            borderRadius: 9999,
            background: "#2563eb",
            color: "white",
            fontWeight: 500,
            textDecoration: "none",
            fontSize: "0.95rem",
          }}
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}