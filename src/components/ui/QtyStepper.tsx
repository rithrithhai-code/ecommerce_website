import { Minus, Plus } from "lucide-react";

import { cn } from "@/lib/cn";

export function QtyStepper({
  value,
  min = 1,
  max = 99,
  onChange,
  size = "md",
  label = "Quantity",
}: {
  value: number;
  min?: number;
  max?: number;
  onChange: (next: number) => void;
  size?: "sm" | "md";
  label?: string;
}) {
  const control = size === "sm" ? "size-7" : "size-9";

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-line bg-surface-2 p-1",
        size === "sm" && "gap-0.5",
      )}
    >
      <button
        type="button"
        className={cn(
          control,
          "inline-flex items-center justify-center rounded-full text-fg-muted transition hover:bg-surface hover:text-fg disabled:opacity-40 disabled:hover:bg-transparent",
        )}
        onClick={() => onChange(value - 1)}
        disabled={value <= min}
        aria-label={`Decrease ${label.toLowerCase()}`}
      >
        <Minus size={size === "sm" ? 13 : 15} strokeWidth={2} />
      </button>
      <span
        className="min-w-8 text-center text-sm font-semibold tabular-nums"
        aria-live="polite"
      >
        {value}
      </span>
      <button
        type="button"
        className={cn(
          control,
          "inline-flex items-center justify-center rounded-full text-fg-muted transition hover:bg-surface hover:text-fg disabled:opacity-40 disabled:hover:bg-transparent",
        )}
        onClick={() => onChange(value + 1)}
        disabled={value >= max}
        aria-label={`Increase ${label.toLowerCase()}`}
      >
        <Plus size={size === "sm" ? 13 : 15} strokeWidth={2} />
      </button>
    </div>
  );
}
