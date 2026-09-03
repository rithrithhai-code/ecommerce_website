import { useMemo } from "react";

import { CATEGORIES } from "@/data/products";
import { PRODUCT_KM } from "@/data/products.km";
import { SHIPPING_OPTIONS } from "@/lib/pricing";
import { usePreferences } from "@/store/preferences";
import type { CategoryId, Product, ShippingOptionId } from "@/types";

import { useI18n, type Params, type TranslationKey } from ".";

/**
 * Domain strings that live in data files (`CATEGORIES`, `SHIPPING_OPTIONS`, products) are
 * stored as keys, never as prose. These hooks join them to the active locale, so no data
 * module has to know that a second language exists.
 */

export interface LocalizedCategory {
  id: CategoryId;
  label: string;
  blurb: string;
}

const CATEGORY_KEYS: Record<CategoryId, { label: TranslationKey; blurb: TranslationKey }> = {
  audio: { label: "categories.labels.audio", blurb: "categories.blurbs.audio" },
  computing: { label: "categories.labels.computing", blurb: "categories.blurbs.computing" },
  mobile: { label: "categories.labels.mobile", blurb: "categories.blurbs.mobile" },
  lifestyle: { label: "categories.labels.lifestyle", blurb: "categories.blurbs.lifestyle" },
};

export function useCategories(): LocalizedCategory[] {
  const { t } = useI18n();
  return useMemo(
    () =>
      CATEGORIES.map((category) => ({
        id: category.id,
        label: t(CATEGORY_KEYS[category.id].label),
        blurb: t(CATEGORY_KEYS[category.id].blurb),
      })),
    [t],
  );
}

export function useCategoryLabel(id?: CategoryId): string {
  const { t } = useI18n();
  return id ? t(CATEGORY_KEYS[id].label) : "";
}

export interface LocalizedShippingOption {
  id: ShippingOptionId;
  label: string;
  eta: string;
  priceUsd: number;
  freeOverUsd?: number;
}

const SHIPPING_KEYS: Record<ShippingOptionId, { label: TranslationKey; eta: TranslationKey }> = {
  standard: { label: "shipping.standard", eta: "shipping.standardEta" },
  express: { label: "shipping.express", eta: "shipping.expressEta" },
  pickup: { label: "shipping.pickup", eta: "shipping.pickupEta" },
};

export function useShippingOptions(): LocalizedShippingOption[] {
  const { t } = useI18n();
  return useMemo(
    () =>
      SHIPPING_OPTIONS.map((option) => ({
        ...option,
        label: t(SHIPPING_KEYS[option.id].label),
        eta: t(SHIPPING_KEYS[option.id].eta),
      })),
    [t],
  );
}

export function useShippingOption(id: ShippingOptionId): LocalizedShippingOption {
  const options = useShippingOptions();
  return options.find((option) => option.id === id) ?? options[0];
}

const PROMOS: Record<string, TranslationKey> = {
  KHQR10: "promo.khqr10",
  SAKOR5: "promo.sakor5",
  FREESHIP: "promo.freeship",
};

export function usePromoLabel(code: string): string {
  const { t } = useI18n();
  const key = PROMOS[code.toUpperCase()];
  return key ? t(key) : code;
}

type StatusKey =
  | "orders.statuses.draft"
  | "orders.statuses.awaiting_payment"
  | "orders.statuses.paid"
  | "orders.statuses.failed"
  | "orders.statuses.expired";

const STATUS_KEYS: Record<string, StatusKey> = {
  draft: "orders.statuses.draft",
  awaiting_payment: "orders.statuses.awaiting_payment",
  paid: "orders.statuses.paid",
  failed: "orders.statuses.failed",
  expired: "orders.statuses.expired",
};

export function useStatusLabels(): Record<string, string> {
  const { t } = useI18n();
  return useMemo(
    () =>
      Object.fromEntries(
        Object.entries(STATUS_KEYS).map(([status, key]) => [status, t(key)]),
      ) as Record<string, string>,
    [t],
  );
}

export interface LocalizedProduct {
  name: string;
  tagline: string;
  description: string;
  highlights: string[];
}

/**
 * Product text. Khmer overrides live in `data/products.km.ts` and fall back field by field,
 * so translating one product — or one field — is enough to ship it. Names stay in Latin
 * because that is how Cambodian shoppers search for them.
 */
export function useProductText(product?: Product): LocalizedProduct {
  const language = usePreferences((state) => state.language);
  const fallback: LocalizedProduct = {
    name: product?.name ?? "",
    tagline: product?.tagline ?? "",
    description: product?.description ?? "",
    highlights: product?.highlights ?? [],
  };
  if (!product || language !== "km") return fallback;

  const override = PRODUCT_KM[product.id];
  if (!override) return fallback;
  return {
    name: product.name,
    tagline: override.tagline ?? fallback.tagline,
    description: override.description ?? fallback.description,
    highlights: override.highlights ?? fallback.highlights,
  };
}

/** Product badges, which are data-driven and so need a key per value. */
const BADGE_KEYS = {
  new: { short: "product.badges.new", long: "product.badgeLong.new" },
  bestseller: { short: "product.badges.bestseller", long: "product.badgeLong.bestseller" },
  limited: { short: "product.badges.limited", long: "product.badgeLong.limited" },
} as const satisfies Record<
  NonNullable<Product["badge"]>,
  { short: TranslationKey; long: TranslationKey }
>;

export function useBadgeLabel(badge?: Product["badge"], long = false): string {
  const { t } = useI18n();
  if (!badge) return "";
  return t(long ? BADGE_KEYS[badge].long : BADGE_KEYS[badge].short);
}

/** Convenience for the few places that interpolate into a translated string. */
export function useFormat(): (key: TranslationKey, params?: Params) => string {
  const { t } = useI18n();
  return useMemo(() => t, [t]);
}
