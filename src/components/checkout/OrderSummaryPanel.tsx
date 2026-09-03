import type { ReactNode } from "react";
import { Tag } from "lucide-react";

import { Money } from "@/components/ui/Money";
import { VAT_RATE, findPromo } from "@/lib/pricing";
import { usePromoLabel } from "@/i18n/domain";
import { useI18n } from "@/i18n";
import { cn } from "@/lib/cn";
import type { ResolvedCartLine, Totals } from "@/types";

/** Shared money breakdown, so cart and checkout can never disagree on the total. */
export function OrderSummaryPanel({
  lines,
  totals,
  promoCode,
  title,
  dense = false,
  footer,
  className,
}: {
  lines: ResolvedCartLine[];
  totals: Totals;
  promoCode?: string | null;
  title?: string;
  dense?: boolean;
  footer?: ReactNode;
  className?: string;
}) {
  const promo = findPromo(promoCode);
  const promoLabel = usePromoLabel(promo?.code ?? "");
  const { t } = useI18n();
  const heading = title ?? t("checkout.orderSummary");

  return (
    <section
      className={cn("rounded-card border border-line bg-surface p-5 shadow-soft", className)}
      aria-label={heading}
    >
      <h2 className="font-display text-lg font-semibold">{heading}</h2>

      {!dense && lines.length > 0 ? (
        <ul className="mt-4 space-y-3 border-b border-line pb-4">
          {lines.map((line) => (
            <li key={line.productId} className="flex items-center justify-between gap-3 text-sm">
              <span className="min-w-0">
                <span className="block truncate font-medium">{line.product.name}</span>
                <span className="text-[12px] text-fg-faint">{t("cart.qty", { count: line.qty })}</span>
              </span>
              <Money usd={line.lineTotalUsd} className="shrink-0 font-medium tabular-nums" />
            </li>
          ))}
        </ul>
      ) : null}

      <dl className="mt-4 space-y-2 text-sm">
        <Row label={t("summary.subtotal")}>
          <Money usd={totals.subtotalUsd} className="tabular-nums" />
        </Row>
        {totals.discountUsd > 0 ? (
          <Row label={t("summary.discount")} tone="brand">
            <span className="tabular-nums">
              −<Money usd={totals.discountUsd} />
            </span>
          </Row>
        ) : null}
        <Row label={t("summary.delivery")}>
          {totals.shippingUsd === 0 ? (
            <span className="font-medium text-brand">{t("summary.free")}</span>
          ) : (
            <Money usd={totals.shippingUsd} className="tabular-nums" />
          )}
        </Row>
        <Row label={t("summary.gst", { rate: Math.round(VAT_RATE * 100) })}>
          <Money usd={totals.taxUsd} className="tabular-nums" />
        </Row>
      </dl>

      <div className="mt-4 flex items-end justify-between gap-3 border-t border-line pt-4">
        <div>
          <p className="font-display text-[15px] font-semibold">{t("summary.total")}</p>
          {promo ? <p className="text-[11.5px] text-fg-faint">{promoLabel}</p> : null}
        </div>
        <Money
          usd={totals.totalUsd}
          className="font-display text-2xl font-semibold tracking-tight tabular-nums"
        />
      </div>

      {footer ? <div className="mt-5 space-y-3">{footer}</div> : null}
    </section>
  );
}

function Row({ label, tone, children }: { label: string; tone?: "brand"; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt
        className={cn(
          "flex items-center gap-1.5 text-fg-muted",
          tone === "brand" && "text-brand",
        )}
      >
        {tone === "brand" ? <Tag size={13} /> : null}
        {label}
      </dt>
      <dd>{children}</dd>
    </div>
  );
}
