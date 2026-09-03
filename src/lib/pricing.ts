import type { ResolvedCartLine, ShippingOption, ShippingOptionId, Totals } from "@/types";

/** Cambodian GST/VAT applied at checkout in this demo. */
export const VAT_RATE = 0.1;

export const SHIPPING_OPTIONS: ShippingOption[] = [
  {
    id: "standard",
    label: "Standard delivery",
    eta: "2–4 working days · Phnom Penh",
    priceUsd: 3,
    freeOverUsd: 150,
  },
  {
    id: "express",
    label: "Same-day express",
    eta: "Today before 18:00 · BKK1 only",
    priceUsd: 7,
  },
  {
    id: "pickup",
    label: "Store pickup",
    eta: "Flagship counter · ready in 2 hours",
    priceUsd: 0,
  },
];

export function findShippingOption(id: ShippingOptionId): ShippingOption {
  return SHIPPING_OPTIONS.find((option) => option.id === id) ?? SHIPPING_OPTIONS[0];
}

export interface PromoRule {
  code: string;
  kind: "percent" | "fixed";
  /** Percent (0–100) for `percent`, USD amount for `fixed`. */
  value: number;
  label: string;
  minSubtotalUsd?: number;
  /** Removes delivery cost instead of discounting goods. */
  freeShipping?: boolean;
}

export const PROMOS: PromoRule[] = [
  {
    code: "KHQR10",
    kind: "percent",
    value: 10,
    label: "10% off when you pay by KHQR",
    minSubtotalUsd: 100,
  },
  {
    code: "SAKOR5",
    kind: "fixed",
    value: 5,
    label: "$5 off your basket",
    minSubtotalUsd: 50,
  },
  {
    code: "FREESHIP",
    kind: "fixed",
    value: 0,
    label: "Free delivery on any order",
    freeShipping: true,
  },
];

export function findPromo(code?: string | null): PromoRule | undefined {
  if (!code) return undefined;
  const normalised = code.trim().toUpperCase();
  return PROMOS.find((promo) => promo.code === normalised);
}

/** Returns a human-readable rejection reason, or `null` when the code is usable. */
export function promoRejection(code: string, subtotalUsd: number): string | null {
  const trimmed = code.trim();
  if (!trimmed) return "Enter a promo code";
  const promo = findPromo(trimmed);
  if (!promo) return `“${trimmed.toUpperCase()}” is not a valid code`;
  if (promo.minSubtotalUsd && subtotalUsd < promo.minSubtotalUsd) {
    return `${promo.code} needs a ${promo.minSubtotalUsd} USD subtotal or more`;
  }
  return null;
}

export function shippingCost(
  shippingId: ShippingOptionId,
  subtotalUsd: number,
  promo?: PromoRule,
): number {
  const option = findShippingOption(shippingId);
  if (promo?.freeShipping) return 0;
  if (option.freeOverUsd && subtotalUsd >= option.freeOverUsd) return 0;
  return option.priceUsd;
}

/**
 * Single source of truth for order money. Both the cart page and checkout call this so
 * the figures — and therefore the QR amount — can never drift apart.
 */
export function computeTotals(
  lines: ResolvedCartLine[],
  shippingId: ShippingOptionId,
  promoCode?: string | null,
): Totals {
  const subtotalUsd = lines.reduce((sum, line) => sum + line.lineTotalUsd, 0);
  const promo = findPromo(promoCode);
  const usable = promo && (!promo.minSubtotalUsd || subtotalUsd >= promo.minSubtotalUsd);

  let discountUsd = 0;
  if (usable && promo && promo.kind === "percent") {
    discountUsd = (subtotalUsd * promo.value) / 100;
  } else if (usable && promo && promo.kind === "fixed") {
    discountUsd = Math.min(promo.value, subtotalUsd);
  }

  const netUsd = Math.max(0, subtotalUsd - discountUsd);
  const shippingUsd = lines.length > 0 ? shippingCost(shippingId, subtotalUsd, promo) : 0;
  const taxUsd = netUsd * VAT_RATE;
  const totalUsd = netUsd + shippingUsd + taxUsd;

  const round = (value: number) => Math.round(value * 100) / 100;

  return {
    subtotalUsd: round(subtotalUsd),
    discountUsd: round(discountUsd),
    shippingUsd: round(shippingUsd),
    taxUsd: round(taxUsd),
    totalUsd: round(totalUsd),
  };
}
