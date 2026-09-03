import { Link } from "react-router-dom";

import { cn } from "@/lib/cn";

export function Logo({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <Link
      to="/"
      className={cn("group inline-flex items-center gap-2.5", className)}
      aria-label="JingHUB Express home"
    >
      {/* Scan reticle + forward chevrons: read the code, move on. */}
      <span className="relative flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand to-brand-strong text-brand-contrast shadow-soft transition duration-300 group-hover:scale-105 group-hover:shadow-glow">
        <svg viewBox="0 0 24 24" className="size-5" fill="none" aria-hidden="true">
          <path
            d="M4 8V6a2 2 0 0 1 2-2h2M16 4h2a2 2 0 0 1 2 2v2M20 16v2a2 2 0 0 1-2 2h-2M8 20H6a2 2 0 0 1-2-2v-2"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M9.5 9.2 12 12l-2.5 2.8M13 9.2 15.5 12 13 14.8"
            stroke="currentColor"
            strokeWidth="1.9"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>

      {!compact ? (
        <span className="flex items-baseline gap-2">
          <span className="font-display text-[19px] font-semibold tracking-tight">
            Jing<span className="text-brand">HUB</span>
          </span>
          <span className="hidden text-[10.5px] font-semibold tracking-[0.2em] text-fg-faint uppercase sm:inline">
            Express
          </span>
        </span>
      ) : null}
    </Link>
  );
}
