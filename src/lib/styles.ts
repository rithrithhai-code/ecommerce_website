export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg" | "icon";

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-full font-medium tracking-tight whitespace-nowrap transition duration-200 select-none active:translate-y-px disabled:pointer-events-none disabled:opacity-45";

const VARIANTS: Record<ButtonVariant, string> = {
  primary: "bg-brand text-brand-contrast hover:bg-brand-strong shadow-soft",
  secondary: "bg-fg text-canvas hover:opacity-90",
  outline: "border border-line-strong bg-surface text-fg hover:bg-surface-2",
  ghost: "text-fg-muted hover:bg-surface-2 hover:text-fg",
  danger: "border border-danger/40 text-danger hover:bg-danger/10",
};

const SIZES: Record<ButtonSize, string> = {
  sm: "h-9 px-3.5 text-[13px]",
  md: "h-11 px-5 text-sm",
  lg: "h-13 px-7 text-[15px]",
  icon: "h-10 w-10 p-0",
};

export function buttonClasses(
  variant: ButtonVariant = "primary",
  size: ButtonSize = "md",
  extra?: string,
): string {
  return [BASE, VARIANTS[variant], SIZES[size], extra].filter(Boolean).join(" ");
}

export const inputClasses =
  "w-full rounded-2xl border border-line bg-surface-2 px-4 py-3 text-sm text-fg placeholder:text-fg-faint transition focus:border-brand focus:bg-surface focus:outline-none focus:ring-4 focus:ring-brand/12";

export const cardClasses = "rounded-card border border-line bg-surface shadow-soft";

export function chipClasses(active: boolean, extra?: string): string {
  return [
    "inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-[13px] font-medium transition",
    active
      ? "border-brand bg-brand text-brand-contrast shadow-soft"
      : "border-line bg-surface text-fg-muted hover:border-line-strong hover:text-fg",
    extra,
  ]
    .filter(Boolean)
    .join(" ");
}

export const sectionHeadingClasses =
  "font-display text-2xl font-semibold tracking-tight sm:text-3xl";
