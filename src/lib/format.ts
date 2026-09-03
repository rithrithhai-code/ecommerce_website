import type { CurrencyCode } from "@/types";

/** Indicative bank rate used by the demo. A real integration reads this from the PSP. */
export const USD_TO_KHR = 4100;

export const CURRENCY_SYMBOL: Record<CurrencyCode, string> = {
  USD: "$",
  KHR: "៛",
};

export const CURRENCY_LABEL: Record<CurrencyCode, string> = {
  USD: "US Dollar",
  KHR: "Cambodian Riel",
};

export function convertFromUsd(usd: number, currency: CurrencyCode): number {
  return currency === "USD" ? usd : usd * USD_TO_KHR;
}

/**
 * Display money. Riel has no minor units in practice, so KHR amounts round to whole
 * riels while USD keeps cents. Amounts encoded into the QR keep two decimals for both
 * currencies — see `emvAmount` in `lib/emvco.ts`.
 */
export function formatMoney(usd: number, currency: CurrencyCode): string {
  const amount = convertFromUsd(usd, currency);
  const fractionDigits = currency === "USD" ? 2 : 0;
  const grouped = amount.toLocaleString("en-US", {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });
  return `${CURRENCY_SYMBOL[currency]}${grouped}`;
}

export function formatUsd(usd: number): string {
  return formatMoney(usd, "USD");
}

/** The integer/decimal value handed to the payment rail for a given display currency. */
export function amountInCurrency(usd: number, currency: CurrencyCode): number {
  const converted = convertFromUsd(usd, currency);
  return currency === "USD"
    ? Math.round(converted * 100) / 100
    : Math.round(converted / 10) * 10;
}

export function formatDate(iso: string, locale = "en-GB"): string {
  return new Date(iso).toLocaleDateString(locale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(iso: string, locale = "en-GB"): string {
  return new Date(iso).toLocaleString(locale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Seconds remaining rendered as `m:ss` for the payment countdown. */
export function formatCountdown(seconds: number): string {
  const safe = Math.max(0, Math.floor(seconds));
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${mins}:${String(secs).padStart(2, "0")}`;
}

export function pluralize(count: number, singular: string, plural?: string): string {
  return count === 1 ? singular : (plural ?? `${singular}s`);
}

/** Truncate a long EMVCo string for display without breaking the middle of a tag. */
export function ellipsize(value: string, max = 64): string {
  return value.length <= max ? value : `${value.slice(0, max)}…`;
}
