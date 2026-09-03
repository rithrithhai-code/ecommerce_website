import { useState } from "react";
import { ArrowLeft, ArrowRight, CircleCheck, Lock, QrCode, ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { CustomerForm } from "@/components/checkout/CustomerForm";
import { EmvcoInspector } from "@/components/checkout/EmvcoInspector";
import { OrderSummaryPanel } from "@/components/checkout/OrderSummaryPanel";
import { PaymentPanel } from "@/components/checkout/PaymentPanel";
import { PromoField } from "@/components/checkout/PromoField";
import { ShippingPicker } from "@/components/checkout/ShippingPicker";
import { Button, ButtonLink } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { useCartTotals, useResolvedLines } from "@/hooks/useCartView";
import { usePaymentSession } from "@/hooks/usePaymentSession";
import { MERCHANT } from "@/data/merchant";
import { cn } from "@/lib/cn";
import { amountInCurrency, formatMoney } from "@/lib/format";
import { buildKhqrPayload, emvAmount } from "@/lib/emvco";
import { makeBillNumber, makeOrderId } from "@/lib/order";
import { findShippingOption } from "@/lib/pricing";
import { useCart } from "@/store/cart";
import { useCheckoutDraft, validateCustomer } from "@/store/checkout";
import { useOrders } from "@/store/orders";
import { usePreferences } from "@/store/preferences";
import type { Order } from "@/types";

interface Payable {
  billNumber: string;
  payload: string;
  amount: number;
}

const CONTACT_FIELDS = ["fullName", "email", "phone"] as const;
const ADDRESS_FIELDS = ["addressLine", "city", "postalCode"] as const;

export function CheckoutPage() {
  const navigate = useNavigate();
  const lines = useResolvedLines();
  const currency = usePreferences((state) => state.currency);
  const shippingOptionId = useCheckoutDraft((state) => state.shippingOptionId);
  const promoCode = useCheckoutDraft((state) => state.promoCode);
  const customer = useCheckoutDraft((state) => state.customer);
  const markTouched = useCheckoutDraft((state) => state.markTouched);
  const totals = useCartTotals(shippingOptionId, promoCode);
  const upsertOrder = useOrders((state) => state.upsert);
  const markPaid = useOrders((state) => state.setStatus);
  const clearCart = useCart((state) => state.clear);

  const [payable, setPayable] = useState<Payable | null>(null);
  const [stage, setStage] = useState<"details" | "pay">("details");

  const session = usePaymentSession((result) => {
    if (!payable) return;
    markPaid(payable.billNumber, "paid", result.paidAt ?? new Date().toISOString());
    clearCart();
    navigate(`/order/${payable.billNumber}`);
  });

  const addressRequired = shippingOptionId !== "pickup";

  function issueQrCode() {
    if (lines.length === 0) return;

    const validation = validateCustomer(customer, addressRequired);
    if (!validation.ok) {
      markTouched(
        addressRequired ? [...CONTACT_FIELDS, ...ADDRESS_FIELDS] : [...CONTACT_FIELDS],
      );
      document.getElementById("checkout-details")?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    const amount = amountInCurrency(totals.totalUsd, currency);
    const billNumber = makeBillNumber();
    const payload = buildKhqrPayload({
      merchant: MERCHANT,
      currency,
      amount,
      billNumber,
      pointOfInitialization: "12",
    });

    const order: Order = {
      id: makeOrderId(),
      reference: billNumber,
      createdAt: new Date().toISOString(),
      currency,
      lines: lines.map((line) => ({
        productId: line.productId,
        name: line.product.name,
        qty: line.qty,
        unitPriceUsd: line.product.priceUsd,
      })),
      totals,
      customer,
      shippingOptionId,
      promoCode: promoCode ?? undefined,
      status: "awaiting_payment",
      qrPayload: payload,
    };

    upsertOrder(order);
    setPayable({ billNumber, payload, amount });
    setStage("pay");
    void session.start({ billNumber, qrPayload: payload, amount, currency });
  }

  if (lines.length === 0 && stage === "details") {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 sm:px-6">
        <EmptyState
          title="Nothing to check out yet"
          description="Add a product first. Checkout builds the KHQR from the live cart total, so an empty cart has nothing to encode."
          action={
            <ButtonLink to="/shop" size="lg">
              <ShoppingCart size={17} />
              Go to the catalogue
            </ButtonLink>
          }
        />
      </div>
    );
  }

  const shipping = findShippingOption(shippingOptionId);

  return (
    <div className="mx-auto max-w-[88rem] px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-8">
        <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">Checkout</h1>
        <CheckoutSteps stage={stage} paid={session.status === "paid"} />
      </header>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-6">
          {stage === "details" || !payable ? (
            <>
              <section
                id="checkout-details"
                className="hairline-top relative overflow-hidden rounded-card border border-line bg-surface p-5 sm:p-6"
              >
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div>
                    <h2 className="font-display text-lg font-semibold">Where it goes</h2>
                    <p className="mt-1 text-[13px] text-fg-muted">
                      Used for the delivery label and the tax invoice only. No account is created.
                    </p>
                  </div>
                </div>
                <CustomerForm addressRequired={addressRequired} />
              </section>

              <section className="hairline-top relative overflow-hidden rounded-card border border-line bg-surface p-5 sm:p-6">
                <h2 className="mb-1 font-display text-lg font-semibold">Delivery method</h2>
                <p className="mb-4 text-[13px] text-fg-muted">
                  {shipping.label} · {shipping.eta}
                </p>
                <ShippingPicker />
              </section>

              <section className="hairline-top relative overflow-hidden rounded-card border border-line bg-surface p-5 sm:p-6">
                <h2 className="mb-3 font-display text-lg font-semibold">Ready to pay?</h2>
                <ul className="mb-5 space-y-2 text-[13.5px] text-fg-muted">
                  {[
                    "The QR encodes this exact total — nothing for the payer to type.",
                    "Works with Bakong and any partner-bank wallet that reads EMVCo codes.",
                    "No card number, CVV or expiry is ever collected or stored.",
                  ].map((point) => (
                    <li key={point} className="flex gap-2.5">
                      <CircleCheck size={16} className="mt-0.5 shrink-0 text-brand" />
                      {point}
                    </li>
                  ))}
                </ul>
                <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-surface-2 px-4 py-3">
                  <p className="text-[13px] text-fg-muted">
                    EMVCo field 54
                    <code className="ml-2 rounded bg-surface px-2 py-1 font-mono text-[13px] font-semibold text-fg">
                      {emvAmount(amountInCurrency(totals.totalUsd, currency), currency)}
                    </code>
                  </p>
                  <p className="text-right">
                    <span className="block text-[12px] text-fg-faint">Total payable</span>
                    <span className="font-display text-lg font-semibold tabular-nums">
                      {formatMoney(totals.totalUsd, currency)}
                    </span>
                  </p>
                </div>
              </section>
            </>
          ) : (
            <section className="hairline-top relative overflow-hidden rounded-card border border-line bg-surface p-5 sm:p-6">
              <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
                    <QrCode size={18} className="text-brand" />
                    Scan to pay
                  </h2>
                  <p className="mt-1 text-[13px] text-fg-muted">
                    Keep this tab open — the receipt appears the moment your bank settles.
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    session.cancel();
                    setStage("details");
                  }}
                >
                  <ArrowLeft size={14} />
                  Edit order
                </Button>
              </div>

              <PaymentPanel
                payload={payable.payload}
                billNumber={payable.billNumber}
                amountUsd={payable.amount}
                currency={currency}
                merchantName={MERCHANT.name}
                session={session}
                onRegenerate={issueQrCode}
              />

              <EmvcoInspector payload={payable.payload} className="mt-6" />
            </section>
          )}
        </div>

        <div className="lg:sticky lg:top-28 lg:self-start">
          <OrderSummaryPanel
            lines={lines}
            totals={totals}
            promoCode={promoCode}
            title="Payment summary"
            footer={
              stage === "details" || !payable ? (
                <>
                  <PromoField subtotalUsd={totals.subtotalUsd} />
                  <Button size="lg" fullWidth onClick={issueQrCode} loading={session.starting}>
                    <QrCode size={17} />
                    Generate KHQR
                  </Button>
                  <p className="flex items-start gap-2 text-[12px] leading-relaxed text-fg-faint">
                    <Lock size={13} className="mt-0.5 shrink-0" />
                    Demo build: the code is a valid EMVCo payload, but settlement is simulated
                    unless a payment API is configured.
                  </p>
                </>
              ) : (
                <div className="space-y-3">
                  <Button size="lg" fullWidth onClick={issueQrCode} loading={session.starting}>
                    <ArrowRight size={17} />
                    Regenerate code
                  </Button>
                  <ButtonLink to="/cart" variant="ghost" fullWidth size="sm">
                    Change basket
                  </ButtonLink>
                </div>
              )
            }
          />
        </div>
      </div>
    </div>
  );
}

function CheckoutSteps({ stage, paid }: { stage: "details" | "pay"; paid: boolean }) {
  const steps = [
    { key: "details", label: "Delivery details" },
    { key: "pay", label: "Scan KHQR" },
    { key: "receipt", label: "Receipt" },
  ] as const;

  const activeIndex = paid ? 2 : stage === "details" ? 0 : 1;

  return (
    <ol className="mt-5 flex flex-wrap items-center gap-2 text-[13px]">
      {steps.map((step, index) => (
        <li key={step.key} className="flex items-center gap-2">
          <span
            className={cn(
              "flex items-center gap-2 rounded-full border px-3 py-1.5 font-medium transition",
              index === activeIndex
                ? "border-brand bg-brand text-brand-contrast"
                : index < activeIndex
                  ? "border-brand/30 bg-brand/8 text-brand"
                  : "border-line bg-surface text-fg-faint",
            )}
          >
            <span className="tabular-nums">{index + 1}</span>
            {step.label}
          </span>
          {index < steps.length - 1 ? (
            <span className="h-px w-5 bg-line-strong" aria-hidden="true" />
          ) : null}
        </li>
      ))}
    </ol>
  );
}
