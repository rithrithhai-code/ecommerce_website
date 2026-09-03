/** Tiny class joiner — avoids pulling in clsx for a one-line concern. */
export function cn(...values: Array<string | false | null | undefined>): string {
  return values.filter(Boolean).join(" ");
}
