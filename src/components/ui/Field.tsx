import { useId, type ComponentPropsWithoutRef, type ReactNode } from "react";

import { cn } from "@/lib/cn";
import { inputClasses } from "@/lib/styles";

interface BaseFieldProps {
  label: string;
  error?: string;
  hint?: string;
  className?: string;
}

function Wrapper({
  label,
  error,
  hint,
  htmlFor,
  className,
  children,
}: BaseFieldProps & { htmlFor: string; children: ReactNode }) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label htmlFor={htmlFor} className="block text-[13px] font-medium text-fg-muted">
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${htmlFor}-error`} className="text-[12px] font-medium text-danger" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p id={`${htmlFor}-hint`} className="text-[12px] text-fg-faint">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

function describedBy(fieldId: string, error?: string, hint?: string): string | undefined {
  if (error) return `${fieldId}-error`;
  return hint ? `${fieldId}-hint` : undefined;
}

type TextFieldProps = BaseFieldProps & ComponentPropsWithoutRef<"input">;

export function TextField({ label, error, hint, className, id, ...rest }: TextFieldProps) {
  const generated = useId();
  const fieldId = id ?? generated;
  return (
    <Wrapper label={label} error={error} hint={hint} htmlFor={fieldId} className={className}>
      <input
        id={fieldId}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(fieldId, error, hint)}
        className={cn(inputClasses, error && "border-danger focus:border-danger focus:ring-danger/15")}
        {...rest}
      />
    </Wrapper>
  );
}

type TextAreaProps = BaseFieldProps & ComponentPropsWithoutRef<"textarea">;

export function TextAreaField({ label, error, hint, className, id, ...rest }: TextAreaProps) {
  const generated = useId();
  const fieldId = id ?? generated;
  return (
    <Wrapper label={label} error={error} hint={hint} htmlFor={fieldId} className={className}>
      <textarea
        id={fieldId}
        rows={3}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(fieldId, error, hint)}
        className={cn(inputClasses, "resize-y")}
        {...rest}
      />
    </Wrapper>
  );
}

type SelectFieldProps = BaseFieldProps & {
  options: Array<{ value: string; label: string }>;
} & ComponentPropsWithoutRef<"select">;

export function SelectField({
  label,
  error,
  hint,
  className,
  id,
  options,
  ...rest
}: SelectFieldProps) {
  const generated = useId();
  const fieldId = id ?? generated;
  return (
    <Wrapper label={label} error={error} hint={hint} htmlFor={fieldId} className={className}>
      <select
        id={fieldId}
        aria-describedby={describedBy(fieldId, error, hint)}
        className={cn(inputClasses, "appearance-none pr-10")}
        {...rest}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </Wrapper>
  );
}
