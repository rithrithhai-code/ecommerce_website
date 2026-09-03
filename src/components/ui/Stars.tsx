import { Star } from "lucide-react";

import { cn } from "@/lib/cn";
import { useI18n } from "@/i18n";

/**
 * Rating readout. The filled layer is clipped to the exact ratio, so 4.8 reads as
 * four full stars and a near-full fifth instead of rounding to five.
 */
export function Stars({
  rating,
  reviews,
  size = 14,
  className,
}: {
  rating: number;
  reviews?: number;
  size?: number;
  className?: string;
}) {
  const percent = Math.max(0, Math.min(100, (rating / 5) * 100));
  const { t } = useI18n();

  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      <span
        className="relative inline-flex"
        role="img"
        aria-label={t("common.ratingOf", { rating: rating.toFixed(1) })}
      >
        <span className="flex text-line-strong">
          {[0, 1, 2, 3, 4].map((index) => (
            <Star key={index} width={size} height={size} strokeWidth={1.5} />
          ))}
        </span>
        <span
          className="absolute inset-0 flex overflow-hidden text-gold"
          style={{ width: `${percent}%` }}
          aria-hidden="true"
        >
          {[0, 1, 2, 3, 4].map((index) => (
            <Star
              key={index}
              width={size}
              height={size}
              strokeWidth={1.5}
              className="shrink-0 fill-current"
            />
          ))}
        </span>
      </span>
      <span className="text-[13px] font-medium text-fg">{rating.toFixed(1)}</span>
      {reviews !== undefined ? (
        <span className="text-[13px] text-fg-faint">({reviews})</span>
      ) : null}
    </span>
  );
}
