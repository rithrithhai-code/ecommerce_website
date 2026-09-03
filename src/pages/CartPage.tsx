import { ArrowRight, ShoppingBag, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";

import { OrderSummaryPanel } from "@/components/checkout/OrderSummaryPanel";
import { PromoField } from "@/components/checkout/PromoField";
import { ShippingPicker } from "@/components/checkout/ShippingPicker";
import { ProductArt } from "@/components/catalog/ProductArt";
import { Button, ButtonLink } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Money } from "@/components/ui/Money";
import { QtyStepper } from "@/components/ui/QtyStepper";
import { useCartTotals, useResolvedLines } from "@/hooks/useCartView";
import { useCart } from "@/store/cart";
import { useCheckoutDraft } from "@/store/checkout";
import { useI18n } from "@/i18n";

export function CartPage() {
  const lines = useResolvedLines();
  const shippingOptionId = useCheckoutDraft((state) => state.shippingOptionId);
  const promoCode = useCheckoutDraft((state) => state.promoCode);
  const totals = useCartTotals(shippingOptionId, promoCode);
  const setQty = useCart((state) => state.setQty);
  const remove = useCart((state) => state.remove);
  const clear = useCart((state) => state.clear);
  const { t } = useI18n();

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 sm:px-6">
        <EmptyState
          title={t("cart.emptyPageTitle")}
          description={t("cart.emptyPageBody")}
          action={
            <ButtonLink to="/shop" size="lg">
              <ShoppingBag size={17} />
              {t("cart.browse")}
            </ButtonLink>
          }
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[88rem] px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            {t("cart.title")}
          </h1>
          <p className="mt-2 text-sm text-fg-muted">
            {t("cart.lineCount", { lines: lines.length, linesPlural: lines.length === 1 ? "" : "s" })} ·
            {t("cart.totalSync")}
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={clear}>
          <Trash2 size={14} />
          {t("cart.emptyCart")}
        </Button>
      </header>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
        <ul className="space-y-3">
          {lines.map((line) => (
            <li
              key={line.productId}
              className="flex flex-wrap items-center gap-4 rounded-card border border-line bg-surface p-4 transition hover:border-line-strong sm:flex-nowrap"
            >
              <Link
                to={`/product/${line.product.slug}`}
                className="group size-24 shrink-0 overflow-hidden rounded-2xl"
                aria-label={line.product.name}
              >
                <ProductArt product={line.product} className="size-full" rounded="rounded-2xl" />
              </Link>

              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-semibold tracking-[0.14em] text-fg-faint uppercase">
                  {line.product.brand}
                </p>
                <Link
                  to={`/product/${line.product.slug}`}
                  className="font-display text-[15px] font-semibold transition hover:text-brand"
                >
                  {line.product.name}
                </Link>
                <p className="mt-0.5 text-[13px] text-fg-muted">
                  <Money usd={line.product.priceUsd} className="font-medium text-fg" /> each ·{" "}
                  {line.product.stock > 0 ? t("common.inStockCount", { count: line.product.stock }) : t("product.backordered")}
                </p>

                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <QtyStepper
                    value={line.qty}
                    max={line.product.stock}
                    onChange={(next) => setQty(line.productId, next)}
                  />
                  <button
                    type="button"
                    onClick={() => remove(line.productId)}
                    className="text-[13px] text-fg-faint underline-offset-4 transition hover:text-danger hover:underline"
                  >
                    Remove
                  </button>
                </div>
              </div>

              <div className="ml-auto text-right">
                <Money
                  usd={line.lineTotalUsd}
                  className="font-display text-lg font-semibold tabular-nums"
                />
                <p className="text-[12px] text-fg-faint">{t("product.lineTotal")}</p>
              </div>
            </li>
          ))}
        </ul>

        <div className="space-y-4 lg:sticky lg:top-28 lg:self-start">
          <OrderSummaryPanel
            lines={lines}
            totals={totals}
            promoCode={promoCode}
            footer={
              <>
                <PromoField subtotalUsd={totals.subtotalUsd} />
                <ButtonLink to="/checkout" fullWidth size="lg">
                  Checkout with KHQR
                  <ArrowRight size={17} />
                </ButtonLink>
                <ButtonLink to="/shop" variant="ghost" fullWidth size="sm">
                  Keep shopping
                </ButtonLink>
              </>
            }
          />

          <div className="rounded-card border border-line bg-surface p-5">
            <h2 className="mb-3 font-display text-[15px] font-semibold">{t("checkout.deliveryMethod")}</h2>
            <ShippingPicker />
          </div>
        </div>
      </div>
    </div>
  );
}
