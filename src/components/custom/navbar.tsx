"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ROUTES } from '@/lib/routes';

const links = [
  { href: ROUTES.public.landing,  label: "Home"     },
  { href: ROUTES.public.about,    label: "About"    },
  { href: ROUTES.public.services, label: "Services" },
  { href: ROUTES.public.contact,  label: "Contact"  },
];

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Close the mobile menu whenever the route changes
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Close on Escape + lock background scroll while the menu is open
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    /* gv-nav handles: gradient bg, blur, z-50, shadow-border */
    <nav className="gv-nav relative">
      <div className="relative w-full px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between gap-3">

        {/* LEFT: logo + company name (name hidden on very small screens) */}
        <Link
          href={ROUTES.public.landing}
          className="flex items-center gap-3 min-w-0"
          aria-label="Graville Enterprises Limited — home"
        >
          <Image
            src="/logo.png"
            alt=""
            width={40}
            height={40}
            className="w-9 h-9 sm:w-10 sm:h-10 object-contain shrink-0"
            priority
          />
          <span
            style={{ color: "var(--gv-text-primary)" }}
            className="hidden min-[400px]:block truncate font-semibold text-xs sm:text-sm tracking-widest uppercase"
          >
            Graville Enterprises Limited
          </span>
        </Link>

        {/* CENTER: nav links — desktop only */}
        <ul className="hidden lg:flex items-center gap-10 absolute left-1/2 -translate-x-1/2">
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

        {/* RIGHT (desktop): Sign In | Request a demo */}
        <div className="hidden lg:flex items-center gap-3 shrink-0">
          <Link
            href={ROUTES.signin}
            className="text-sm transition-colors duration-200"
            style={{ color: "var(--gv-text-muted)" }}
            onMouseEnter={e => (e.currentTarget.style.color = "var(--gv-text-primary)")}
            onMouseLeave={e => (e.currentTarget.style.color = "var(--gv-text-muted)")}
          >
            Sign In
          </Link>

          <span className="w-px h-4" style={{ background: "var(--gv-glass-border)" }} />

          <Link href={ROUTES.public.demo} className="gv-btn-pill">
            Request a demo
          </Link>
        </div>

        {/* RIGHT (mobile/tablet): hamburger */}
        <button
          type="button"
          className="lg:hidden shrink-0 inline-flex items-center justify-center w-10 h-10 rounded-lg border transition-colors hover:bg-white/10"
          style={{ borderColor: "var(--gv-glass-border)", color: "var(--gv-text-primary)" }}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen(o => !o)}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* MOBILE / TABLET PANEL */}
      {open && (
        <>
          {/* tap-outside backdrop */}
          <div
            className="lg:hidden fixed inset-0 top-16 bg-black/50"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div
            id="mobile-menu"
            className="lg:hidden absolute left-0 right-0 top-full px-4 sm:px-6 pb-5 pt-2 border-t"
            style={{
              background: "#0a0f1e",
              borderColor: "var(--gv-glass-border)",
              boxShadow: "0 16px 32px rgba(0,0,0,0.5)",
            }}
          >
            <ul className="flex flex-col">
              {links.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className={cn(
                      "flex items-center min-h-12 px-2 text-base border-b transition-colors",
                      pathname === href ? "font-semibold" : "opacity-70 hover:opacity-100"
                    )}
                    style={{
                      color: pathname === href ? "var(--gv-brand)" : "var(--gv-text-primary)",
                      borderColor: "rgba(255,255,255,0.06)",
                    }}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="flex flex-col sm:flex-row gap-3 mt-5">
              <Link href={ROUTES.signin} className="gv-btn-outline flex-1">
                Sign In
              </Link>
              <Link href={ROUTES.public.demo} className="gv-btn-brand flex-1">
                Request a demo
              </Link>
            </div>
          </div>
        </>
      )}
    </nav>
  );
}
