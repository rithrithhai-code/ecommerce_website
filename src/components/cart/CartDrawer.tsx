import { useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Trash2, X } from "lucide-react";

import { ProductArt } from "@/components/catalog/ProductArt";
import { EmptyState } from "@/components/ui/EmptyState";
import { ButtonLink } from "@/components/ui/Button";
import { Money } from "@/components/ui/Money";
import { QtyStepper } from "@/components/ui/QtyStepper";
import { formatMoney } from "@/lib/format";
import { findShippingOption } from "@/lib/pricing";
import { useCart } from "@/store/cart";
import { useCheckoutDraft } from "@/store/checkout";
import { useCartCount, useResolvedLines } from "@/hooks/useCartView";
import { usePreferences } from "@/store/preferences";

/**
 * Slide-over cart. Mounting locks body scroll, and Escape or the scrim closes it, so the
 * drawer never traps a keyboard user.
 */
export function CartDrawer() {
  const open = useCart((state) => state.drawerOpen);
  const close = useCart((state) => state.closeDrawer);
  const setQty = useCart((state) => state.setQty);
  const remove = useCart((state) => state.remove);
  const lines = useResolvedLines();
  const count = useCartCount();
  const currency = usePreferences((state) => state.currency);
  const shippingOptionId = useCheckoutDraft((state) => state.shippingOptionId);

  const subtotal = lines.reduce((sum, line) => sum + line.lineTotalUsd, 0);
  const freeThreshold = findShippingOption(shippingOptionId).freeOverUsd;
  const remainingForFree = freeThreshold ? Math.max(0, freeThreshold - subtotal) : 0;
  const progress = freeThreshold ? Math.min(100, (subtotal / freeThreshold) * 100) : 0;

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, close]);

  return (
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Shopping cart">
          <motion.button
            type="button"
            aria-label="Close cart"
            className="absolute inset-0 bg-fg/45 backdrop-blur-[3px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={close}
          />

          <motion.aside
            className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col border-l border-line bg-canvas shadow-lift"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 340, damping: 36, mass: 0.9 }}
          >
            <header className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
              <div>
                <h2 className="font-display text-lg font-semibold">Your cart</h2>
                <p className="text-[13px] text-fg-muted">
                  {count} item{count === 1 ? "" : "s"}
                </p>
              </div>
              <button
                type="button"
                onClick={close}
                className="flex size-9 items-center justify-center rounded-full border border-line text-fg-muted transition hover:text-fg"
                aria-label="Close cart"
              >
                <X size={17} />
              </button>
            </header>

            {freeThreshold ? (
              <div className="border-b border-line bg-surface-2/70 px-5 py-3">
                <p className="text-[12.5px] text-fg-muted">
                  {remainingForFree > 0 ? (
                    <>
                      Add{" "}
                      <span className="font-semibold text-fg">{formatMoney(remainingForFree, currency)}</span>{" "}
                      for free standard delivery
                    </>
                  ) : (
                    <span className="font-semibold text-brand">Free standard delivery unlocked</span>
                  )}
                </p>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-3">
                  <motion.div
                    className="h-full rounded-full bg-brand"
                    initial={false}
                    animate={{ width: `${progress}%` }}
                    transition={{ type: "spring", stiffness: 210, damping: 30 }}
                  />
                </div>
              </div>
            ) : null}

            <div className="flex-1 overflow-y-auto px-5 py-4">
              {lines.length === 0 ? (
                <EmptyState
                  title="Nothing here yet"
                  description="Add a product and it will appear in this drawer."
                  action={
                    <ButtonLink to="/shop" onClick={close} size="sm">
                      Browse the catalogue
                    </ButtonLink>
                  }
                  className="border-0 bg-transparent py-8"
                />
              ) : (
                <ul className="space-y-3">
                  {lines.map((line) => (
                    <li
                      key={line.productId}
                      className="flex gap-3 rounded-2xl border border-line bg-surface p-3"
                    >
                      <ProductArt
                        product={line.product}
                        className="size-20 shrink-0"
                        rounded="rounded-xl"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold">{line.product.name}</p>
                            <p className="text-[12px] text-fg-faint">{line.product.brand}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => remove(line.productId)}
                            aria-label={`Remove ${line.product.name}`}
                            className="text-fg-faint transition hover:text-danger"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>

                        <div className="mt-2.5 flex items-center justify-between gap-2">
                          <QtyStepper
                            size="sm"
                            value={line.qty}
                            max={line.product.stock}
                            onChange={(next) => setQty(line.productId, next)}
                          />
                          <Money usd={line.lineTotalUsd} className="text-sm font-semibold" />
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {lines.length > 0 ? (
              <footer className="space-y-3 border-t border-line bg-surface px-5 py-4">
                <dl className="space-y-1.5 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-fg-muted">Subtotal</dt>
                    <dd>
                      <Money usd={subtotal} />
                    </dd>
                  </div>
                  <p className="text-[12px] text-fg-faint">
                    Delivery and tax are calculated at checkout.
                  </p>
                </dl>
                <ButtonLink to="/checkout" onClick={close} fullWidth size="lg">
                  Checkout
                  <ArrowRight size={17} />
                </ButtonLink>
                <button
                  type="button"
                  onClick={close}
                  className="w-full text-center text-[13px] text-fg-muted transition hover:text-fg"
                >
                  Continue shopping
                </button>
              </footer>
            ) : null}
          </motion.aside>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
