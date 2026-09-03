import { Store, Truck, Zap } from "lucide-react";

import { Money } from "@/components/ui/Money";
import { useShippingOptions } from "@/i18n/domain";
import { useI18n } from "@/i18n";
import { cn } from "@/lib/cn";
import { useCheckoutDraft } from "@/store/checkout";
import type { ShippingOptionId } from "@/types";

const ICONS: Record<ShippingOptionId, typeof Truck> = {
  standard: Truck,
  express: Zap,
  pickup: Store,
};

/** Delivery choice. `standard` shows the free-shipping threshold inline. */
export function ShippingPicker() {
  const shippingOptionId = useCheckoutDraft((state) => state.shippingOptionId);
  const setShippingOption = useCheckoutDraft((state) => state.setShippingOption);
  const options = useShippingOptions();
  const { t } = useI18n();

  return (
    <fieldset className="space-y-2">
      <legend className="sr-only">Delivery method</legend>
      {options.map((option) => {
        const Icon = ICONS[option.id];
        const active = shippingOptionId === option.id;
        return (
          <label
            key={option.id}
            className={cn(
              "flex cursor-pointer items-center gap-3 rounded-2xl border p-3.5 transition",
              active
                ? "border-brand bg-brand/6 shadow-soft"
                : "border-line bg-surface hover:border-line-strong hover:bg-surface-2",
            )}
          >
            <input
              type="radio"
              name="shipping"
              value={option.id}
              checked={active}
              onChange={() => setShippingOption(option.id)}
              className="sr-only"
            />
            <span
              className={cn(
                "flex size-9 shrink-0 items-center justify-center rounded-full",
                active ? "bg-brand text-brand-contrast" : "bg-surface-3 text-fg-muted",
              )}
            >
              <Icon size={16} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold">{option.label}</span>
              <span className="block text-[12.5px] text-fg-muted">{option.eta}</span>
            </span>
            <span className="shrink-0 text-sm font-medium">
              {option.priceUsd === 0 ? (
                <span className="text-brand">{t("summary.free")}</span>
              ) : option.freeOverUsd ? (
                <span className="inline-flex flex-col items-end leading-tight">
                  <Money usd={option.priceUsd} className="tabular-nums" />
                  <span className="text-[11px] font-normal text-fg-faint">
                    {t("shipping.overThreshold", { amount: option.freeOverUsd })}
                  </span>
                </span>
              ) : (
                <Money usd={option.priceUsd} className="tabular-nums" />
              )}
            </span>
          </label>
        );
      })}
    </fieldset>
  );
}
