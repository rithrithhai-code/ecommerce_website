import { formatMoney } from "@/lib/format";
import { cn } from "@/lib/cn";
import { usePreferences } from "@/store/preferences";

/**
 * Renders a USD base amount in the shopper's selected display currency.
 * A price never hard-codes a symbol, so the USD/KHR switch is instant.
 */
export function Money({
  usd,
  compareAtUsd,
  className,
  compareClassName,
}: {
  usd: number;
  compareAtUsd?: number;
  className?: string;
  compareClassName?: string;
}) {
  const currency = usePreferences((state) => state.currency);
  return (
    <>
      <span className={className}>{formatMoney(usd, currency)}</span>
      {compareAtUsd && compareAtUsd > usd ? (
        <span className={cn("text-fg-faint line-through", compareClassName)}>
          {formatMoney(compareAtUsd, currency)}
        </span>
      ) : null}
    </>
  );
}
