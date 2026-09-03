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
import { useI18n } from "@/i18n";

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
  const { t, dict } = useI18n();
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
                  {session.notice ?? t("payment.noLongerPayable")}
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
                <p className="text-sm font-semibold">{t("payment.paymentReceived")}</p>
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
            {expired ? t("payment.closed") : paid ? t("payment.settled") : t("payment.expires")}
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
            {t("payment.payExactly")}
          </p>
          <p className="text-sheen font-display text-4xl font-semibold tracking-tight tabular-nums">
            {amountLabel}
          </p>
          <p className="mt-1 text-[13px] text-fg-muted">
            {currency === "USD"
              ? t("payment.approxOther", { amount: formatMoney(amountUsd, "KHR") })
              : t("payment.approxOther", { amount: formatMoney(amountUsd, "USD") })}
          </p>
        </div>

        <ol className="space-y-2.5">
          {dict.payment.steps.map((step, index) => (
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
            {t("checkout.billReferenceNote", { reference: billNumber })}
          </p>
        </div>

        {session.provider === "sandbox" ? (
          <div className="rounded-2xl border border-dashed border-gold/45 bg-gold/6 p-4">
            <p className="mb-1 flex items-center gap-2 text-[13px] font-semibold text-gold">
              <Zap size={14} />
              {t("payment.sandboxTitle")}
            </p>
            <p className="mb-3 text-[12.5px] text-fg-muted">
              {t("payment.sandboxBody")}
            </p>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" onClick={session.confirmNow} disabled={paid || expired}>
                <Smartphone size={14} />
                {t("payment.simulate")}
              </Button>
              <Button size="sm" variant="outline" onClick={session.expireNow} disabled={paid || expired}>
                {t("payment.forceExpire")}
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
  const { t, locale } = useI18n();
  let icon = <LoaderCircle size={16} className="animate-spin text-brand" />;
  let text = t("payment.waiting");
  let tone = "border-line bg-surface-2 text-fg-muted";

  if (paid) {
    icon = <CircleCheck size={16} className="text-brand" />;
    text = t("payment.buildingReceipt");
    tone = "border-brand/35 bg-brand/8 text-brand";
  } else if (expired) {
    icon = <CircleAlert size={16} className="text-danger" />;
    text = session.notice ?? t("payment.expiredNotice");
    tone = "border-danger/35 bg-danger/8 text-danger";
  } else if (session.starting) {
    text = t("payment.creating");
  }

  return (
    <div className={cn("flex items-center gap-2.5 rounded-2xl border px-4 py-3 text-[13px]", tone)}>
      {icon}
      <span className="flex-1 font-medium">{text}</span>
      {!paid && !expired ? (
        <span className="flex items-center gap-1.5 text-[10.5px] font-semibold tracking-[0.14em] text-brand uppercase">
          <span className="size-1.5 animate-blink rounded-full bg-brand" aria-hidden="true" />
          {t("payment.live")}
        </span>
      ) : null}
      {session.lastCheckedAt && !paid && !expired ? (
        <span className="text-[11.5px] text-fg-faint">
          {t("payment.checked", { time: new Date(session.lastCheckedAt).toLocaleTimeString(locale) })}
        </span>
      ) : null}
    </div>
  );
}
