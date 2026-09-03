import {
  ArrowRight,
  BadgeCheck,
  Banknote,
  QrCode,
  RotateCw,
  ShieldCheck,
  Smartphone,
  Truck,
} from "lucide-react";
import { Link } from "react-router-dom";

import { ProductArt } from "@/components/catalog/ProductArt";
import { ProductGrid } from "@/components/catalog/ProductGrid";
import { ButtonLink } from "@/components/ui/Button";
import { Stars } from "@/components/ui/Stars";
import { CATEGORIES, PRODUCTS, getFeatured } from "@/data/products";
import { MERCHANT } from "@/data/merchant";
import { PAYMENT_WINDOW_SECONDS } from "@/lib/order";
import { buildKhqrPayload } from "@/lib/emvco";
import { formatMoney } from "@/lib/format";
import { usePreferences } from "@/store/preferences";

const VALUES = [
  { icon: Truck, title: "Free over $150", body: "Standard delivery across Phnom Penh" },
  { icon: RotateCw, title: "15-day returns", body: "Unopened boxes, no restocking fee" },
  { icon: ShieldCheck, title: "Local warranty", body: "12–36 months, serviced in BKK1" },
  { icon: BadgeCheck, title: "Tax invoices", body: "E-invoice issued with every order" },
];

const QUOTES = [
  {
    quote:
      "We switched our counter to KHQR last quarter. The amount in the code means nobody keys in a total twice, so the queue moves visibly faster.",
    name: "Laksmi Rith",
    role: "Owner, BKK1 electronics shop",
    rating: 5,
  },
  {
    quote:
      "Ordered a keyboard at 21:04, scanned with my bank app, and had a receipt before I closed the laptop. The reference number matched instantly.",
    name: "Chanphaek Tron",
    role: "Buyer, Siem Reap",
    rating: 4.5,
  },
  {
    quote:
      "As a developer I checked the payload before paying. Real EMVCo tags and a correct CRC — most demo checkouts fake that part.",
    name: "Phearith S.",
    role: "Software engineer",
    rating: 5,
  },
];

/** A genuine, decodable payload used only to render the hero QR visual. */
const HERO_PAYLOAD = buildKhqrPayload({
  merchant: MERCHANT,
  currency: "USD",
  amount: 129,
  billNumber: "HERODEMO01",
  pointOfInitialization: "11",
});

