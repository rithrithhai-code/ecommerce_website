import { motion } from "motion/react";
import {
  CircleAlert,
  CircleCheck,
  Clock,
  LoaderCircle,
  RefreshCw,
  ShieldCheck,
  Smartphone,
  Zap,
} from "lucide-react";

import { KhqrCode } from "@/components/checkout/KhqrCode";
import { Button } from "@/components/ui/Button";
import { formatCountdown, formatMoney } from "@/lib/format";
import { cn } from "@/lib/cn";
import type { PaymentSession } from "@/hooks/usePaymentSession";
import type { CurrencyCode } from "@/types";

const STEPS = [
  "Open Bakong or any partner bank app with KHQR",
  "Tap Scan and point it at this code",
  `Confirm the amount — it is already filled in`,
  "Stay on this page until the receipt appears",
];

/**
 * The scan-to-pay surface: QR, countdown, live status, and (in sandbox only) the payer
 * simulator so the whole flow can be demonstrated without a bank relationship.
 */
export function PaymentPanel({
  payload,
  billNumber,
  amountUsd,
  currency,
  merchantName,
  session,
  onRegenerate,
}: {
  payload: string;
  billNumber: string;
  amountUsd: number;
  currency: CurrencyCode;
  merchantName: string;
  session: PaymentSession;
  onRegenerate: () => void;
}) {
  const amountLabel = formatMoney(amountUsd, currency);
  const expired = session.status === "expired" || session.status === "failed";
  const paid = session.status === "paid";
  const urgent = session.secondsLeft <= 120 && !paid && !expired;

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,340px)_1fr]">
      <div className="space-y-4">
        <KhqrCode
          payload={payload}
          amountLabel={amountLabel}
          merchantName={merchantName}
          scanning={!paid && !expired}
          overlay={
            expired ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-2xl bg-white/92 text-center"
              >
                <CircleAlert size={26} className="text-danger" />
                <p className="max-w-[15rem] px-3 text-[13px] font-medium text-fg">
                  {session.notice ?? "This code is no longer payable."}
                </p>
                <Button size="sm" onClick={onRegenerate}>
                  <RefreshCw size={14} />
                  New code
                </Button>
              </motion.div>
            ) : paid ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 22 }}
                className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-2xl bg-brand/94 text-brand-contrast"
              >
                <CircleCheck size={30} strokeWidth={1.8} />
                <p className="text-sm font-semibold">Payment received</p>
              </motion.div>
            ) : null
          }
        />

        <div
          className={cn(
            "flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-[13px]",
            urgent
              ? "border-danger/35 bg-danger/8"
              : paid
                ? "border-brand/35 bg-brand/8"
                : "border-line bg-surface-2",
          )}
        >
          <span className="inline-flex items-center gap-2 font-medium">
            <Clock size={14} className={urgent ? "text-danger" : "text-fg-muted"} />
            {expired ? "Code closed" : paid ? "Settled" : "Expires in"}
          </span>
          <span
            className={cn(
              "font-semibold tabular-nums",
              urgent && "text-danger",
              expired && "text-fg-faint line-through",
            )}
          >
            {formatCountdown(session.secondsLeft)}
          </span>
        </div>
      </div>

      <div className="space-y-5">
        <div>
          <p className="text-[12px] font-semibold tracking-[0.14em] text-fg-faint uppercase">
            Pay exactly
          </p>
          <p className="text-sheen font-display text-4xl font-semibold tracking-tight tabular-nums">
            {amountLabel}
          </p>
          <p className="mt-1 text-[13px] text-fg-muted">
            {currency === "USD"
              ? `≈ ${formatMoney(amountUsd, "KHR")} at the indicative rate`
              : `≈ ${formatMoney(amountUsd, "USD")} at the indicative rate`}
          </p>
        </div>

        <ol className="space-y-2.5">
          {STEPS.map((step, index) => (
            <li key={step} className="flex gap-3 text-sm text-fg-muted">
              <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-surface-3 text-[11px] font-semibold text-fg">
                {index + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>

        <StatusLine session={session} paid={paid} expired={expired} />

        <div className="flex items-start gap-2.5 rounded-2xl border border-line bg-surface-2/70 px-4 py-3 text-[12.5px] text-fg-muted">
          <ShieldCheck size={16} className="mt-0.5 shrink-0 text-brand" />
          <p>
            Bill reference{" "}
            <code className="rounded bg-surface px-1.5 py-0.5 font-mono text-[11.5px] text-fg">
              {billNumber}
            </code>{" "}
            is encoded in the QR, so the settlement notice is matched to this order without a
            manual lookup.
          </p>
        </div>

        {session.provider === "sandbox" ? (
          <div className="rounded-2xl border border-dashed border-gold/45 bg-gold/6 p-4">
            <p className="mb-1 flex items-center gap-2 text-[13px] font-semibold text-gold">
              <Zap size={14} />
              Sandbox controls
            </p>
            <p className="mb-3 text-[12.5px] text-fg-muted">
              The code above is a genuine EMVCo payload, but this build settles payments with a
              simulator. In live mode this block disappears and the bank's own push drives the
              status.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" onClick={session.confirmNow} disabled={paid || expired}>
                <Smartphone size={14} />
                Simulate payer confirming
              </Button>
              <Button size="sm" variant="outline" onClick={session.expireNow} disabled={paid || expired}>
                Force expiry
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function StatusLine({
  session,
  paid,
  expired,
}: {
  session: PaymentSession;
  paid: boolean;
  expired: boolean;
}) {
  let icon = <LoaderCircle size={16} className="animate-spin text-brand" />;
  let text = "Waiting for your bank to confirm…";
  let tone = "border-line bg-surface-2 text-fg-muted";

  if (paid) {
    icon = <CircleCheck size={16} className="text-brand" />;
    text = `Paid${session.method ? ` · ${session.method}` : ""}. Building your receipt…`;
    tone = "border-brand/35 bg-brand/8 text-brand";
  } else if (expired) {
    icon = <CircleAlert size={16} className="text-danger" />;
    text = session.notice ?? "Payment window closed.";
    tone = "border-danger/35 bg-danger/8 text-danger";
  } else if (session.starting) {
    text = "Creating the payment intent…";
  }

  return (
    <div className={cn("flex items-center gap-2.5 rounded-2xl border px-4 py-3 text-[13px]", tone)}>
      {icon}
      <span className="flex-1 font-medium">{text}</span>
      {!paid && !expired ? (
        <span className="flex items-center gap-1.5 text-[10.5px] font-semibold tracking-[0.14em] text-brand uppercase">
          <span className="size-1.5 animate-blink rounded-full bg-brand" aria-hidden="true" />
          live
        </span>
      ) : null}
      {session.lastCheckedAt && !paid && !expired ? (
        <span className="text-[11.5px] text-fg-faint">
          checked {new Date(session.lastCheckedAt).toLocaleTimeString("en-GB")}
        </span>
      ) : null}
    </div>
  );
}
