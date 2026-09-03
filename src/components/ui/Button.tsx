import type { ComponentPropsWithoutRef } from "react";
import { LoaderCircle } from "lucide-react";
import { Link } from "react-router-dom";

import { cn } from "@/lib/cn";
import { buttonClasses, type ButtonSize, type ButtonVariant } from "@/lib/styles";

interface CommonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  className?: string;
}

function widthClass(fullWidth?: boolean): string | undefined {
  return fullWidth ? "w-full" : undefined;
}

type ButtonProps = CommonProps & { loading?: boolean } & ComponentPropsWithoutRef<"button">;

export function Button({
  variant = "primary",
  size = "md",
  fullWidth,
  className,
  type = "button",
  loading = false,
  disabled,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(buttonClasses(variant, size, widthClass(fullWidth)), className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading ? <LoaderCircle size={16} className="animate-spin" /> : null}
      {children}
    </button>
  );
}

type ButtonLinkProps = CommonProps &
  Pick<ComponentPropsWithoutRef<typeof Link>, "to"> &
  Omit<ComponentPropsWithoutRef<typeof Link>, "to" | "className">;

export function ButtonLink({
  variant = "primary",
  size = "md",
  fullWidth,
  className,
  to,
  ...rest
}: ButtonLinkProps) {
  return (
    <Link
      to={to}
      className={cn(buttonClasses(variant, size, widthClass(fullWidth)), className)}
      {...rest}
    />
  );
}