export function HomePage() {
  const featured = getFeatured(8);
  const currency = usePreferences((state) => state.currency);
  const heroProducts = [PRODUCTS[2], PRODUCTS[0], PRODUCTS[9], PRODUCTS[4]];

  return (
    <>
      {/* ─── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-[88rem] items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:px-8 lg:py-24">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand/8 px-3 py-1.5 text-[12.5px] font-semibold text-brand">
              <QrCode size={14} />
              KHQR &amp; Bakong checkout built in
            </span>

            <h1 className="mt-5 font-display text-[clamp(2.5rem,6vw,4.25rem)] leading-[0.98] font-semibold tracking-tight text-balance">
              Scan once.
              <br />
              Pay.{" "}
              <span className="text-brand">Done.</span>
            </h1>

            <p className="mt-6 max-w-xl text-[17px] leading-relaxed text-fg-muted">
              A full storefront in React, TypeScript and Tailwind — catalogue, cart, and a checkout
              that encodes your order total into a real EMVCo QR. No card forms, no redirect, no
              amount typed by hand.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <ButtonLink to="/shop" size="lg">
                Shop the catalogue
                <ArrowRight size={17} />
              </ButtonLink>
              <ButtonLink to="/how-to-pay" size="lg" variant="outline">
                How the QR works
              </ButtonLink>
            </div>

            <dl className="mt-10 grid max-w-lg grid-cols-3 gap-6 border-t border-line pt-6">
              {[
                { value: `${PAYMENT_WINDOW_SECONDS / 60} min`, label: "per generated code" },
                { value: "0", label: "card details stored" },
                { value: "8", label: "partner banks accepted" },
              ].map((stat) => (
                <div key={stat.label}>
                  <dt className="font-display text-2xl font-semibold tabular-nums">{stat.value}</dt>
                  <dd className="mt-0.5 text-[12.5px] leading-snug text-fg-faint">{stat.label}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Product collage with a live KHQR card floating over it. */}
          <div className="relative">
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {heroProducts.map((product, index) => (
                <Link
                  key={product.id}
                  to={`/product/${product.slug}`}
                  className="group relative overflow-hidden rounded-card border border-line bg-surface shadow-soft transition hover:-translate-y-1 hover:shadow-lift"
                >
                  <ProductArt product={product} className="aspect-square w-full" eager={index < 2} rounded="rounded-none" />
                  <span className="absolute inset-x-3 bottom-3 truncate rounded-xl bg-canvas/85 px-3 py-1.5 text-[12.5px] font-semibold backdrop-blur-md">
                    {product.name}
                  </span>
                </Link>
              ))}
            </div>

            <div className="absolute -bottom-6 -left-4 w-[212px] rotate-[-4deg] rounded-3xl border border-line bg-canvas/95 p-4 shadow-lift backdrop-blur-xl sm:-left-8">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold tracking-[0.14em] text-fg-faint uppercase">
                  Pay with KHQR
                </span>
                <Banknote size={14} className="text-brand" />
              </div>
              <HeroQrMatrix payload={HERO_PAYLOAD} />
              <p className="mt-3 text-center font-display text-lg font-semibold tabular-nums">
                {formatMoney(129, currency)}
              </p>
              <p className="text-center text-[11px] text-fg-faint">
                {MERCHANT.name} · amount locked
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Values ───────────────────────────────────────────────────────── */}
      <section className="border-y border-line bg-surface/60">
        <div className="mx-auto grid max-w-[88rem] gap-6 px-4 py-8 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
          {VALUES.map((value) => (
            <div key={value.title} className="flex items-start gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">
                <value.icon size={17} />
              </span>
              <div>
                <p className="text-[13.5px] font-semibold">{value.title}</p>
                <p className="text-[12.5px] text-fg-muted">{value.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Categories ───────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-[88rem] px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-4">
          <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
            Browse by category
          </h2>
          <Link
            to="/shop"
            className="inline-flex items-center gap-1 text-[13.5px] font-medium text-brand transition hover:gap-2"
          >
            All products <ArrowRight size={15} />
          </Link>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CATEGORIES.map((category) => {
            const count = PRODUCTS.filter((product) => product.category === category.id).length;
            const cover = PRODUCTS.find((product) => product.category === category.id) ?? PRODUCTS[0];
            return (
              <Link
                key={category.id}
                to={`/shop?category=${category.id}`}
                className="group relative overflow-hidden rounded-card border border-line bg-surface transition hover:-translate-y-1 hover:shadow-lift"
              >
                <ProductArt product={cover} className="aspect-[4/3] w-full" rounded="rounded-none" />
                <div className="p-4">
                  <p className="font-display text-[15px] font-semibold">{category.label}</p>
                  <p className="text-[12.5px] text-fg-muted">{category.blurb}</p>
                  <p className="mt-2 text-[12px] text-fg-faint">{count} products</p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ─── Featured ─────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-[88rem] px-4 pb-16 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
              Moving fastest this week
            </h2>
            <p className="mt-1.5 text-sm text-fg-muted">
              Ranked by rating, refreshed from the catalogue data in{" "}
              <code className="rounded bg-surface-2 px-1.5 py-0.5 text-[12px]">src/data/products.ts</code>
            </p>
          </div>
        </div>
        <ProductGrid products={featured} className="mt-8" columns="default" />
      </section>

      {/* ─── How payment works ────────────────────────────────────────────── */}
      <section className="mx-auto max-w-[88rem] px-4 pb-20 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-card border border-line bg-surface">
          <div className="grid gap-8 p-8 sm:p-12 lg:grid-cols-[1fr_1.15fr] lg:items-center">
            <div>
              <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
                Checkout, in four steps
              </h2>
              <p className="mt-4 text-[15px] leading-relaxed text-fg-muted">
                KHMart builds an EMVCo Merchant-Presented payload — merchant account info, MCC,
                currency, the exact order total, and a CRC-16 checksum — then renders it locally.
                Your bank app does the authorisation; the storefront only polls for the result.
              </p>
              <ButtonLink to="/how-to-pay" variant="outline" className="mt-6">
                Read the payment flow
                <ArrowRight size={16} />
              </ButtonLink>
            </div>

            <ol className="space-y-3">
              {[
                {
                  icon: QrCode,
                  title: "Order total becomes the payload",
                  body: "Subtotal, discount, delivery and GST collapse into one field 54 amount.",
                },
                {
                  icon: Smartphone,
                  title: "Scan in any KHQR-capable app",
                  body: "Bakong and partner bank wallets read the same EMVCo tags.",
                },
                {
                  icon: Banknote,
                  title: "Amount arrives pre-filled",
                  body: "The payer confirms rather than types, which removes the miskey risk.",
                },
                {
                  icon: BadgeCheck,
                  title: "Bill reference closes the loop",
                  body: "Tag 62.01 matches the settlement notice back to this exact order.",
                },
              ].map((step, index) => (
                <li
                  key={step.title}
                  className="flex gap-4 rounded-2xl border border-line bg-surface-2/60 p-4"
                >
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand text-brand-contrast">
                    <step.icon size={18} />
                  </span>
                  <div>
                    <p className="text-[14px] font-semibold">
                      <span className="mr-2 text-fg-faint tabular-nums">0{index + 1}</span>
                      {step.title}
                    </p>
                    <p className="mt-0.5 text-[13px] text-fg-muted">{step.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* ─── Quotes ───────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-[88rem] px-4 pb-24 sm:px-6 lg:px-8">
        <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
          What early shoppers said
        </h2>
        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {QUOTES.map((item) => (
            <figure
              key={item.name}
              className="flex flex-col gap-4 rounded-card border border-line bg-surface p-6"
            >
              <Stars rating={item.rating} size={13} />
              <blockquote className="text-[14.5px] leading-relaxed text-fg-muted">
                “{item.quote}”
              </blockquote>
              <figcaption className="mt-auto">
                <p className="text-[13.5px] font-semibold">{item.name}</p>
                <p className="text-[12.5px] text-fg-faint">{item.role}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>
    </>
  );
}

/**
 * Small static matrix used only as the hero visual. The checkout QR is generated with the
 * `qrcode` renderer; this one is hand-drawn from the payload bytes so the landing page has
 * no canvas work to do while it is still animating in.
 */
function HeroQrMatrix({ payload }: { payload: string }) {
  const size = 21;
  const cells: boolean[] = [];
  let hash = 0x811c9dc5;
  for (let i = 0; i < payload.length; i += 1) {
    hash ^= payload.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  for (let i = 0; i < size * size; i += 1) {
    hash ^= hash << 13;
    hash ^= hash >>> 17;
    hash ^= hash << 5;
    hash = hash >>> 0;
    cells.push((hash & 0b1000) !== 0);
  }

  const finder = (x: number, y: number) => (
    <g key={`${x}-${y}`}>
      <rect x={x} y={y} width="7" height="7" fill="#0b1013" />
      <rect x={x + 1} y={y + 1} width="5" height="5" fill="#ffffff" />
      <rect x={x + 2} y={y + 2} width="3" height="3" fill="#0b1013" />
    </g>
  );

  const reserved = (x: number, y: number) =>
    (x < 8 && y < 8) || (x > size - 9 && y < 8) || (x < 8 && y > size - 9);

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      className="mx-auto mt-3 w-full max-w-[140px] rounded-lg bg-white p-1"
      role="img"
      aria-label="Illustrative KHQR code"
      shapeRendering="crispEdges"
    >
      {cells.map((on, index) => {
        const x = index % size;
        const y = Math.floor(index / size);
        if (reserved(x, y) || !on) return null;
        return <rect key={index} x={x} y={y} width="1" height="1" fill="#0b1013" />;
      })}
      {finder(0, 0)}
      {finder(size - 7, 0)}
      {finder(0, size - 7)}
    </svg>
  );
}
