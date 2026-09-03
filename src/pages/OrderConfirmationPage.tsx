import { motion } from "motion/react";
import { ArrowRight, Box, CircleCheck, Printer, QrCode, Receipt, Truck } from "lucide-react";
import { useParams } from "react-router-dom";

import { EmvcoInspector } from "@/components/checkout/EmvcoInspector";
import { ProductArt } from "@/components/catalog/ProductArt";
import { Badge } from "@/components/ui/Badge";
import type { BadgeTone } from "@/components/ui/Badge";
import { Button, ButtonLink } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { getProductById } from "@/data/products";
import { MERCHANT } from "@/data/merchant";
import { formatDateTime, formatMoney } from "@/lib/format";
import { findShippingOption } from "@/lib/pricing";
import { useOrders } from "@/store/orders";
import type { CurrencyCode, PaymentStatus } from "@/types";

const STATUS_META: Record<PaymentStatus, { label: string; tone: BadgeTone }> = {
  draft: { label: "Draft", tone: "neutral" },
  awaiting_payment: { label: "Awaiting payment", tone: "gold" },
  paid: { label: "Paid", tone: "brand" },
  failed: { label: "Payment failed", tone: "danger" },
  expired: { label: "Code expired", tone: "neutral" },
};

export function OrderConfirmationPage() {
  const { reference } = useParams();
  const orders = useOrders((state) => state.orders);
  const order = orders.find((candidate) => candidate.reference === reference);

  if (!order) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 sm:px-6">
        <EmptyState
          title="Receipt not found"
          description={`No order with reference ${reference ?? ""} is stored in this browser. Orders live in local storage, so a cleared storage or a different device will not show them.`}
          action={
            <div className="flex gap-2">
              <ButtonLink to="/orders">Order history</ButtonLink>
              <ButtonLink to="/shop" variant="outline">
                Back to shop
              </ButtonLink>
            </div>
          }
        />
      </div>
    );
  }

  const shipping = findShippingOption(order.shippingOptionId);
  const paid = order.status === "paid";
  const status = STATUS_META[order.status];

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="rounded-card border border-line bg-surface p-6 sm:p-8"
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <motion.span
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 320, damping: 18 }}
              className="flex size-12 shrink-0 items-center justify-center rounded-full bg-brand text-brand-contrast animate-pulse-ring"
            >
              <CircleCheck size={24} strokeWidth={2} />
            </motion.span>
            <div>
              <h1 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
                {paid ? "Payment received" : "Order saved"}
              </h1>
              <p className="mt-1 text-sm text-fg-muted">
                {paid
                  ? `Thank you, ${order.customer.fullName.split(" ")[0]}. A receipt is on its way to ${order.customer.email}.`
                  : "This order is still awaiting its KHQR settlement."}
              </p>
            </div>
          </div>
          <Badge tone={status.tone}>{status.label}</Badge>
        </div>

        <dl className="mt-8 grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-3">
          <Fact label="Order number" value={order.id} mono />
          <Fact label="KHQR bill reference" value={order.reference} mono />
          <Fact
            label={paid ? "Paid" : "Created"}
            value={formatDateTime(order.paidAt ?? order.createdAt)}
          />
        </dl>

        <div className="mt-8">
          <h2 className="mb-4 font-display text-lg font-semibold">What happens next</h2>
          <ol className="grid gap-3 sm:grid-cols-3">
            <TimelineStep
              done
              icon={CircleCheck}
              title="Payment confirmed"
              body={
                paid
                  ? `Settled ${order.paidAt ? formatDateTime(order.paidAt) : "just now"}`
                  : "Waiting for your bank"
              }
            />
            <TimelineStep
              done={false}
              icon={Box}
              title="Packed at the BKK1 counter"
              body="You get an SMS with the courier name before it leaves"
            />
            <TimelineStep
              done={false}
              icon={Truck}
              title={shipping.label}
              body={shipping.eta}
            />
          </ol>
        </div>
      </motion.div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section className="rounded-card border border-line bg-surface p-5 sm:p-6">
          <h2 className="mb-4 font-display text-lg font-semibold">
            {order.lines.length} item{order.lines.length === 1 ? "" : "s"} in this order
          </h2>
          <ul className="divide-y divide-line">
            {order.lines.map((line) => {
              const product = getProductById(line.productId);
              return (
                <li key={line.productId} className="flex items-center gap-4 py-3">
                  {product ? (
                    <ProductArt
                      product={product}
                      className="size-14 shrink-0"
                      rounded="rounded-xl"
                    />
                  ) : (
                    <span className="size-14 shrink-0 rounded-xl bg-surface-3" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[14.5px] font-semibold">{line.name}</p>
                    <p className="text-[12.5px] text-fg-faint">
                      {line.qty} × {formatMoney(line.unitPriceUsd, order.currency)}
                    </p>
                  </div>
                  <p className="text-sm font-semibold tabular-nums">
                    {formatMoney(line.qty * line.unitPriceUsd, order.currency)}
                  </p>
                </li>
              );
            })}
          </ul>

          <div className="mt-5 space-y-1.5 border-t border-line pt-4 text-sm">
            <MoneyRow label="Subtotal" value={order.totals.subtotalUsd} currency={order.currency} />
            {order.totals.discountUsd > 0 ? (
              <MoneyRow
                label={`Discount${order.promoCode ? ` · ${order.promoCode}` : ""}`}
                value={-order.totals.discountUsd}
                currency={order.currency}
                tone="brand"
              />
            ) : null}
            <MoneyRow
              label="Delivery"
              value={order.totals.shippingUsd}
              currency={order.currency}
            />
            <MoneyRow label="GST" value={order.totals.taxUsd} currency={order.currency} />
            <div className="mt-3 flex items-center justify-between border-t border-line pt-3">
              <span className="font-display text-base font-semibold">Total paid</span>
              <span className="font-display text-xl font-semibold tabular-nums">
                {formatMoney(order.totals.totalUsd, order.currency)}
              </span>
            </div>
          </div>
        </section>

        <div className="space-y-6">
          <section className="rounded-card border border-line bg-surface p-5">
            <h2 className="mb-2 flex items-center gap-2 font-display text-[15px] font-semibold">
              <Receipt size={16} className="text-brand" />
              Delivery to
            </h2>
            <address className="text-[13.5px] leading-relaxed text-fg-muted not-italic">
              <span className="font-semibold text-fg">{order.customer.fullName}</span>
              <br />
              {order.customer.addressLine || "Store pickup — BKK1 flagship"}
              <br />
              {order.customer.city} {order.customer.postalCode}
              <br />
              {order.customer.phone}
            </address>
            {order.customer.note ? (
              <p className="mt-3 rounded-xl bg-surface-2 px-3 py-2 text-[12.5px] text-fg-muted">
                “{order.customer.note}”
              </p>
            ) : null}
          </section>

          <div className="no-print flex flex-col gap-2">
            <Button variant="outline" onClick={() => window.print()} fullWidth>
              <Printer size={16} />
              Print receipt
            </Button>
            <ButtonLink to="/orders" variant="ghost" fullWidth>
              All orders
            </ButtonLink>
            <ButtonLink to="/shop" fullWidth>
              Continue shopping
              <ArrowRight size={16} />
            </ButtonLink>
          </div>

          <p className="text-[12px] leading-relaxed text-fg-faint">
            Charged by {MERCHANT.name} · MCC {MERCHANT.mcc}. Keep the bill reference for any
            support request — it is the key your bank uses too.
          </p>
        </div>
      </div>

      <section className="mt-8 no-print">
        <h2 className="mb-3 flex items-center gap-2 font-display text-lg font-semibold">
          <QrCode size={17} className="text-brand" />
          The code you scanned
        </h2>
        <EmvcoInspector payload={order.qrPayload} />
      </section>
    </div>
  );
}

