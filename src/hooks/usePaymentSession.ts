import { useCallback, useEffect, useRef, useState } from "react";

import {
  createPaymentIntent,
  fetchPaymentStatus,
  paymentProvider,
  simulateExpiry,
  simulatePayerPayment,
  type PaymentStatusResult,
} from "@/api/payment";
import { PAYMENT_WINDOW_SECONDS } from "@/lib/order";
import type { CurrencyCode, PaymentStatus } from "@/types";

const POLL_INTERVAL_MS = 2_000;

export interface StartArgs {
  billNumber: string;
  qrPayload: string;
  amount: number;
  currency: CurrencyCode;
}

export interface PaymentSession {
  status: PaymentStatus;
  provider: typeof paymentProvider;
  secondsLeft: number;
  expiresAt: string | null;
  paidAt: string | null;
  method: string | null;
  providerRef: string | null;
  notice: string | null;
  starting: boolean;
  lastCheckedAt: string | null;
  start: (args: StartArgs) => Promise<void>;
  cancel: () => void;
  /** Sandbox only: settle immediately, as the payer's bank would. */
  confirmNow: () => void;
  /** Sandbox only: jump to the expiry state. */
  expireNow: () => void;
}

/**
 * Owns one KHQR payment attempt: intent creation, countdown, status polling, and the
 * terminal states. Polling pauses while the tab is hidden and resumes on return, and
 * every timer is torn down on unmount so React StrictMode's double-mount is safe.
 */
export function usePaymentSession(onPaid?: (result: PaymentStatusResult) => void): PaymentSession {
  const [status, setStatus] = useState<PaymentStatus>("draft");
  const [secondsLeft, setSecondsLeft] = useState(PAYMENT_WINDOW_SECONDS);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [result, setResult] = useState<PaymentStatusResult | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);
  const [lastCheckedAt, setLastCheckedAt] = useState<string | null>(null);

  const billRef = useRef<string | null>(null);
  const deadlineRef = useRef<number>(0);
  const tickRef = useRef<number | null>(null);
  const pollRef = useRef<number | null>(null);
  const onPaidRef = useRef(onPaid);
  useEffect(() => {
    onPaidRef.current = onPaid;
  }, [onPaid]);

  const stopTimers = useCallback(() => {
    if (tickRef.current !== null) window.clearInterval(tickRef.current);
    if (pollRef.current !== null) window.clearInterval(pollRef.current);
    tickRef.current = null;
    pollRef.current = null;
  }, []);

  const settle = useCallback((next: PaymentStatusResult) => {
    setResult(next);
    setLastCheckedAt(new Date().toISOString());
    if (next.lookupError) setNotice(next.lookupError);
    else setNotice(null);

    if (next.status === "paid") {
      stopTimers();
      setStatus("paid");
      onPaidRef.current?.(next);
      return true;
    }
    if (next.status === "expired" || next.status === "failed") {
      stopTimers();
      setStatus(next.status);
      return true;
    }
    setStatus("awaiting_payment");
    return false;
  }, [stopTimers]);

  const poll = useCallback(async () => {
    const bill = billRef.current;
    if (!bill) return;
    try {
      const next = await fetchPaymentStatus(bill);
      settle(next);
    } catch {
      setNotice("Payment status lookup failed — retrying");
    }
  }, [settle]);

  const start = useCallback(
    async (args: StartArgs) => {
      stopTimers();
      billRef.current = args.billNumber;
      setStarting(true);
      setStatus("awaiting_payment");
      setNotice(null);
      setResult(null);
      setSecondsLeft(PAYMENT_WINDOW_SECONDS);

      try {
        const intent = await createPaymentIntent({
          billNumber: args.billNumber,
          qrPayload: args.qrPayload,
          amount: args.amount,
          currency: args.currency,
          expiresInSeconds: PAYMENT_WINDOW_SECONDS,
        });
        setExpiresAt(intent.expiresAt);
        deadlineRef.current = new Date(intent.expiresAt).getTime();

        tickRef.current = window.setInterval(() => {
          const remaining = Math.max(0, Math.round((deadlineRef.current - Date.now()) / 1000));
          setSecondsLeft(remaining);
          if (remaining <= 0) {
            stopTimers();
            setStatus("expired");
            setNotice("This QR code expired. Generate a new one to continue.");
          }
        }, 1_000);

        void poll();
        pollRef.current = window.setInterval(() => {
          if (document.hidden) return;
          void poll();
        }, POLL_INTERVAL_MS);
      } catch (error) {
        setStatus("failed");
        setNotice(error instanceof Error ? error.message : "Could not create the payment intent");
      } finally {
        setStarting(false);
      }
    },
    [poll, stopTimers],
  );

  const cancel = useCallback(() => {
    stopTimers();
    billRef.current = null;
    setStatus("draft");
    setNotice(null);
    setExpiresAt(null);
    setResult(null);
  }, [stopTimers]);

  const confirmNow = useCallback(() => {
    const bill = billRef.current;
    if (!bill || paymentProvider !== "sandbox") return;
    simulatePayerPayment(bill);
    void poll();
  }, [poll]);

  const expireNow = useCallback(() => {
    const bill = billRef.current;
    if (!bill || paymentProvider !== "sandbox") return;
    simulateExpiry(bill);
    void poll();
  }, [poll]);

  useEffect(() => stopTimers, [stopTimers]);

  return {
    status,
    provider: paymentProvider,
    secondsLeft,
    expiresAt,
    paidAt: result?.paidAt ?? null,
    method: result?.method ?? null,
    providerRef: result?.providerRef ?? null,
    notice,
    starting,
    lastCheckedAt,
    start,
    cancel,
    confirmNow,
    expireNow,
  };
}
