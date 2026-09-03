import { useState } from "react";
import {
  ArrowLeft,
  Check,
  RotateCw,
  ShieldCheck,
  ShoppingBag,
  QrCode,
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
import { getProductBySlug, getRelated } from "@/data/products";
import { SUPPORT_CONTACT } from "@/data/merchant";
import { cn } from "@/lib/cn";
import { useCart } from "@/store/cart";
import { useBadgeLabel, useCategoryLabel, useProductText } from "@/i18n/domain";
import { useI18n } from "@/i18n";
import { useSpotlight } from "@/hooks/useSpotlight";
import type { Product } from "@/types";

/** Camera angles faked with transforms so the gallery is interactive without photo assets. */
const VIEW_TRANSFORMS = ["scale(1)", "scale(1.14) rotate(-6deg)", "scale(1.45) rotate(4deg)", "scale(0.86) rotate(0deg)"];

export function ProductPage() {
  const { slug } = useParams();
  const product = slug ? getProductBySlug(slug) : undefined;
  const navigate = useNavigate();
  const add = useCart((state) => state.add);
  const [qty, setQty] = useState(1);
  const [view, setView] = useState(0);
  const onPointerMove = useSpotlight();
  const { t, dict } = useI18n();
  const text = useProductText(product);
  const categoryLabel = useCategoryLabel(product?.category);
  const badgeLabel = useBadgeLabel(product?.badge, true);

  if (!product) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 sm:px-6">
        <EmptyState
          title={t("product.notListed")}
          description={t("product.notListedBody")}
          action={<ButtonLink to="/shop">{t("product.backToCatalogue")}</ButtonLink>}
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
      <nav aria-label={t("common.breadcrumb")} className="mb-6 flex items-center gap-2 text-[13px] text-fg-faint">
        <Link to="/shop" className="inline-flex items-center gap-1.5 transition hover:text-brand">
          <ArrowLeft size={14} />
          {t("product.catalogue")}
        </Link>
        <span aria-hidden="true">/</span>
        <Link to={`/shop?category=${product.category}`} className="transition hover:text-brand">
          {categoryLabel}
        </Link>
        <span aria-hidden="true">/</span>
        <span className="truncate text-fg-muted">{product.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,460px)] lg:gap-16">
        {/* Gallery */}
        <div className="space-y-4">
          <div
            onMouseMove={onPointerMove}
            className="group spotlight hairline-top relative overflow-hidden rounded-card border border-line bg-surface"
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 z-[2] opacity-0 blur-2xl transition-opacity duration-700 group-hover:opacity-100"
              style={{
                background: `radial-gradient(55% 55% at 50% 55%, ${product.hue[0]}38, transparent 72%)`,
              }}
            />
            <div className="aspect-square w-full overflow-hidden">
              <div
                className="size-full transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
                style={{ transform: VIEW_TRANSFORMS[view] }}
              >
                <ProductArt product={product} eager rounded="rounded-none" className="size-full" />
              </div>
            </div>
            {discount > 0 ? (
              <span className="absolute top-4 left-4">
                <Badge tone="gold">{t("product.discount", { percent: discount })}</Badge>
              </span>
            ) : null}
          </div>

          <div className="flex gap-3" role="tablist" aria-label={t("product.views")}>
            {VIEW_TRANSFORMS.map((transform, index) => (
              <button
                key={transform}
                type="button"
                role="tab"
                aria-selected={index === view}
                onClick={() => setView(index)}
                className={cn(
                  "group relative h-20 w-20 overflow-hidden rounded-2xl border transition duration-300 hover:-translate-y-0.5",
                  index === view
                    ? "border-brand shadow-glow ring-2 ring-brand/20"
                    : "border-line opacity-70 hover:border-line-strong hover:opacity-100",
                )}
              >
                <div
                  className="size-full"
                  style={{ transform: VIEW_TRANSFORMS[index] }}
                >
                  <ProductArt product={product} rounded="rounded-none" className="size-full" />
                </div>
                <span className="glass absolute inset-x-0 bottom-0 py-0.5 text-center text-[10.5px] font-medium">
                  {dict.product.viewLabels[index]}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Buy column */}
        <div className="lg:sticky lg:top-28 lg:self-start">
          <p className="text-[12px] font-semibold tracking-[0.16em] text-fg-faint uppercase">
            {product.brand}
          </p>
          <h1 className="mt-2 font-display text-3xl leading-tight font-semibold tracking-tight sm:text-4xl">
            {product.name}
          </h1>
          <p className="mt-2 text-[15px] text-fg-muted">{text.tagline}</p>

          <div className="mt-4 flex flex-wrap items-center gap-4">
            <Stars rating={product.rating} reviews={product.reviews} />
            <span className="inline-flex items-center gap-1.5 rounded-full border border-brand/25 bg-brand/8 px-2.5 py-1 text-[11.5px] font-semibold text-brand">
              <QrCode size={12} />
              {t("product.khqrChip")}
            </span>
            {product.badge ? (
              <Badge tone={product.badge === "limited" ? "gold" : "brand"}>
                {badgeLabel}
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

          <p className="mt-6 text-[15px] leading-relaxed text-fg-muted">{text.description}</p>

          <ul className="mt-6 grid gap-2 sm:grid-cols-2">
            {text.highlights.map((highlight) => (
              <li key={highlight} className="flex gap-2 text-[13.5px] text-fg-muted">
                <Check size={15} className="mt-0.5 shrink-0 text-brand" />
                {highlight}
              </li>
            ))}
          </ul>

          <div className="hairline-top relative mt-8 overflow-hidden rounded-card border border-line bg-surface p-5 shadow-soft">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-[13px] font-semibold">
                  {soldOut ? (
                    <span className="text-danger">{t("product.outOfStock")}</span>
                  ) : product.stock <= 6 ? (
                    <span className="text-gold">{t("product.onlyLeft", { count: product.stock })}</span>
                  ) : (
                    <span className="text-brand">{t("product.inStock")}</span>
                  )}
                </p>
                <p className="mt-0.5 text-[12.5px] text-fg-faint">
                  {t("product.stockNote")}
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
                {t("product.addToCartLabel")}
              </Button>
              <Button size="lg" variant="secondary" fullWidth disabled={soldOut} onClick={() => buyNow(product)}>
                <Zap size={17} />
                {t("product.buyNow")}
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
            {t("product.questionCta", { phone: SUPPORT_CONTACT.phone, hours: SUPPORT_CONTACT.hours })}
          </p>
        </div>
      </div>

      {/* Specs */}
      <section className="mt-16 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,460px)] lg:gap-16">
        <div>
          <h2 className="font-display text-xl font-semibold tracking-tight">{t("product.specs")}</h2>
          <dl className="mt-4 divide-y divide-line overflow-hidden rounded-card border border-line bg-surface">
            {Object.entries(product.specs).map(([key, value]) => (
              <div key={key} className="flex items-baseline gap-4 px-5 py-3.5 text-sm transition-colors hover:bg-surface-2/70">
                <dt className="w-40 shrink-0 text-fg-muted">{key}</dt>
                <dd className="font-medium">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div>
          <h2 className="font-display text-xl font-semibold tracking-tight">{t("product.inBox")}</h2>
          <ul className="mt-4 space-y-2 rounded-card border border-line bg-surface p-5 text-sm text-fg-muted">
            {dict.product.inBoxItems.map((item) => (
              <li key={item}>{item.replace("{name}", product.name)}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mt-16">
        <h2 className="font-display text-2xl font-semibold tracking-tight">
          {t("product.related")}
        </h2>
        <ProductGrid products={getRelated(product, 4)} className="mt-6" />
      </section>
    </div>
  );
}
