/**
 * Payment provider boundary.
 *
 * Everything the UI knows about "did the customer pay?" flows through this module.
 * With `VITE_PAYMENT_API_BASE` unset the module runs an in-memory sandbox simulator so
 * the storefront is demoable offline. Point it at a real service and the same three
 * functions call HTTP endpoints instead — no component changes required.
 */

import type { CurrencyCode, PaymentStatus } from "@/types";

export interface PaymentIntentRequest {
  billNumber: string;
  /** Amount expressed in `currency`, exactly as encoded in EMVCo field 54. */
  amount: number;
  currency: CurrencyCode;
  /** EMVCo payload rendered into the QR. */
  qrPayload: string;
  /** Seconds the QR stays payable. */
  expiresInSeconds: number;
}

export interface PaymentIntent {
  billNumber: string;
  provider: ProviderName;
  createdAt: string;
  expiresAt: string;
  qrPayload: string;
}

export type ProviderName = "sandbox" | "live";

export interface PaymentStatusResult {
  status: PaymentStatus;
  paidAt?: string;
  method?: string;
  providerRef?: string;
  /** Non-fatal: a failed lookup keeps the QR alive and reports why. */
  lookupError?: string;
}

const RAW_BASE = import.meta.env.VITE_PAYMENT_API_BASE?.trim() ?? "";
export const API_BASE = RAW_BASE.replace(/\/+$/, "");
export const paymentProvider: ProviderName = API_BASE ? "live" : "sandbox";

interface SandboxRecord {
  amount: number;
  currency: CurrencyCode;
  settleAt: number;
  paidAt?: string;
  expired: boolean;
}

const sandbox = new Map<string, SandboxRecord>();

/** Deterministic-ish auto-settle window so the happy path demonstrates itself. */
const AUTO_SETTLE_MIN_MS = 12_000;
const AUTO_SETTLE_SPAN_MS = 14_000;

export async function createPaymentIntent(request: PaymentIntentRequest): Promise<PaymentIntent> {
  const now = Date.now();
  const expiresAt = new Date(now + request.expiresInSeconds * 1000).toISOString();

  if (paymentProvider === "live") {
    const response = await fetch(`${API_BASE}/payment-intents`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        billNumber: request.billNumber,
        amount: request.amount,
        currency: request.currency,
        qrPayload: request.qrPayload,
        expiresIn: request.expiresInSeconds,
      }),
    });
    if (!response.ok) {
      throw new Error(`Payment service responded ${response.status}`);
    }
    const data = (await response.json()) as { expiresAt?: string; qrPayload?: string };
    return {
      billNumber: request.billNumber,
      provider: "live",
      createdAt: new Date(now).toISOString(),
      expiresAt: data.expiresAt ?? expiresAt,
      qrPayload: data.qrPayload ?? request.qrPayload,
    };
  }

  sandbox.set(request.billNumber, {
    amount: request.amount,
    currency: request.currency,
    settleAt: now + AUTO_SETTLE_MIN_MS + Math.random() * AUTO_SETTLE_SPAN_MS,
    expired: false,
  });

  return {
    billNumber: request.billNumber,
    provider: "sandbox",
    createdAt: new Date(now).toISOString(),
    expiresAt,
    qrPayload: request.qrPayload,
  };
}

export async function fetchPaymentStatus(billNumber: string): Promise<PaymentStatusResult> {
  if (paymentProvider === "live") {
    try {
      const response = await fetch(
        `${API_BASE}/payment-intents/${encodeURIComponent(billNumber)}/status`,
        { headers: { accept: "application/json" } },
      );
      if (!response.ok) {
        return { status: "awaiting_payment", lookupError: `Payment service responded ${response.status}` };
      }
      const data = (await response.json()) as {
        status?: PaymentStatus;
        paidAt?: string;
        method?: string;
        providerRef?: string;
      };
      return {
        status: data.status ?? "awaiting_payment",
        paidAt: data.paidAt,
        method: data.method,
        providerRef: data.providerRef,
      };
    } catch {
      return { status: "awaiting_payment", lookupError: "Cannot reach the payment service" };
    }
  }

  const record = sandbox.get(billNumber);
  if (!record) {
    return { status: "draft", lookupError: "No sandbox intent for this bill number" };
  }
  if (record.paidAt) {
    return {
      status: "paid",
      paidAt: record.paidAt,
      method: record.currency === "KHR" ? "KHQR · Bakong (KHR)" : "KHQR · Bakong (USD)",
      providerRef: `SBX-${billNumber}`,
    };
  }
  if (record.expired) {
    return { status: "expired" };
  }
  if (Date.now() >= record.settleAt) {
    record.paidAt = new Date().toISOString();
    return {
      status: "paid",
      paidAt: record.paidAt,
      method: record.currency === "KHR" ? "KHQR · Bakong (KHR)" : "KHQR · Bakong (USD)",
      providerRef: `SBX-${billNumber}`,
    };
  }
  return { status: "awaiting_payment" };
}

/** Sandbox-only: acts as the payer's bank pushing a settlement notification. */
export function simulatePayerPayment(billNumber: string): void {
  const record = sandbox.get(billNumber);
  if (!record || record.paidAt) return;
  record.paidAt = new Date().toISOString();
  record.settleAt = Date.now();
}

/** Sandbox-only: exercise the expiry path without waiting out the window. */
export function simulateExpiry(billNumber: string): void {
  const record = sandbox.get(billNumber);
  if (!record) return;
  record.expired = true;
}

export function isLiveProvider(): boolean {
  return paymentProvider === "live";
}