function Fact({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="bg-surface px-4 py-3">
      <dt className="text-[11.5px] font-semibold tracking-wide text-fg-faint uppercase">{label}</dt>
      <dd className={mono ? "mt-1 font-mono text-[13px] break-all" : "mt-1 text-[13px]"}>{value}</dd>
    </div>
  );
}

function TimelineStep({
  done,
  icon: Icon,
  title,
  body,
}: {
  done: boolean;
  icon: typeof CircleCheck;
  title: string;
  body: string;
}) {
  return (
    <li
      className={
        done
          ? "rounded-2xl border border-brand/30 bg-brand/8 p-4"
          : "rounded-2xl border border-line bg-surface-2/60 p-4"
      }
    >
      <Icon size={16} className={done ? "text-brand" : "text-fg-faint"} />
      <p className="mt-2 text-[13.5px] font-semibold">{title}</p>
      <p className="mt-0.5 text-[12.5px] leading-snug text-fg-muted">{body}</p>
    </li>
  );
}

function MoneyRow({
  label,
  value,
  currency,
  tone,
}: {
  label: string;
  value: number;
  currency: CurrencyCode;
  tone?: "brand";
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className={tone === "brand" ? "text-brand" : "text-fg-muted"}>{label}</span>
      <span className="tabular-nums">
        {value < 0 ? "−" : ""}
        {formatMoney(Math.abs(value), currency)}
      </span>
    </div>
  );
}
