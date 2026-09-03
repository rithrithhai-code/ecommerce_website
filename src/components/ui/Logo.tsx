import { Link } from "react-router-dom";

import { cn } from "@/lib/cn";

export function Logo({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <Link
      to="/"
      className={cn("group inline-flex items-center gap-2.5", className)}
      aria-label="KHMart home"
    >
      <span className="relative flex size-9 items-center justify-center rounded-xl bg-brand text-brand-contrast shadow-soft transition group-hover:scale-105">
        {/* Scan brackets + centre dot: the mark is literally a QR reticle. */}
        <svg viewBox="0 0 24 24" className="size-5" fill="none" aria-hidden="true">
          <path
            d="M4 8V6a2 2 0 0 1 2-2h2M16 4h2a2 2 0 0 1 2 2v2M20 16v2a2 2 0 0 1-2 2h-2M8 20H6a2 2 0 0 1-2-2v-2"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <circle cx="12" cy="12" r="2.4" fill="currentColor" />
        </svg>
      </span>
      {!compact ? (
        <span className="font-display text-[19px] font-semibold tracking-tight">
          KH<span className="text-brand">Mart</span>
        </span>
      ) : null}
    </Link>
  );
}
