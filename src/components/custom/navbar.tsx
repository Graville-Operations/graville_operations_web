"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const links = [
  { href: "/",         label: "Home"     },
  { href: "/about",    label: "About"    },
  { href: "/services", label: "Services" },
  { href: "/contact",  label: "Contact"  },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    /* gv-nav handles: gradient bg, blur, z-50, fixed, shadow-border */
    <nav className="gv-nav">
      {/*
        w-full px-8 — truly full width, logo at left edge, auth at right edge.
        No max-width container here — that was squeezing things toward center.
      */}
      <div className="w-full px-8 h-full flex items-center justify-between">

        {/* FAR LEFT: logo + company name */}
        <Link href="/" className="flex items-center gap-3 shrink-0">
          <Image
            src="/logo.png"
            alt="Graville Enterprises Limited"
            width={40}
            height={40}
            className="w-10 h-10 object-contain"
            priority
          />
          <span style={{ color: "var(--gv-text-primary)" }}
                className="font-semibold text-sm tracking-widest uppercase">
            Graville Enterprises Limited
          </span>
        </Link>

        {/* CENTER: nav links */}
        <ul className="flex items-center gap-10 absolute left-1/2 -translate-x-1/2">
          {links.map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                className={cn(
                  "text-sm tracking-wide transition-colors duration-200",
                  pathname === href
                    ? "underline underline-offset-4 decoration-white/30"
                    : "hover:opacity-100 opacity-60"
                )}
                style={{ color: "var(--gv-text-primary)" }}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>

        {/* FAR RIGHT: Sign In | Request a demo */}
        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/signin"
            className="text-sm transition-colors duration-200"
            style={{ color: "var(--gv-text-muted)" }}
            onMouseEnter={e => (e.currentTarget.style.color = "var(--gv-text-primary)")}
            onMouseLeave={e => (e.currentTarget.style.color = "var(--gv-text-muted)")}
          >
            Sign In
          </Link>

          <span className="w-px h-4" style={{ background: "var(--gv-glass-border)" }} />

          <Link href="/demo" className="gv-btn-pill">
            Request a demo
          </Link>
        </div>

      </div>
    </nav>
  );
}