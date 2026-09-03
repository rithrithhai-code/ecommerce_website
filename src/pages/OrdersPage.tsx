import { CircleCheck, History, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";

import { Badge } from "@/components/ui/Badge";
import type { BadgeTone } from "@/components/ui/Badge";
import { Button, ButtonLink } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDateTime, formatMoney } from "@/lib/format";
import { useOrders } from "@/store/orders";
import type { PaymentStatus } from "@/types";

const STATUS_META: Record<PaymentStatus, { label: string; tone: BadgeTone }> = {
  draft: { label: "Draft", tone: "neutral" },
  awaiting_payment: { label: "Awaiting payment", tone: "gold" },
  paid: { label: "Paid", tone: "brand" },
  failed: { label: "Payment failed", tone: "danger" },
  expired: { label: "Code expired", tone: "neutral" },
};

export function OrdersPage() {
  const orders = useOrders((state) => state.orders);
  const clearHistory = useOrders((state) => state.clearHistory);

  if (orders.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 sm:px-6">
        <EmptyState
          title="No orders on this device"
          description="Checkout history is kept in this browser's local storage, so it starts empty. Complete a KHQR payment and the receipt appears here."
          action={<ButtonLink to="/shop">Start shopping</ButtonLink>}
        />
      </div>
    );
  }

  const paidCount = orders.filter((order) => order.status === "paid").length;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2.5 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            <History size={24} className="text-brand" />
            Order history
          </h1>
          <p className="mt-2 text-sm text-fg-muted">
            {orders.length} order{orders.length === 1 ? "" : "s"} · {paidCount} settled by KHQR
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={clearHistory}>
          <Trash2 size={14} />
          Clear history
        </Button>
      </header>

      <ul className="space-y-3">
        {orders.map((order) => {
          const status = STATUS_META[order.status];
          return (
            <li key={order.id}>
              <Link
                to={`/order/${order.reference}`}
                className="flex flex-wrap items-center gap-4 rounded-card border border-line bg-surface p-4 transition hover:-translate-y-0.5 hover:border-line-strong hover:shadow-soft"
              >
                <span
                  className={
                    order.status === "paid"
                      ? "flex size-10 items-center justify-center rounded-full bg-brand/10 text-brand"
                      : "flex size-10 items-center justify-center rounded-full bg-surface-3 text-fg-muted"
                  }
                >
                  {order.status === "paid" ? (
                    <CircleCheck size={18} />
                  ) : (
                    <span className="text-[13px] font-semibold tabular-nums">
                      {order.lines.length}
                    </span>
                  )}
                </span>

                <span className="min-w-0 flex-1">
                  <span className="block truncate font-mono text-[13px] text-fg-muted">
                    {order.reference}
                  </span>
                  <span className="block text-[13px] text-fg-faint">
                    {formatDateTime(order.createdAt)} · {order.lines.length} item
                    {order.lines.length === 1 ? "" : "s"}
                  </span>
                </span>

                <Badge tone={status.tone}>{status.label}</Badge>

                <span className="text-right">
                  <span className="block font-display text-[17px] font-semibold tabular-nums">
                    {formatMoney(order.totals.totalUsd, order.currency)}
                  </span>
                  <span className="block text-[11.5px] text-fg-faint">view receipt →</span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
