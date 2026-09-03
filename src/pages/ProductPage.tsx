import { useState } from "react";
import {
  ArrowLeft,
  Check,
  RotateCw,
  ShieldCheck,
  ShoppingBag,
  Truck,
  Zap,
} from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { ProductArt } from "@/components/catalog/ProductArt";
import { ProductGrid } from "@/components/catalog/ProductGrid";
import { Badge } from "@/components/ui/Badge";
import { Button, ButtonLink } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Money } from "@/components/ui/Money";
import { QtyStepper } from "@/components/ui/QtyStepper";
import { Stars } from "@/components/ui/Stars";
import { CATEGORY_LABEL, getProductBySlug, getRelated } from "@/data/products";
import { SUPPORT_CONTACT } from "@/data/merchant";
import { cn } from "@/lib/cn";
import { useCart } from "@/store/cart";
import type { Product } from "@/types";

/** Camera angles faked with transforms so the gallery is interactive without photo assets. */
const VIEWS = [
  { label: "Front", transform: "scale(1)" },
  { label: "Angle", transform: "scale(1.14) rotate(-6deg)" },
  { label: "Detail", transform: "scale(1.45) rotate(4deg)" },
  { label: "Flat", transform: "scale(0.86) rotate(0deg)" },
];

export function ProductPage() {
  const { slug } = useParams();
  const product = slug ? getProductBySlug(slug) : undefined;
  const navigate = useNavigate();
  const add = useCart((state) => state.add);
  const [qty, setQty] = useState(1);
  const [view, setView] = useState(0);

  if (!product) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 sm:px-6">
        <EmptyState
          title="That product is no longer listed"
          description="It may have been renamed or retired. The full catalogue is one click away."
          action={<ButtonLink to="/shop">Back to catalogue</ButtonLink>}
        />
      </div>
    );
  }

  const soldOut = product.stock <= 0;
  const discount = product.compareAtUsd
    ? Math.round(((product.compareAtUsd - product.priceUsd) / product.compareAtUsd) * 100)
    : 0;

  function buyNow(item: Product) {
    add(item.id, qty);
    navigate("/checkout");
  }

  return (
    <div className="mx-auto max-w-[88rem] px-4 py-8 sm:px-6 lg:px-8">
      <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-[13px] text-fg-faint">
        <Link to="/shop" className="inline-flex items-center gap-1.5 transition hover:text-brand">
          <ArrowLeft size={14} />
          Catalogue
        </Link>
        <span aria-hidden="true">/</span>
        <Link to={`/shop?category=${product.category}`} className="transition hover:text-brand">
          {CATEGORY_LABEL[product.category]}
        </Link>
        <span aria-hidden="true">/</span>
        <span className="truncate text-fg-muted">{product.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,460px)] lg:gap-16">
        {/* Gallery */}
        <div className="space-y-4">
          <div className="group relative overflow-hidden rounded-card border border-line bg-surface">
            <div className="aspect-square w-full overflow-hidden">
              <div
                className="size-full transition-transform duration-500 ease-out"
                style={{ transform: VIEWS[view].transform }}
              >
                <ProductArt product={product} eager rounded="rounded-none" className="size-full" />
              </div>
            </div>
            {discount > 0 ? (
              <span className="absolute top-4 left-4">
                <Badge tone="gold">−{discount}% this week</Badge>
              </span>
            ) : null}
          </div>

          <div className="flex gap-3" role="tablist" aria-label="Product views">
            {VIEWS.map((item, index) => (
              <button
                key={item.label}
                type="button"
                role="tab"
                aria-selected={index === view}
                onClick={() => setView(index)}
                className={cn(
                  "group relative h-20 w-20 overflow-hidden rounded-2xl border transition",
                  index === view
                    ? "border-brand ring-2 ring-brand/20"
                    : "border-line opacity-75 hover:opacity-100",
                )}
              >
                <div
                  className="size-full"
                  style={{ transform: item.transform }}
                >
                  <ProductArt product={product} rounded="rounded-none" className="size-full" />
                </div>
                <span className="absolute inset-x-0 bottom-0 bg-canvas/85 py-0.5 text-[10.5px] font-medium">
                  {item.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Buy column */}
        <div>
          <p className="text-[12px] font-semibold tracking-[0.16em] text-fg-faint uppercase">
            {product.brand}
          </p>
          <h1 className="mt-2 font-display text-3xl leading-tight font-semibold tracking-tight sm:text-4xl">
            {product.name}
          </h1>
          <p className="mt-2 text-[15px] text-fg-muted">{product.tagline}</p>

          <div className="mt-4 flex flex-wrap items-center gap-4">
            <Stars rating={product.rating} reviews={product.reviews} />
            {product.badge ? (
              <Badge tone={product.badge === "limited" ? "gold" : "brand"}>
                {product.badge === "new"
                  ? "Just landed"
                  : product.badge === "limited"
                    ? "Limited run"
                    : "Bestseller"}
              </Badge>
            ) : null}
          </div>

          <div className="mt-6 flex flex-wrap items-baseline gap-3">
            <Money
              usd={product.priceUsd}
              compareAtUsd={product.compareAtUsd}
              className="font-display text-4xl font-semibold tracking-tight tabular-nums"
              compareClassName="text-base line-through"
            />
            <span className="text-[13px] text-fg-faint">tax included where applicable</span>
          </div>

          <p className="mt-6 text-[15px] leading-relaxed text-fg-muted">{product.description}</p>

          <ul className="mt-6 grid gap-2 sm:grid-cols-2">
            {product.highlights.map((highlight) => (
              <li key={highlight} className="flex gap-2 text-[13.5px] text-fg-muted">
                <Check size={15} className="mt-0.5 shrink-0 text-brand" />
                {highlight}
              </li>
            ))}
          </ul>

          <div className="mt-8 rounded-card border border-line bg-surface p-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-[13px] font-semibold">
                  {soldOut ? (
                    <span className="text-danger">Out of stock</span>
                  ) : product.stock <= 6 ? (
                    <span className="text-gold">Only {product.stock} left</span>
                  ) : (
                    <span className="text-brand">In stock · ships today</span>
                  )}
                </p>
                <p className="mt-0.5 text-[12.5px] text-fg-faint">
                  Pay by KHQR at checkout, or reserve and collect in BKK1
                </p>
              </div>
              <QtyStepper value={qty} max={Math.max(1, product.stock)} onChange={setQty} />
            </div>

            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <Button
                size="lg"
                fullWidth
                disabled={soldOut}
                onClick={() => add(product.id, qty)}
              >
                <ShoppingBag size={17} />
                Add to cart
              </Button>
              <Button size="lg" variant="secondary" fullWidth disabled={soldOut} onClick={() => buyNow(product)}>
                <Zap size={17} />
                Buy now
              </Button>
            </div>

            <div className="mt-4 grid gap-2 border-t border-line pt-4 text-[12.5px] text-fg-muted sm:grid-cols-3">
              <p className="flex items-center gap-2">
                <Truck size={14} className="text-brand" /> Free over $150
              </p>
              <p className="flex items-center gap-2">
                <RotateCw size={14} className="text-brand" /> 15-day returns
              </p>
              <p className="flex items-center gap-2">
                <ShieldCheck size={14} className="text-brand" /> {product.specs.Warranty}
              </p>
            </div>
          </div>

          <p className="mt-4 text-[12.5px] text-fg-faint">
            Questions about fit or compatibility? Call {SUPPORT_CONTACT.phone} — the bench answers
            during {SUPPORT_CONTACT.hours}.
          </p>
        </div>
      </div>

      {/* Specs */}
      <section className="mt-16 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,460px)] lg:gap-16">
        <div>
          <h2 className="font-display text-xl font-semibold tracking-tight">Specifications</h2>
          <dl className="mt-4 divide-y divide-line overflow-hidden rounded-card border border-line bg-surface">
            {Object.entries(product.specs).map(([key, value]) => (
              <div key={key} className="flex items-baseline gap-4 px-5 py-3.5 text-sm">
                <dt className="w-40 shrink-0 text-fg-muted">{key}</dt>
                <dd className="font-medium">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div>
          <h2 className="font-display text-xl font-semibold tracking-tight">In the box</h2>
          <ul className="mt-4 space-y-2 rounded-card border border-line bg-surface p-5 text-sm text-fg-muted">
            <li>1 × {product.name}</li>
            <li>USB-C charging cable, braided</li>
            <li>Travel pouch and quick-start card</li>
            <li>Tax invoice with QR verification link</li>
          </ul>
        </div>
      </section>

      <section className="mt-16">
        <h2 className="font-display text-2xl font-semibold tracking-tight">
          Frequently bought together
        </h2>
        <ProductGrid products={getRelated(product, 4)} className="mt-6" />
      </section>
    </div>
  );
}
