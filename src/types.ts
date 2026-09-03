/**
 * Shared domain types for the storefront.
 * Money is kept as a decimal number in the store's base unit (USD) and converted
 * for display; see `src/lib/format.ts` and `src/lib/pricing.ts`.
 */

import type { TranslationKey } from "@/i18n/en";

export type CurrencyCode = "USD" | "KHR";

/** Supported locales: English and Khmer. */
export type Lang = "en" | "km";

export type Theme = "light" | "dark";

export type CategoryId = "audio" | "computing" | "mobile" | "lifestyle";

/** Keys into the vector product-art map (see `src/components/catalog/ProductArt.tsx`). */
export type GlyphKey =
  | "headphones"
  | "speaker"
  | "laptop"
  | "monitor"
  | "keyboard"
  | "mouse"
  | "gamepad"
  | "smartphone"
  | "watch"
  | "camera"
  | "backpack";

export interface Product {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  /** Base price in USD. Display currency conversion happens at render time. */
  priceUsd: number;
  /** Optional pre-discount price used to render a strikethrough. */
  compareAtUsd?: number;
  category: CategoryId;
  brand: string;
  rating: number;
  reviews: number;
  stock: number;
  glyph: GlyphKey;
  /** Two hex stops used to build the product art gradient. */
  hue: [string, string];
  /**
   * Optional real photograph (`/images/foo.jpg` or a CDN URL). When present the
   * artwork layer is skipped, so product shots drop in without touching components.
   */
  image?: string;
  highlights: string[];
  specs: Record<string, string>;
  badge?: "new" | "bestseller" | "limited";
}

export interface CartLine {
  productId: string;
  qty: number;
}

export interface ResolvedCartLine extends CartLine {
  product: Product;
  lineTotalUsd: number;
}

export type ShippingOptionId = "standard" | "express" | "pickup";

export interface ShippingOption {
  id: ShippingOptionId;
  /** Translation keys resolved by `useShippingOptions` in src/i18n/domain.ts. */
  labelKey: TranslationKey;
  etaKey: TranslationKey;
  priceUsd: number;
  freeOverUsd?: number;
}

export interface CustomerDetails {
  fullName: string;
  email: string;
  phone: string;
  addressLine: string;
  city: string;
  postalCode: string;
  note: string;
}

export interface Totals {
  subtotalUsd: number;
  discountUsd: number;
  shippingUsd: number;
  taxUsd: number;
  totalUsd: number;
}

export type PaymentStatus = "draft" | "awaiting_payment" | "paid" | "failed" | "expired";

export interface OrderLine {
  productId: string;
  name: string;
  qty: number;
  unitPriceUsd: number;
}

export interface Order {
  id: string;
  /** Human-readable KHQR bill number, also used as the payment reference. */
  reference: string;
  createdAt: string;
  currency: CurrencyCode;
  lines: OrderLine[];
  totals: Totals;
  customer: CustomerDetails;
  shippingOptionId: ShippingOptionId;
  promoCode?: string;
  status: PaymentStatus;
  paidAt?: string;
  /** EMVCo / KHQR payload that was encoded into the QR at checkout. */
  qrPayload: string;
}

export interface MerchantProfile {
  name: string;
  city: string;
  country: "KH";
  postalCode: string;
  mcc: string;
  /** Bakong / KHQR proxy identifier encoded in Merchant Account Information. */
  proxyId: string;
  language: "en" | "km";
}

export type CurrencyAmount = {
  currency: CurrencyCode;
  value: number;
};
