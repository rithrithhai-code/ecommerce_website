import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

const TONES = {
  brand: "bg-brand/12 text-brand border-brand/25",
  gold: "bg-gold/12 text-gold border-gold/25",
  neutral: "bg-surface-3 text-fg-muted border-line",
  danger: "bg-danger/10 text-danger border-danger/25",
} as const;

export type BadgeTone = keyof typeof TONES;

export function Badge({
  tone = "neutral",
  className,
  children,
}: {
  tone?: BadgeTone;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold tracking-wide uppercase",
        TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
