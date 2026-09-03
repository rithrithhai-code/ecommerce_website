import { Plus } from "lucide-react";
import { Link } from "react-router-dom";

import { ProductArt } from "@/components/catalog/ProductArt";
import { Badge } from "@/components/ui/Badge";
import { Money } from "@/components/ui/Money";
import { Stars } from "@/components/ui/Stars";
import { useCart } from "@/store/cart";
import { useSpotlight } from "@/hooks/useSpotlight";
import { cn } from "@/lib/cn";
import type { Product } from "@/types";

const BADGE_LABEL = {
  new: "New",
  bestseller: "Bestseller",
  limited: "Limited",
} as const;

export function ProductCard({ product, eager = false }: { product: Product; eager?: boolean }) {
  const add = useCart((state) => state.add);
  const onPointerMove = useSpotlight();
  const soldOut = product.stock <= 0;
  const href = `/product/${product.slug}`;

  return (
    <article
      onMouseMove={onPointerMove}
      className={cn(
        "group spotlight relative flex flex-col overflow-hidden rounded-card border border-line bg-surface",
        "transition duration-300 will-change-transform",
        "hover:-translate-y-1.5 hover:border-line-strong hover:shadow-lift",
      )}
    >
      {/* Gradient hairline that lights up with the card. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 z-10 h-px scale-x-0 bg-gradient-to-r from-transparent via-brand to-transparent transition-transform duration-500 group-hover:scale-x-100"
      />

      <Link to={href} className="relative block overflow-hidden" aria-label={product.name}>
        <div className="overflow-hidden">
          <ProductArt
            product={product}
            eager={eager}
            className="aspect-[4/5] w-full transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.05]"
            rounded="rounded-none"
          />
        </div>

        {/* Sheen that wipes across the artwork on hover. */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-[2] -translate-x-full bg-gradient-to-r from-transparent via-white/22 to-transparent opacity-0 transition-[transform,opacity] duration-[1100ms] ease-out group-hover:translate-x-full group-hover:opacity-100"
        />

        <span className="absolute top-3 left-3 z-[3] flex flex-wrap gap-1.5">
          {product.badge ? (
            <Badge
              tone={product.badge === "limited" ? "gold" : "brand"}
              className="animate-pop backdrop-blur-sm"
            >
              {BADGE_LABEL[product.badge]}
            </Badge>
          ) : null}
        </span>

        {soldOut ? (
          <span className="absolute inset-0 z-[3] flex items-center justify-center bg-canvas/72 backdrop-blur-[2px]">
            <span className="rounded-full bg-fg px-3.5 py-1.5 text-[12px] font-semibold text-canvas">
              Sold out
            </span>
          </span>
        ) : null}
      </Link>

      <div className="relative z-[3] flex flex-1 flex-col gap-2 p-4">
        <p className="text-[11px] font-semibold tracking-[0.14em] text-fg-faint uppercase">
          {product.brand}
        </p>

        <h3 className="font-display text-[15px] leading-snug font-semibold">
          <Link to={href} className="transition hover:text-brand">
            {product.name}
          </Link>
        </h3>

        <p className="line-clamp-2 text-[13px] text-fg-muted">{product.tagline}</p>

        <div className="mt-auto flex items-end justify-between gap-3 pt-3">
          <div className="space-y-1">
            <Stars rating={product.rating} reviews={product.reviews} />
            <p className="flex items-baseline gap-2 text-[15px] font-semibold">
              <Money usd={product.priceUsd} compareAtUsd={product.compareAtUsd} />
            </p>
          </div>

          <button
            type="button"
            onClick={() => add(product.id)}
            disabled={soldOut}
            aria-label={soldOut ? `${product.name} is sold out` : `Add ${product.name} to cart`}
            className={cn(
              "relative flex size-10 shrink-0 items-center justify-center rounded-full border transition duration-300",
              soldOut
                ? "cursor-not-allowed border-line text-fg-faint"
                : "border-transparent bg-brand text-brand-contrast shadow-soft hover:scale-105 hover:bg-brand-strong hover:shadow-glow active:translate-y-px",
            )}
          >
            <Plus size={18} strokeWidth={2.2} className="transition-transform duration-300 group-hover:rotate-90" />
          </button>
        </div>

        {!soldOut && product.stock <= 6 ? (
          <p className="flex items-center gap-1.5 text-[12px] font-medium text-gold">
            <span className="size-1.5 animate-blink rounded-full bg-gold" aria-hidden="true" />
            Only {product.stock} left
          </p>
        ) : null}
      </div>
    </article>
  );
}
