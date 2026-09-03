import { useEffect, useMemo, useRef, useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { useSearchParams } from "react-router-dom";

import { ProductGrid, ProductGridSkeleton } from "@/components/catalog/ProductGrid";
import { Button } from "@/components/ui/Button";
import { CATEGORIES, PRICE_BOUNDS_USD, PRODUCTS, searchProducts } from "@/data/products";
import { formatMoney } from "@/lib/format";
import { chipClasses } from "@/lib/styles";
import { usePreferences } from "@/store/preferences";
import type { CategoryId } from "@/types";

type SortKey = "featured" | "price-asc" | "price-desc" | "rating" | "newest";

const SORTS: Array<{ value: SortKey; label: string }> = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "rating", label: "Highest rated" },
  { value: "newest", label: "Newest in" },
];

const BADGE_PRIORITY: Record<string, number> = { new: 0, limited: 1, bestseller: 2 };

export function ShopPage() {
  const [params, setParams] = useSearchParams();
  const currency = usePreferences((state) => state.currency);

  const query = params.get("q") ?? "";
  const activeCategory = params.get("category") as CategoryId | null;
  const sort = (params.get("sort") as SortKey | null) ?? "featured";
  const maxPrice = Number(params.get("max") ?? PRICE_BOUNDS_USD.max);
  const inStockOnly = params.get("stock") === "in";

  // Brief skeleton on every filter change: the grid would otherwise jump between
  // heights as cards mount, which reads as a glitch rather than a response.
  const [settling, setSettling] = useState(false);
  const settleTimer = useRef<number | null>(null);

  function pulseSettling() {
    setSettling(true);
    if (settleTimer.current !== null) window.clearTimeout(settleTimer.current);
    settleTimer.current = window.setTimeout(() => setSettling(false), 220);
  }

  useEffect(
    () => () => {
      if (settleTimer.current !== null) window.clearTimeout(settleTimer.current);
    },
    [],
  );

  const results = useMemo(() => {
    let list = searchProducts(query);
    if (activeCategory) list = list.filter((product) => product.category === activeCategory);
    list = list.filter((product) => product.priceUsd <= maxPrice);
    if (inStockOnly) list = list.filter((product) => product.stock > 0);

    const sorted = [...list];
    switch (sort) {
      case "price-asc":
        sorted.sort((a, b) => a.priceUsd - b.priceUsd);
        break;
      case "price-desc":
        sorted.sort((a, b) => b.priceUsd - a.priceUsd);
        break;
      case "rating":
        sorted.sort((a, b) => b.rating - a.rating || b.reviews - a.reviews);
        break;
      case "newest":
        sorted.sort(
          (a, b) => (BADGE_PRIORITY[a.badge ?? ""] ?? 9) - (BADGE_PRIORITY[b.badge ?? ""] ?? 9),
        );
        break;
      default:
        break;
    }
    return sorted;
  }, [query, activeCategory, maxPrice, inStockOnly, sort]);

  function update(patch: Record<string, string | null>) {
    const next = new URLSearchParams(params);
    let changed = false;
    for (const [key, value] of Object.entries(patch)) {
      const before = next.get(key);
      if (value === null || value === "") {
        if (next.has(key)) {
          next.delete(key);
          changed = true;
        }
      } else if (before !== value) {
        next.set(key, value);
        changed = true;
      }
    }
    if (!changed) return;
    pulseSettling();
    setParams(next, { replace: true });
  }

  const filtersActive = Boolean(query) || Boolean(activeCategory) || inStockOnly || maxPrice < PRICE_BOUNDS_USD.max;

  return (
    <div className="mx-auto max-w-[88rem] px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-8">
        <p className="text-[12px] font-semibold tracking-[0.16em] text-fg-faint uppercase">
          Catalogue
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          {query ? `Results for “${query}”` : (CATEGORIES.find((c) => c.id === activeCategory)?.label ?? "Every product")}
        </h1>
        <p className="mt-2 text-sm text-fg-muted">
          {results.length} of {PRODUCTS.length} products
          {filtersActive ? " · filtered" : ""}
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="glass space-y-6 self-start rounded-card border border-line p-5 shadow-soft lg:sticky lg:top-28">
          <div>
            <h2 className="mb-3 flex items-center gap-2 text-[13px] font-semibold tracking-wide uppercase">
              <SlidersHorizontal size={14} className="text-brand" />
              Category
            </h2>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className={chipClasses(!activeCategory)}
                onClick={() => update({ category: null })}
              >
                All
              </button>
              {CATEGORIES.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  className={chipClasses(activeCategory === category.id)}
                  onClick={() => update({ category: category.id })}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label
              htmlFor="max-price"
              className="mb-2 flex items-center justify-between text-[13px] font-semibold tracking-wide uppercase"
            >
              Max price
              <span className="font-medium text-brand normal-case tabular-nums">
                {formatMoney(maxPrice, currency)}
              </span>
            </label>
            <input
              id="max-price"
              type="range"
              min={PRICE_BOUNDS_USD.min}
              max={PRICE_BOUNDS_USD.max}
              step={10}
              value={maxPrice}
              onChange={(event) => update({ max: event.target.value })}
              className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-surface-3 accent-[var(--brand)]"
            />
            <p className="mt-1.5 text-[12px] text-fg-faint">
              {formatMoney(PRICE_BOUNDS_USD.min, currency)} – {formatMoney(PRICE_BOUNDS_USD.max, currency)}
            </p>
          </div>

          <div>
            <h2 className="mb-3 text-[13px] font-semibold tracking-wide uppercase">Availability</h2>
            <label className="flex cursor-pointer items-center gap-2.5 text-sm text-fg-muted">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(event) => update({ stock: event.target.checked ? "in" : null })}
                className="size-4 rounded border-line-strong bg-surface accent-[var(--brand)]"
              />
              In stock only
            </label>
          </div>

          {filtersActive ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                update({ q: null, category: null, max: null, stock: null, sort: null })
              }
            >
              <X size={14} />
              Clear filters
            </Button>
          ) : null}
        </aside>

        <div>
          <div className="mb-5 flex items-center justify-between gap-4">
            <p className="text-[13px] text-fg-faint">
              {settling ? "Updating…" : `${results.length} shown`}
            </p>
            <label className="flex items-center gap-2 text-[13px] text-fg-muted">
              Sort
              <select
                value={sort}
                onChange={(event) => update({ sort: event.target.value })}
                className="h-9 rounded-full border border-line bg-surface px-3 text-[13px] font-medium text-fg focus:border-brand focus:outline-none"
              >
                {SORTS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {settling ? (
            <ProductGridSkeleton count={8} />
          ) : results.length > 0 ? (
            <ProductGrid products={results} columns="default" />
          ) : (
            <div className="rounded-card border border-dashed border-line-strong bg-surface-2/60 px-6 py-16 text-center">
              <h2 className="font-display text-lg font-semibold">No products match those filters</h2>
              <p className="mx-auto mt-2 max-w-sm text-sm text-fg-muted">
                Try widening the price ceiling or clearing the search term.
              </p>
              <Button
                className="mt-5"
                variant="outline"
                onClick={() => update({ q: null, category: null, max: null, stock: null })}
              >
                Reset filters
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
