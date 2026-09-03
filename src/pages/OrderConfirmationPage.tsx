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
import { useShippingOptions, useStatusLabels } from "@/i18n/domain";
import { useI18n } from "@/i18n";
import { formatDateTime, formatMoney } from "@/lib/format";
import { useOrders } from "@/store/orders";
import type { CurrencyCode, PaymentStatus } from "@/types";

const STATUS_TONE: Record<PaymentStatus, BadgeTone> = {
  draft: "neutral",
  awaiting_payment: "gold",
  paid: "brand",
  failed: "danger",
  expired: "neutral",
};

export function OrderConfirmationPage() {
  const { reference } = useParams();
  const orders = useOrders((state) => state.orders);
  const order = orders.find((candidate) => candidate.reference === reference);
  const shippingOptions = useShippingOptions();
  const statusLabels = useStatusLabels();
  const { t, locale } = useI18n();

  if (!order) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 sm:px-6">
        <EmptyState
          title={t("receipt.notFoundTitle")}
          description={t("receipt.notFoundBody", { reference: reference ?? "" })}
          action={
            <div className="flex gap-2">
              <ButtonLink to="/orders">{t("receipt.orderHistory")}</ButtonLink>
              <ButtonLink to="/shop" variant="outline">
                {t("receipt.backToShop")}
              </ButtonLink>
            </div>
          }
        />
      </div>
    );
  }

  const shipping =
    shippingOptions.find((option) => option.id === order.shippingOptionId) ?? shippingOptions[0];
  const paid = order.status === "paid";

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
              className="animate-pulse-ring flex size-12 shrink-0 items-center justify-center rounded-full bg-brand text-brand-contrast"
            >
              <CircleCheck size={24} strokeWidth={2} />
            </motion.span>
            <div>
              <h1 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
                {paid ? t("receipt.paidTitle") : t("receipt.savedTitle")}
              </h1>
              <p className="mt-1 text-sm text-fg-muted">
                {paid
                  ? t("receipt.thanksPaid", {
                      name: order.customer.fullName.split(" ")[0],
                      email: order.customer.email,
                    })
                  : t("receipt.thanksAwaiting")}
              </p>
            </div>
          </div>
          <Badge tone={STATUS_TONE[order.status]}>{statusLabels[order.status]}</Badge>
        </div>

        <dl className="mt-8 grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-3">
          <Fact label={t("receipt.orderNumber")} value={order.id} mono />
          <Fact label={t("receipt.billReference")} value={order.reference} mono />
          <Fact
            label={paid ? t("receipt.paid") : t("receipt.created")}
            value={formatDateTime(order.paidAt ?? order.createdAt, locale)}
          />
        </dl>

        <div className="mt-8">
          <h2 className="mb-4 font-display text-lg font-semibold">{t("receipt.nextSteps")}</h2>
          <ol className="grid gap-3 sm:grid-cols-3">
            <TimelineStep
              done
              icon={CircleCheck}
              title={t("receipt.stepPaid")}
              body={
                paid
                  ? t("receipt.stepPaidDone", {
                      time: order.paidAt ? formatDateTime(order.paidAt, locale) : "",
                    })
                  : t("receipt.stepPaidPending")
              }
            />
            <TimelineStep
              done={false}
              icon={Box}
              title={t("receipt.stepPacked")}
              body={t("receipt.stepPackedBody")}
            />
            <TimelineStep done={false} icon={Truck} title={shipping.label} body={shipping.eta} />
          </ol>
        </div>
      </motion.div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section className="rounded-card border border-line bg-surface p-5 sm:p-6">
          <h2 className="mb-4 font-display text-lg font-semibold">
            {t("receipt.items", { count: order.lines.length })}
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
                      {t("receipt.each", {
                        count: line.qty,
                        amount: formatMoney(line.unitPriceUsd, order.currency),
                      })}
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
            <MoneyRow
              label={t("summary.subtotal")}
              value={order.totals.subtotalUsd}
              currency={order.currency}
            />
            {order.totals.discountUsd > 0 ? (
              <MoneyRow
                label={`${t("summary.discount")}${order.promoCode ? ` · ${order.promoCode}` : ""}`}
                value={-order.totals.discountUsd}
                currency={order.currency}
                tone="brand"
              />
            ) : null}
            <MoneyRow
              label={t("summary.delivery")}
              value={order.totals.shippingUsd}
              currency={order.currency}
            />
            <MoneyRow
              label={t("summary.gst", { rate: 10 })}
              value={order.totals.taxUsd}
              currency={order.currency}
            />
            <div className="mt-3 flex items-center justify-between border-t border-line pt-3">
              <span className="font-display text-base font-semibold">{t("receipt.totalPaid")}</span>
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
              {t("receipt.deliveryTo")}
            </h2>
            <address className="text-[13.5px] leading-relaxed text-fg-muted not-italic">
              <span className="font-semibold text-fg">{order.customer.fullName}</span>
              <br />
              {order.customer.addressLine || t("receipt.storePickup")}
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
              {t("receipt.print")}
            </Button>
            <ButtonLink to="/orders" variant="ghost" fullWidth>
              {t("receipt.allOrders")}
            </ButtonLink>
            <ButtonLink to="/shop" fullWidth>
              {t("receipt.continueShopping")}
              <ArrowRight size={16} />
            </ButtonLink>
          </div>

          <p className="text-[12px] leading-relaxed text-fg-faint">
            {t("receipt.chargedBy", { merchant: MERCHANT.name, mcc: MERCHANT.mcc })}
          </p>
        </div>
      </div>

      <section className="mt-8 no-print">
        <h2 className="mb-3 flex items-center gap-2 font-display text-lg font-semibold">
          <QrCode size={17} className="text-brand" />
          {t("receipt.codeYouScanned")}
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
