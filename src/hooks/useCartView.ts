import { useMemo } from "react";

import { getProductById } from "@/data/products";
import { computeTotals } from "@/lib/pricing";
import { cartCount, useCart } from "@/store/cart";
import type { ResolvedCartLine, ShippingOptionId, Totals } from "@/types";

/** Cart lines joined against the catalogue; ids that no longer exist drop out silently. */
export function useResolvedLines(): ResolvedCartLine[] {
  const lines = useCart((state) => state.lines);
  return useMemo(
    () =>
      lines.flatMap((line) => {
        const product = getProductById(line.productId);
        if (!product) return [];
        return [{ ...line, product, lineTotalUsd: product.priceUsd * line.qty }];
      }),
    [lines],
  );
}

export function useCartCount(): number {
  const lines = useCart((state) => state.lines);
  return cartCount(lines);
}

export function useCartTotals(
  shippingOptionId: ShippingOptionId,
  promoCode?: string | null,
): Totals {
  const resolved = useResolvedLines();
  return useMemo(
    () => computeTotals(resolved, shippingOptionId, promoCode),
    [resolved, shippingOptionId, promoCode],
  );
}
